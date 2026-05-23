import { useCallback, useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBroadcast,
  IconCamera,
  IconPlayerPause,
  IconPlayerPlay,
  IconVideoOff,
} from "@tabler/icons-react";
import { useDashboardLiveSession } from "../../hooks/useDashboardLiveSession.js";
import {
  APPROXIMATE_PROFILE_IDLE,
  EMOTION_ROWS_IDLE,
  NEUTRAL_FALLBACK,
} from "../../dashboard/liveEmotionDefaults.js";
import { detectFacesLandmarksExpressionsFromVideo } from "../../services/faceApi.js";
import {
  faceEmotionSlotKey,
  sendEmotionCaptureToBackend,
} from "../../utils/emotionCapture.js";
import {
  evaluateEmotionCaptureReadiness,
  getEmotionCapturePolicy,
  isConfidenceStillStable,
} from "../../utils/emotionCapturePolicy.js";
import { createFaceTracker } from "../../utils/faceTracker.js";
import { mapFaceApiToEmotion, mapFaceExpressionsToEmotionRows } from "../../utils/mapFaceApiToEmotion.js";

function pickPrimaryFace(results) {
  if (!results?.length) return null;
  return results.reduce((a, b) => {
    const ba = a.detection?.box;
    const bb = b.detection?.box;
    const areaA = ba ? ba.width * ba.height : 0;
    const areaB = bb ? bb.width * bb.height : 0;
    return areaB > areaA ? b : a;
  });
}

function statusSubtitle(status) {
  switch (status) {
    case "ready":
      return "Cámara activa";
    case "requesting":
      return "Solicitando acceso a la cámara…";
    case "insecure":
      return "Se requiere HTTPS para la cámara";
    case "unsupported":
      return "Este navegador no permite acceso a la cámara";
    case "denied":
      return "Permiso de cámara denegado";
    default:
      return "Listo para activar la vista previa";
  }
}

const CAPTURE_FILENAME_NOTICE_MS = 3000;

