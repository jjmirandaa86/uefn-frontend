import {
  IconClock,
  IconFaceId,
  IconHeartFilled,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
} from "@tabler/icons-react";
import Phaser from "phaser";
import {
  ActionIcon,
  Box,
  Card,
  Group,
  Image,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalibrationScreen,
  GameOverOverlay,
  StartScreenOverlay,
  VictoryOverlay,
  WebcamOverlay,
} from "./components/GameUI.jsx";
import coinSvgUrl from "./assets/coin.svg?url";
import marioBrosFaceUrl from "./assets/mario-bros-face.png?url";
import { DEFAULT_SENSITIVITY } from "./config.js";
import "./gameShell.css";
import { useFaceGameControls } from "./hooks/useFaceGameControls.js";
import { MainGameScene } from "./scenes/MainGameScene.js";

const defaultHud = { score: 0, lives: 3, coins: 0, bossHp: 5 };

/** @param {number} ms */
function formatRunElapsed(ms) {
  const safe = Math.max(0, Math.floor(ms));
  const totalSec = Math.floor(safe / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const sceneHudChipBase = {
  padding: "6px 12px",
  borderRadius: 14,
  background: "rgba(2, 6, 23, 0.78)",
  border: "1px solid rgba(251, 191, 36, 0.45)",
  boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.35), 0 8px 20px rgba(0, 0, 0, 0.45)",
};

const sceneHudChipStyle = {
  position: "absolute",
  zIndex: 40,
  pointerEvents: "none",
  ...sceneHudChipBase,
};

const sceneHudIconFrame = {
  width: 28,
  height: 28,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const sceneHudIconDropShadow = {
  filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45))",
};

/** Chip flotante sobre el canvas: monedas, vidas o tiempo (mismo cromo). */
function SceneHudFloatChip({ positionStyle, icon, value, inline = false }) {
  return (
    <Group
      gap={8}
      wrap="nowrap"
      align="center"
      style={
        inline
          ? { ...sceneHudChipBase, pointerEvents: "none" }
          : { ...sceneHudChipStyle, ...positionStyle }
      }
    >
      <Box style={sceneHudIconFrame}>{icon}</Box>
      <Text
        fz="lg"
        fw={900}
        c="gray.0"
        lh={1}
        style={{ minWidth: "2ch", textAlign: "center" }}
      >
        {value}
      </Text>
    </Group>
  );
}

const sceneHudActionIconStyle = {
  border: "1px solid rgba(167, 139, 250, 0.35)",
  boxShadow: "0 4px 14px rgba(91, 33, 182, 0.28)",
  background: "rgba(15, 23, 42, 0.88)",
};

const sceneHudFaceTooltip =
  "Lo que la cámara está leyendo ahora: por ejemplo mirar a los lados para moverte, boca para saltar, sonrisa para sprint y ojos entrecerrados para disparar (según la calibración).";

/** Indicador de gesto facial sobre el canvas (arriba a la izquierda, junto a monedas). */
function SceneHudFaceChip({ label }) {
  return (
    <Tooltip
      label={sceneHudFaceTooltip}
      position="top"
      withArrow
      multiline
      maw={280}
      openDelay={200}
    >
      <Group
        gap={8}
        wrap="nowrap"
        align="center"
        style={{
          ...sceneHudChipBase,
          pointerEvents: "auto",
          cursor: "help",
        }}
      >
        <ThemeIcon size="sm" radius="sm" variant="light" color="violet">
          <IconFaceId size={16} stroke={1.5} />
        </ThemeIcon>
        <Text size="sm" c="gray.2" lh={1.3} style={{ whiteSpace: "nowrap" }}>
          <Text span c="gray.4" fw={600}>
            Rostro:{" "}
          </Text>
          <Text span c="gray.0" fw={700}>
            {label}
          </Text>
        </Text>
      </Group>
    </Tooltip>
  );
}

