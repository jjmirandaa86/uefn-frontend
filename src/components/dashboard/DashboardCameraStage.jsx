import { useCallback, useId, useState } from "react";
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
import { IconBroadcast, IconCamera, IconVideoOff } from "@tabler/icons-react";
import { emotions } from "../../data/emotions.js";

const PREVIEW_EMOTION = [...emotions].sort(
  (a, b) => b.confidence - a.confidence,
)[0];

const OVERLAY_LABEL =
  PREVIEW_EMOTION.key === "happy" ? "Felicidad" : PREVIEW_EMOTION.label;

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

function DcsSparkline() {
  const gradId = `dcsSparkFill-${useId().replace(/:/g, "")}`;
  const pts = "2,34 18,30 34,32 50,22 66,26 82,12 98,16";
  return (
    <svg
      className="dcs-sparkline"
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#${gradId})`} points={`0,40 ${pts} 100,40`} />
      <polyline
        fill="none"
        stroke="#c4b5fd"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
      <circle cx="98" cy="16" r="2.8" fill="#f8fafc" />
    </svg>
  );
}

function FaceDecorOverlay() {
  return (
    <div className="dcs-face-overlay" aria-hidden>
      <svg
        className="dcs-face-mesh"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid meet"
      >
        <g stroke="rgba(248,250,252,0.22)" strokeWidth="0.6" fill="none">
          <path d="M100 40 L100 160 M60 70 L140 70 M70 100 L130 100 M75 130 L125 130" />
          <path d="M60 55 Q100 35 140 55 M55 100 Q100 75 145 100 M65 145 Q100 165 135 145" />
          <ellipse cx="100" cy="105" rx="52" ry="64" />
        </g>
      </svg>
      <span className="dcs-bracket dcs-bracket--tl" />
      <span className="dcs-bracket dcs-bracket--tr" />
      <span className="dcs-bracket dcs-bracket--bl" />
      <span className="dcs-bracket dcs-bracket--br" />
    </div>
  );
}

export function DashboardCameraStage({
  videoRef,
  status,
  startCamera,
  stopCamera,
}) {
  const [facialPointsEnabled, setFacialPointsEnabled] = useState(true);
  const confidence = PREVIEW_EMOTION.confidence;

  const handleSnapshot = useCallback(() => {
    const el = videoRef?.current;
    if (!el || el.readyState < 2) return;
    const w = el.videoWidth;
    const h = el.videoHeight;
    if (!w || !h) return;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(el, 0, 0, w, h);
    canvas.toBlob((blob) => {
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

  return (
    <section className="center-stage">
      <div className="camera-panel camera-panel--stage">
        <Group
          justify="space-between"
          align="flex-start"
          wrap="nowrap"
          gap="md"
        >
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
          {status === "ready" ? (
            <Group gap="sm" wrap="nowrap" align="center">
              <Badge
                variant="outline"
                color="violet"
                size="lg"
                radius="xl"
                leftSection={<IconBroadcast size={14} stroke={1.75} />}
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
                LIVE
              </Badge>
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
              styles={{ root: { opacity: 0.85 } }}
            >
              OFF
            </Badge>
          )}
        </Group>

        <div className="dcs-video-shell">
          <video
            ref={videoRef}
            className="camera-video"
            autoPlay
            muted
            playsInline
          />

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
                  label: { color: "rgba(248, 250, 252, 0.95)", fontWeight: 600 },
                  input: { cursor: "pointer" },
                }}
              />
            </Box>
          )}

          {status === "ready" && facialPointsEnabled && <FaceDecorOverlay />}
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
                      {PREVIEW_EMOTION.emoji}
                    </Text>
                    <Text
                      size="xl"
                      fw={800}
                      c="violet.3"
                      style={{ lineHeight: 1.1 }}
                    >
                      {OVERLAY_LABEL}
                    </Text>
                  </Group>
                </Stack>
                <Text
                  size="2.25rem"
                  fw={800}
                  c="gray.0"
                  style={{ flexShrink: 0, lineHeight: 1 }}
                >
                  {confidence}%
                </Text>
                <Box className="dcs-sparkline-wrap">
                  <DcsSparkline />
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