export function DashboardCameraStage({
  videoRef,
  status,
  startCamera,
  stopCamera,
}) {
  const {
    liveEmotion,
    setLiveEmotion,
    setEmotionRows,
    setApproximateProfile,
    pauseSessionTimer,
    resumeSessionTimer,
    setCurrentFaceUser,
  } = useDashboardLiveSession();
  const lastFaceUserEmittedRef = useRef(null);
  const landmarksCanvasRef = useRef(null);
  const facialPointsEnabledRef = useRef(true);
  const isPreviewPausedRef = useRef(false);
  const approximateEmitRef = useRef({ ageYears: null, gender: null });
  const faceTrackerRef = useRef(null);
  /** Rostro + emoción ya guardados o descartados (sesión / disco). */
  const capturedFaceEmotionsRef = useRef(new Set());
  const captureInFlightRef = useRef(new Set());
  /**
   * @type {React.MutableRefObject<{
   *   slotKey: string;
   *   since: number;
   *   peakConfidence: number;
   *   minConfidence: number;
   * } | null>}
   */
  const capturePendingRef = useRef(null);
  const capturePolicy = getEmotionCapturePolicy();
  const [captureNoticeFilename, setCaptureNoticeFilename] = useState(null);
  const captureNoticeTimerRef = useRef(null);
  const [facialPointsEnabled, setFacialPointsEnabled] = useState(true);
  const [isPreviewPaused, setIsPreviewPaused] = useState(false);
  const prevStatusForFacialRef = useRef(status);

  const flashCaptureFilename = useCallback((filename) => {
    if (!filename) return;
    if (captureNoticeTimerRef.current) {
      clearTimeout(captureNoticeTimerRef.current);
    }
    setCaptureNoticeFilename(filename);
    captureNoticeTimerRef.current = setTimeout(() => {
      setCaptureNoticeFilename(null);
      captureNoticeTimerRef.current = null;
    }, CAPTURE_FILENAME_NOTICE_MS);
  }, []);

  const flashCaptureFilenameRef = useRef(flashCaptureFilename);
  flashCaptureFilenameRef.current = flashCaptureFilename;

  useEffect(() => {
    return () => {
      if (captureNoticeTimerRef.current) {
        clearTimeout(captureNoticeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    facialPointsEnabledRef.current = facialPointsEnabled;
  }, [facialPointsEnabled]);

  useEffect(() => {
    if (status === "ready" && prevStatusForFacialRef.current !== "ready") {
      setFacialPointsEnabled(true);
      facialPointsEnabledRef.current = true;
    }
    prevStatusForFacialRef.current = status;
  }, [status]);

  useEffect(() => {
    isPreviewPausedRef.current = isPreviewPaused;
  }, [isPreviewPaused]);

  useEffect(() => {
    if (status !== "ready") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- al cortar la cámara debe desactivarse la pausa local
      setIsPreviewPaused(false);
      isPreviewPausedRef.current = false;
      faceTrackerRef.current?.reset();
      capturedFaceEmotionsRef.current.clear();
      captureInFlightRef.current.clear();
      capturePendingRef.current = null;
      setCaptureNoticeFilename(null);
      if (captureNoticeTimerRef.current) {
        clearTimeout(captureNoticeTimerRef.current);
        captureNoticeTimerRef.current = null;
      }
    }
  }, [status]);

  useEffect(() => {
    if (status === "ready" && !faceTrackerRef.current) {
      faceTrackerRef.current = createFaceTracker();
    }
  }, [status]);

  const togglePreviewPause = useCallback(() => {
    const el = videoRef?.current;
    if (!el || status !== "ready") return;
    setIsPreviewPaused((was) => {
      const next = !was;
      isPreviewPausedRef.current = next;
      if (next) {
        pauseSessionTimer();
        void el.pause();
      } else {
        resumeSessionTimer();
        void el.play().catch(() => {});
      }
      return next;
    });
  }, [
    videoRef,
    status,
    pauseSessionTimer,
    resumeSessionTimer,
  ]);

  useEffect(() => {
    const canvas = landmarksCanvasRef.current;
    if (status !== "ready") {
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        canvas.width = 0;
        canvas.height = 0;
      }
      return undefined;
    }

    let cancelled = false;
    let rafId = 0;
    let busy = false;

    const loop = () => {
      if (cancelled) return;
      rafId = requestAnimationFrame(async () => {
        if (cancelled) return;
        const video = videoRef?.current;
        const c = landmarksCanvasRef.current;
        if (!video || video.readyState < 2) {
          if (!cancelled) loop();
          return;
        }
        if (isPreviewPausedRef.current) {
          if (!cancelled) loop();
          return;
        }
        if (busy) {
          if (!cancelled) loop();
          return;
        }
        busy = true;
        try {
          const results = await detectFacesLandmarksExpressionsFromVideo(video);
          if (cancelled) return;

          const primary = pickPrimaryFace(results);

          const emitApproximateIdle = () => {
            const last = approximateEmitRef.current;
            if (last.ageYears !== null || last.gender !== null) {
              approximateEmitRef.current = { ageYears: null, gender: null };
              setApproximateProfile(APPROXIMATE_PROFILE_IDLE);
            }
          };

          const emitApproximateFromFace = (face) => {
            const rawAge = face?.age;
            const rawGender = face?.gender;
            const gender =
              rawGender === "male" || rawGender === "female" ? rawGender : null;
            const ageYears =
              typeof rawAge === "number" && Number.isFinite(rawAge)
                ? Math.max(0, Math.round(rawAge))
                : null;
            if (gender == null || ageYears == null) {
              emitApproximateIdle();
              return;
            }
            const last = approximateEmitRef.current;
            if (last.ageYears === ageYears && last.gender === gender) return;
            approximateEmitRef.current = { ageYears, gender };
            setApproximateProfile({ hasFace: true, ageYears, gender });
          };

          const emitFaceUser = (faceId) => {
            if (lastFaceUserEmittedRef.current === faceId) return;
            lastFaceUserEmittedRef.current = faceId;
            setCurrentFaceUser(faceId);
          };

          if (!primary) {
            capturePendingRef.current = null;
            if (lastFaceUserEmittedRef.current !== null) {
              lastFaceUserEmittedRef.current = null;
              setCurrentFaceUser(null);
            }
            emitApproximateIdle();
            setLiveEmotion((prev) => {
              const next = NEUTRAL_FALLBACK;
              if (
                prev.key === next.key &&
                prev.confidence === next.confidence
              ) {
                return prev;
              }
              return next;
            });
            setEmotionRows((prev) => {
              const allZero = prev.every((r) => r.confidence === 0);
              return allZero ? prev : EMOTION_ROWS_IDLE;
            });
          } else {
            emitApproximateFromFace(primary);

            if (!primary?.expressions) {
              if (lastFaceUserEmittedRef.current !== null) {
                lastFaceUserEmittedRef.current = null;
                setCurrentFaceUser(null);
              }
              setLiveEmotion((prev) => {
                const next = NEUTRAL_FALLBACK;
                if (
                  prev.key === next.key &&
                  prev.confidence === next.confidence
                ) {
                  return prev;
                }
                return next;
              });
              setEmotionRows((prev) => {
                const allZero = prev.every((r) => r.confidence === 0);
                return allZero ? prev : EMOTION_ROWS_IDLE;
              });
            } else {
              const next = mapFaceApiToEmotion(primary.expressions);
              setLiveEmotion((prev) => {
                if (
                  prev.key === next.key &&
                  Math.abs(prev.confidence - next.confidence) < 2
                ) {
                  return prev;
                }
                return next;
              });
              const rows = mapFaceExpressionsToEmotionRows(primary.expressions);
              setEmotionRows((prev) => {
                if (
                  prev.length === rows.length &&
                  prev.every((p, i) => p.confidence === rows[i].confidence)
                ) {
                  return prev;
                }
                return rows;
              });

              const tracker = faceTrackerRef.current;
              const descriptor = primary.descriptor;
              const box = primary.detection?.box;
              const captureReadiness = evaluateEmotionCaptureReadiness(
                primary.expressions,
              );

              if (
                tracker &&
                descriptor &&
                box &&
                captureReadiness.ready &&
                !cancelled
              ) {
                const { faceId, isStable } = tracker.resolveFaceId(descriptor);
                if (isStable) {
                  emitFaceUser(faceId);
                  const emotionForCapture = captureReadiness.emotion;
                  const slotKey = faceEmotionSlotKey(
                    faceId,
                    emotionForCapture.key,
                  );
                  const alreadySaved =
                    capturedFaceEmotionsRef.current.has(slotKey);
                  const saving = captureInFlightRef.current.has(slotKey);

                  if (alreadySaved || saving) {
                    if (capturePendingRef.current?.slotKey === slotKey) {
                      capturePendingRef.current = null;
                    }
                  } else {
                    const now = Date.now();
                    const pending = capturePendingRef.current;
                    const minConf = captureReadiness.minConfidence;
                    const conf = captureReadiness.confidence;

                    if (
                      pending &&
                      pending.slotKey === slotKey &&
                      !isConfidenceStillStable(
                        conf,
                        pending.minConfidence,
                        capturePolicy.confidenceHysteresis,
                      )
                    ) {
                      capturePendingRef.current = null;
                    }

                    const active = capturePendingRef.current;
                    if (!active || active.slotKey !== slotKey) {
                      capturePendingRef.current = {
                        slotKey,
                        since: now,
                        peakConfidence: conf,
                        minConfidence: minConf,
                      };
                    } else {
                      active.peakConfidence = Math.max(
                        active.peakConfidence,
                        conf,
                      );
                      if (
                        now - active.since >= capturePolicy.delayMs
                      ) {
                        const peak = active.peakConfidence;
                        capturePendingRef.current = null;
                        captureInFlightRef.current.add(slotKey);
                        void sendEmotionCaptureToBackend({
                          video,
                          box,
                          faceId,
                          emotion: {
                            ...emotionForCapture,
                            confidence: peak,
                          },
                          capturedAt: now,
                        })
                        .then((result) => {
                          if (result.ok) {
                            capturedFaceEmotionsRef.current.add(slotKey);
                            const name =
                              result.metadata?.nombreArchivo ?? null;
                            if (name) flashCaptureFilenameRef.current(name);
                            if (result.skipped) {
                              console.info(
                                "[emotion-capture] backend ya tenía:",
                                name,
                              );
                            } else {
                              console.info(
                                "[emotion-capture] enviada al backend:",
                                name,
                              );
                            }
                          } else {
                            console.warn("[emotion-capture]", result.error);
                          }
                        })
                        .catch((err) => {
                          console.error("[emotion-capture]", err);
                        })
                        .finally(() => {
                          captureInFlightRef.current.delete(slotKey);
                        });
                      }
                    }
                  }
                } else {
                  if (lastFaceUserEmittedRef.current !== null) {
                    lastFaceUserEmittedRef.current = null;
                    setCurrentFaceUser(null);
                  }
                  if (capturePendingRef.current) {
                    capturePendingRef.current = null;
                  }
                }
              } else if (capturePendingRef.current) {
                capturePendingRef.current = null;
              }
            }
          }

          if (facialPointsEnabledRef.current && c && results?.length) {
            const vw = video.videoWidth;
            const vh = video.videoHeight;
            const dw = video.clientWidth;
            const dh = video.clientHeight;
            if (vw && vh && dw && dh) {
              const dpr = window.devicePixelRatio || 1;
              c.width = Math.max(1, Math.floor(dw * dpr));
              c.height = Math.max(1, Math.floor(dh * dpr));
              c.style.width = `${dw}px`;
              c.style.height = `${dh}px`;

              const ctx = c.getContext("2d");
              if (ctx) {
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                ctx.clearRect(0, 0, dw, dh);
                const sx = dw / vw;
                const sy = dh / vh;
                ctx.fillStyle = "rgba(248, 250, 252, 0.78)";
                ctx.strokeStyle = "rgba(196, 181, 253, 0.35)";
                ctx.lineWidth = 1;

                for (const det of results) {
                  const pts = det.landmarks?.positions;
                  if (!pts) continue;
                  for (const p of pts) {
                    const x = p.x * sx;
                    const y = p.y * sy;
                    ctx.beginPath();
                    ctx.arc(x, y, 2.1, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                  }
                }
              }
            }
          } else if (c && !facialPointsEnabledRef.current) {
            const ctx = c.getContext("2d");
            if (ctx) {
              ctx.setTransform(1, 0, 0, 1, 0, 0);
              ctx.clearRect(0, 0, c.width, c.height);
            }
            c.width = 0;
            c.height = 0;
          }
        } catch (e) {
          console.error("[DashboardCameraStage] face pipeline:", e);
        } finally {
          busy = false;
          if (!cancelled) loop();
        }
      });
    };

    loop();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      approximateEmitRef.current = { ageYears: null, gender: null };
      faceTrackerRef.current?.reset();
      capturedFaceEmotionsRef.current.clear();
      captureInFlightRef.current.clear();
      capturePendingRef.current = null;
      setCaptureNoticeFilename(null);
      if (captureNoticeTimerRef.current) {
        clearTimeout(captureNoticeTimerRef.current);
        captureNoticeTimerRef.current = null;
      }
      lastFaceUserEmittedRef.current = null;
      setCurrentFaceUser(null);
      setLiveEmotion(NEUTRAL_FALLBACK);
      setEmotionRows(EMOTION_ROWS_IDLE);
      setApproximateProfile(APPROXIMATE_PROFILE_IDLE);
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        canvas.width = 0;
        canvas.height = 0;
      }
    };
  }, [
    status,
    videoRef,
    setLiveEmotion,
    setEmotionRows,
    setApproximateProfile,
    setCurrentFaceUser,
  ]);

  const handleSnapshot = useCallback(() => {
    const el = videoRef?.current;
    if (!el || el.readyState < 2) return;
    const w = el.videoWidth;
    const h = el.videoHeight;
    if (!w || !h) return;
    const snap = document.createElement("canvas");
    snap.width = w;
    snap.height = h;
    const ctx = snap.getContext("2d");
    if (!ctx) return;
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(el, 0, 0, w, h);
    snap.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `moodvision-captura-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [videoRef]);

  const snapshotDisabled = status !== "ready";
  const overlayLabel = liveEmotion.label;

  return (
    <section className="center-stage">
      <div className="camera-panel camera-panel--stage">
        <Box className="dcs-stage-header">
          <Box className="dcs-stage-header__lead">
            <Box className="dcs-stage-header__titles">
              <Group gap="sm" wrap="nowrap" align="flex-start">
                <Box
                  mt={4}
                  w={10}
                  h={10}
                  bg="violet.5"
                  style={{ borderRadius: 999, flexShrink: 0 }}
                />
                <Stack gap={2}>
                  <Text size="sm" fw={600} c="gray.0">
                    Vista en tiempo real
                  </Text>
                  <Text size="xs" c="dimmed">
                    {statusSubtitle(status)}
                  </Text>
                </Stack>
              </Group>
            </Box>
            {status === "ready" ? (
              <Badge
                variant="outline"
                color="violet"
                size="lg"
                radius="xl"
                leftSection={<IconBroadcast size={14} stroke={1.75} />}
                className="dcs-stage-header__live-badge"
                styles={{
                  root: {
                    borderColor: "rgba(167, 139, 250, 0.55)",
                    color: "#e9d5ff",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 700,
                  },
                }}
              >
                {isPreviewPaused ? "PAUSA" : "LIVE"}
              </Badge>
            ) : null}
          </Box>
          {status === "ready" ? (
            <Group
              gap="sm"
              wrap="nowrap"
              align="center"
              className="dcs-stage-header__actions"
            >
              <Button
                type="button"
                size="sm"
                variant="light"
                color="yellow"
                leftSection={
                  isPreviewPaused ? (
                    <IconPlayerPlay size={16} stroke={1.75} />
                  ) : (
                    <IconPlayerPause size={16} stroke={1.75} />
                  )
                }
                onClick={togglePreviewPause}
              >
                {isPreviewPaused ? "Reanudar" : "Pausar"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="light"
                color="red"
                leftSection={<IconVideoOff size={16} stroke={1.75} />}
                onClick={stopCamera}
              >
                Detener camara
              </Button>
            </Group>
          ) : (
            <Badge
              variant="light"
              color="gray"
              size="md"
              radius="xl"
              styles={{ root: { opacity: 0.85, flexShrink: 0 } }}
            >
              OFF
            </Badge>
          )}
        </Box>

        <div className="dcs-video-shell">
          <video
            ref={videoRef}
            className="camera-video"
            data-paused={isPreviewPaused || undefined}
            autoPlay
            muted
            playsInline
          />

          {status === "ready" && (
            <canvas
              ref={landmarksCanvasRef}
              className="dcs-landmarks-canvas"
              aria-hidden
            />
          )}

          {status !== "ready" && (
            <div className="camera-placeholder camera-placeholder--dcs">
              <div className="face-frame face-frame--dcs" />
              <Text fw={800} size="xl" c="gray.0">
                Vista previa IA
              </Text>
              {typeof window !== "undefined" && !window.isSecureContext && (
                <Text size="sm" c="orange.3" maw={440} ta="center" lh={1.55}>
                  Por seguridad del navegador, la camara no esta disponible con{" "}
                  <Text span fw={800} component="span">
                    http://
                  </Text>{" "}
                  en esta direccion (IP de red). Abre la misma app con{" "}
                  <Text span fw={800} component="span">
                    https://
                  </Text>{" "}
                  (puerto {window.location.port || "5173"}). El certificado es
                  de desarrollo: acepta la advertencia del navegador.
                </Text>
              )}
              <Text c="dimmed" maw={420} ta="center">
                Activa la camara para conectar la deteccion facial.
              </Text>
              {status === "insecure" && (
                <Button
                  mt="xs"
                  variant="light"
                  color="gray"
                  type="button"
                  onClick={stopCamera}
                >
                  Cerrar aviso
                </Button>
              )}
              <Button
                mt="md"
                type="button"
                onClick={startCamera}
                disabled={status === "requesting"}
                color="violet"
                variant="filled"
              >
                Activar camara
              </Button>
            </div>
          )}

          {status === "ready" && (
            <Box className="dcs-facial-points-check">
              <Checkbox
                label="Puntos faciales"
                checked={facialPointsEnabled}
                onChange={(e) =>
                  setFacialPointsEnabled(e.currentTarget.checked)
                }
                color="violet"
                size="sm"
                styles={{
                  label: {
                    color: "rgba(248, 250, 252, 0.95)",
                    fontWeight: 600,
                  },
                  input: { cursor: "pointer" },
                }}
              />
            </Box>
          )}

          {status === "ready" && (
            <div className="dcs-bottom-strip">
              <Group
                align="flex-end"
                justify="space-between"
                wrap="nowrap"
                gap="md"
                w="100%"
              >
                <Stack gap={6} style={{ minWidth: 0 }}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Emoción detectada
                  </Text>
                  <Group gap="sm" wrap="nowrap" align="center">
                    <Text component="span" fz="2rem" lh={1} aria-hidden>
                      {liveEmotion.emoji}
                    </Text>
                    <Text
                      size="xl"
                      fw={800}
                      style={{
                        lineHeight: 1.1,
                        color: liveEmotion.color,
                      }}
                    >
                      {overlayLabel}
                    </Text>
                  </Group>
                </Stack>
                <Text
                  size="2.25rem"
                  fw={800}
                  c="gray.0"
                  style={{ flexShrink: 0, lineHeight: 1 }}
                >
                  {liveEmotion.confidence}%
                </Text>
                <Box className="dcs-capture-notice" aria-live="polite">
                  {captureNoticeFilename ? (
                    <Text
                      size="xs"
                      fw={600}
                      c="violet.2"
                      className="dcs-capture-notice__filename"
                      title={captureNoticeFilename}
                    >
                      {captureNoticeFilename}
                    </Text>
                  ) : null}
                </Box>
              </Group>
            </div>
          )}
        </div>

        <UnstyledButton
          type="button"
          className="dcs-snapshot-btn"
          onClick={handleSnapshot}
          disabled={snapshotDisabled}
          data-disabled={snapshotDisabled || undefined}
        >
          <Group justify="center" gap="sm" wrap="nowrap">
            <IconCamera size={20} stroke={1.6} />
            <Text size="sm" fw={600}>
              Capturar instantánea
            </Text>
          </Group>
        </UnstyledButton>
      </div>
    </section>
  );
}