/** Botones de pausa/continuar y reiniciar sobre el canvas (solo iconos). */
function SceneHudPlayActions({ gamePaused, onPauseToggle, onRestart }) {
  return (
    <Group gap={8} wrap="nowrap" className="game-scene-hud-actions">
      {onPauseToggle ? (
        <Tooltip
          label={gamePaused ? "Continuar partida" : "Pausar partida"}
          withArrow
          position="top"
        >
          <ActionIcon
            type="button"
            size="lg"
            radius="md"
            variant="light"
            color="violet"
            aria-label={gamePaused ? "Continuar partida" : "Pausar partida"}
            style={sceneHudActionIconStyle}
            onClick={onPauseToggle}
          >
            {gamePaused ? (
              <IconPlayerPlay size={20} stroke={1.5} />
            ) : (
              <IconPlayerPause size={20} stroke={1.5} />
            )}
          </ActionIcon>
        </Tooltip>
      ) : null}
      {onRestart ? (
        <Tooltip label="Reiniciar" withArrow position="top">
          <ActionIcon
            type="button"
            size="lg"
            radius="md"
            variant="light"
            color="violet"
            aria-label="Reiniciar"
            style={sceneHudActionIconStyle}
            onClick={onRestart}
          >
            <IconRefresh size={20} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
      ) : null}
    </Group>
  );
}

/**
 * Shell principal del minijuego (Phaser + face-api) bajo `src/game`.
 * Prueba: `import GameMain from "./game/GameMain.jsx"` y renderízalo en una ruta.
 */
