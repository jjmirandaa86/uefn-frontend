import Phaser from "phaser";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalibrationScreen,
  GameHUD,
  GameOverOverlay,
  StartScreenOverlay,
  VictoryOverlay,
  WebcamOverlay,
} from "./components/GameUI.jsx";
import { DEFAULT_SENSITIVITY } from "./config.js";
import "./gameShell.css";
import { useFaceGameControls } from "./hooks/useFaceGameControls.js";
import { MainGameScene } from "./scenes/MainGameScene.js";

const defaultHud = { score: 0, lives: 3, coins: 0, bossHp: 5 };

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
      {(phase === "playing" ||
        phase === "gameover" ||
        phase === "victory") && (
        <div className="game-shell__top">
          <GameHUD
            hud={hud}
            facialLabel={facialLabel}
            variant="bar"
            onRestart={phase === "playing" ? restartToCalibration : undefined}
            onPauseToggle={
              phase === "playing" ? toggleGamePause : undefined
            }
            gamePaused={phase === "playing" && gamePaused}
          />
          <WebcamOverlay videoRef={videoRef} canvasRef={canvasRef} />
        </div>
      )}

      {phase === "playing" && (
        <div ref={mountRef} className="game-canvas-host" />
      )}

      {phase === "gameover" && <GameOverOverlay onRetry={retry} />}
      {phase === "victory" && <VictoryOverlay onRetry={retry} />}
    </div>
  );
}