export default function GameMain() {
  const [phase, setPhase] = useState("start");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mountRef = useRef(null);
  const gameRef = useRef(null);
  const controlsRef = useRef({
    moveX: 0,
    mouthOpen: 0,
    sprint: false,
    smile: 0,
    eyeShoot: 0,
    label: "—",
    rawYaw: 0,
    rawMouthOpen: 0,
    rawEyeOpen: 0,
  });
  const calibRef = useRef(null);
  const sensitivityRef = useRef({ ...DEFAULT_SENSITIVITY });
  const [facialLabel, setFacialLabel] = useState("—");
  const [hud, setHud] = useState(defaultHud);
  const [gamePaused, setGamePaused] = useState(false);
  const [runElapsedMs, setRunElapsedMs] = useState(0);

  const sampleRef = controlsRef;

  const onControls = useCallback((c) => {
    Object.assign(controlsRef.current, c);
    setFacialLabel(c.label);
  }, []);

  useFaceGameControls({
    active: phase === "calibration" || phase === "playing",
    videoRef,
    canvasRef,
    calibRef,
    sensitivityRef,
    onControls,
  });

  const toggleGamePause = useCallback(() => {
    const g = gameRef.current;
    if (!g?.scene) return;
    const key = "MainGameScene";
    if (!g.scene.getScene(key)) return;
    if (g.scene.isPaused(key)) {
      g.scene.resume(key);
      setGamePaused(false);
    } else {
      g.scene.pause(key);
      setGamePaused(true);
    }
  }, []);

  useEffect(() => {
    if (phase !== "calibration" && phase !== "playing") return;
    const videoEl = videoRef.current;
    let cancelled = false;
    let stream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const el = videoRef.current ?? videoEl;
        if (el) {
          el.srcObject = stream;
          await el.play().catch(() => {});
        }
      } catch (e) {
        console.error("[GameMain] webcam:", e);
      }
    })();
    return () => {
      cancelled = true;
      stream?.getTracks?.().forEach((t) => t.stop());
      if (videoEl) videoEl.srcObject = null;
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return undefined;
    const id = window.setInterval(() => {
      setRunElapsedMs((prev) => (gamePaused ? prev : prev + 100));
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, gamePaused]);

  useEffect(() => {
    if (phase !== "playing") {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      return;
    }
    let cancelled = false;
    const tid = window.setTimeout(() => {
      const parent = mountRef.current;
      if (!parent || cancelled) return;

      const w = Math.max(320, parent.clientWidth || 640);
      const h = Math.min(580, Math.max(300, window.innerHeight * 0.62));

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent,
        width: w,
        height: h,
        backgroundColor: "#020617",
        dom: {
          createContainer: true,
        },
        physics: {
          default: "arcade",
          arcade: { debug: false },
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: [MainGameScene],
      });

      game.registry.set("controlsRef", controlsRef);
      game.registry.set(
        "eyeShootThreshold",
        sensitivityRef.current?.eyeShootThreshold ?? 0.58,
      );
      game.registry.set("onHudUpdate", (next) =>
        setHud((prev) => ({ ...prev, ...next })),
      );
      game.registry.set("onVictory", () => setPhase("victory"));
      game.registry.set("onGameOver", () => setPhase("gameover"));

      gameRef.current = game;
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(tid);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [phase]);

  const beginCalibration = () => {
    setHud(defaultHud);
    setPhase("calibration");
  };

  const cancelCalibration = () => {
    setPhase("start");
  };

  const finishCalibration = (calib) => {
    calibRef.current = calib;
    setGamePaused(false);
    setRunElapsedMs(0);
    setPhase("playing");
  };

  const restartToCalibration = useCallback(() => {
    calibRef.current = null;
    setGamePaused(false);
    Object.assign(controlsRef.current, {
      moveX: 0,
      mouthOpen: 0,
      sprint: false,
      smile: 0,
      eyeShoot: 0,
      label: "—",
      rawYaw: 0,
      rawMouthOpen: 0,
      rawEyeOpen: 0,
    });
    setFacialLabel("—");
    setHud(defaultHud);
    setPhase("calibration");
  }, []);

  const retry = () => {
    setHud(defaultHud);
    setRunElapsedMs(0);
    setPhase("start");
  };

  return (
    <div className="game-shell">
      {phase === "start" && (
        <StartScreenOverlay onBeginCalibration={beginCalibration} />
      )}
      {phase === "calibration" && (
        <CalibrationScreen
          sampleRef={sampleRef}
          videoRef={videoRef}
          canvasRef={canvasRef}
          onDone={finishCalibration}
          onCancel={cancelCalibration}
        />
      )}
      {phase === "playing" && (
        <Card
          component="section"
          withBorder
          radius="lg"
          padding={0}
          w="100%"
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            borderColor: "rgba(167, 139, 250, 0.38)",
            background:
              "linear-gradient(180deg, rgba(24, 24, 56, 0.55) 0%, rgba(2, 6, 23, 0.92) 100%)",
            boxShadow:
              "0 0 0 1px rgba(139, 92, 246, 0.12), 0 18px 48px rgba(0, 0, 0, 0.42)",
          }}
        >
          <Card.Section
            withBorder
            inheritPadding={false}
            py="xs"
            px="md"
            style={{
              borderColor: "rgba(148, 163, 184, 0.22)",
              background: "rgba(15, 23, 42, 0.72)",
            }}
          >
            <Group gap="sm" wrap="nowrap" align="center">
              <Image
                src={marioBrosFaceUrl}
                alt=""
                w={44}
                h={44}
                radius="md"
                fit="cover"
                style={{
                  flexShrink: 0,
                  boxShadow: "0 0 0 1px rgba(167, 139, 250, 0.4)",
                }}
              />
              <Title
                order={3}
                c="gray.0"
                fz={{ base: "1.05rem", sm: "1.3rem" }}
                fw={900}
                lh={1.15}
                style={{
                  letterSpacing: "0.14em",
                }}
              >
                MARIO ADVENTURE
              </Title>
            </Group>
          </Card.Section>
          <Box
            p="md"
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              position: "relative",
            }}
          >
            <div
              ref={mountRef}
              className="game-canvas-host"
              style={{
                flex: 1,
                minHeight: 280,
                width: "100%",
                border: "none",
              }}
            />
            <Stack gap={8} className="game-scene-hud-top-left">
              <SceneHudFloatChip
                inline
                icon={
                  <Image
                    src={coinSvgUrl}
                    alt=""
                    w={24}
                    h={24}
                    fit="contain"
                    style={sceneHudIconDropShadow}
                  />
                }
                value={hud.coins}
              />
              <SceneHudFaceChip label={facialLabel} />
            </Stack>
            <SceneHudFloatChip
              positionStyle={{ bottom: 35, left: 35 }}
              icon={
                <IconHeartFilled
                  size={22}
                  color="#f87171"
                  style={sceneHudIconDropShadow}
                />
              }
              value={hud.lives}
            />
            <SceneHudFloatChip
              positionStyle={{
                top: 35,
                left: "50%",
                transform: "translateX(-50%)",
              }}
              icon={
                <IconClock
                  size={22}
                  stroke={1.55}
                  color="#fde68a"
                  style={sceneHudIconDropShadow}
                />
              }
              value={formatRunElapsed(runElapsedMs)}
            />
            <Box className="game-scene-hud-webcam-wrap">
              <WebcamOverlay videoRef={videoRef} canvasRef={canvasRef} />
            </Box>
            <SceneHudPlayActions
              gamePaused={gamePaused}
              onPauseToggle={toggleGamePause}
              onRestart={restartToCalibration}
            />
          </Box>
        </Card>
      )}

      {phase === "gameover" && (
        <GameOverOverlay
          onRetry={retry}
          runTimeLabel={formatRunElapsed(runElapsedMs)}
          score={hud.score}
        />
      )}
      {phase === "victory" && (
        <VictoryOverlay
          onRetry={retry}
          runTimeLabel={formatRunElapsed(runElapsedMs)}
        />
      )}
    </div>
  );
}
