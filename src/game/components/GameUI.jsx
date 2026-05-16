import React from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";

/**
 * @param {"sm" | "lg"} [size] — `lg` en calibración para ver gestos y landmarks con claridad.
 */
export function WebcamOverlay({ videoRef, canvasRef, size = "sm" }) {
  const large = size === "lg";
  const videoW = large ? 640 : 180;
  const videoH = large ? 480 : 135;
  const canvasW = large ? 640 : 360;
  const canvasH = large ? 480 : 270;

  return (
    <Box
      pos="relative"
      w={
        large
          ? { base: "100%", sm: "min(100%, 560px)" }
          : { base: 140, sm: 180 }
      }
      maw={large ? 640 : undefined}
      mx={large ? "auto" : undefined}
      style={{
        flexShrink: 0,
        borderRadius: large ? 16 : 12,
        overflow: "hidden",
        border: large ? "1px solid rgba(167, 139, 250, 0.35)" : undefined,
        boxShadow: large
          ? "0 0 0 1px rgba(139, 92, 246, 0.15), 0 16px 40px rgba(0, 0, 0, 0.35)"
          : undefined,
      }}
    >
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        width={videoW}
        height={videoH}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          transform: "scaleX(-1)",
          background: "#020617",
        }}
      />
      <canvas
        ref={canvasRef}
        width={canvasW}
        height={canvasH}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}

export function GameHUD({ hud, facialLabel, onRestart }) {
  return (
    <Stack gap="sm" className="game-hud" style={{ minWidth: 0, flex: 1 }}>
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
        <Title order={4} c="gray.0" fz="clamp(0.95rem, 3vw, 1.1rem)">
          HUD
        </Title>
        {onRestart ? (
          <Button
            type="button"
            variant="light"
            color="violet"
            size="xs"
            radius="md"
            fw={700}
            onClick={onRestart}
            title="Volver a calibrar y empezar de cero"
          >
            Reiniciar
          </Button>
        ) : null}
      </Group>
      <Text size="sm" c="violet.2" fw={700}>
        Puntos: {hud.score} · Monedas: {hud.coins} · Vidas: {hud.lives} · Jefe:{" "}
        {hud.bossHp}
      </Text>
      <Text size="xs" c="dimmed" lineClamp={2}>
        Rostro: {facialLabel}
      </Text>
    </Stack>
  );
}

const START_FACE_CONTROLS = [
  {
    emoji: "↔️",
    title: "Mover",
    hint: "Gira la cabeza a izquierda o derecha.",
  },
  {
    emoji: "😮",
    title: "Saltar",
    hint: "Abre la boca.",
  },
  {
    emoji: "😁",
    title: "Sprint",
    hint: "Sonríe.",
  },
  {
    emoji: "😑",
    title: "Disparar",
    hint: "Entrecierra los ojos.",
  },
];

export function StartScreenOverlay({ onBeginCalibration }) {
  return (
    <Stack
      align="center"
      justify="center"
      gap="lg"
      py={{ base: "lg", sm: "xl" }}
      px="md"
      className="game-overlay--start"
    >
      <Paper
        component="section"
        radius="xl"
        p={{ base: "lg", sm: "xl" }}
        maw={520}
        w="100%"
        withBorder
        shadow="xl"
        style={{
          background:
            "linear-gradient(160deg, rgba(46, 16, 101, 0.55) 0%, rgba(15, 23, 42, 0.94) 42%, rgba(2, 6, 23, 0.98) 100%)",
          borderColor: "rgba(167, 139, 250, 0.35)",
          boxShadow:
            "0 0 0 1px rgba(139, 92, 246, 0.12), 0 20px 50px rgba(0, 0, 0, 0.45)",
        }}
      >
        <Stack gap="lg" align="stretch">
          <Stack gap="xs" align="center">
            <Badge
              variant="light"
              color="violet"
              size="xl"
              radius="lg"
              tt="uppercase"
              styles={{
                root: {
                  paddingInline: "1.25rem",
                  paddingBlock: "0.55rem",
                },
                label: {
                  fontSize: "clamp(0.8rem, 2.6vw, 0.95rem)",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                },
              }}
            >
              Sin teclado · solo rostro
            </Badge>
            <Title
              order={2}
              ta="center"
              c="gray.0"
              fz={{ base: "1.35rem", sm: "1.65rem" }}
              fw={800}
              style={{ letterSpacing: "-0.02em", lineHeight: 1.25 }}
            >
              MoodVision
            </Title>
            <Text ta="center" c="violet.1" size="sm" fw={600} opacity={0.95}>
              Plataformas con tu cara
            </Text>
            <Text ta="center" c="dimmed" size="sm" maw={440} lh={1.55}>
              Tras calibrar la cámara, cada gesto activa una acción en el nivel.
            </Text>
          </Stack>

          <Paper
            radius="lg"
            p={{ base: "sm", sm: "md" }}
            bg="dark.9"
            bd="1px solid color-mix(in srgb, var(--mantine-color-violet-4) 22%, transparent)"
          >
            <Box
              component="ul"
              style={{ listStyle: "none", margin: 0, padding: 0 }}
            >
              {START_FACE_CONTROLS.map(({ emoji, title, hint }, index) => (
                <Box
                  component="li"
                  key={title}
                  aria-label={`${title}: ${hint}`}
                  pt={index > 0 ? "md" : 0}
                  mt={index > 0 ? "sm" : 0}
                  style={{
                    borderTop:
                      index > 0
                        ? "1px solid color-mix(in srgb, var(--mantine-color-dark-4) 55%, transparent)"
                        : undefined,
                  }}
                >
                  <Group
                    wrap="nowrap"
                    align="flex-start"
                    gap="md"
                    py={{ base: 4, sm: 6 }}
                  >
                    <ThemeIcon
                      size={54}
                      radius="md"
                      variant="gradient"
                      gradient={{
                        from: "violet.6",
                        to: "grape.9",
                        deg: 135,
                      }}
                      aria-hidden
                      style={{
                        boxShadow: "0 4px 14px rgba(124, 58, 237, 0.35)",
                        flexShrink: 0,
                      }}
                    >
                      <Text fz={26} lh={1} style={{ lineHeight: 1 }}>
                        {emoji}
                      </Text>
                    </ThemeIcon>
                    <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={700} size="sm" c="gray.0">
                        {title}
                      </Text>
                      <Text size="xs" c="dimmed" lh={1.5}>
                        {hint}
                      </Text>
                    </Stack>
                  </Group>
                </Box>
              ))}
            </Box>
          </Paper>

          <Text ta="center" c="dimmed" size="xs" lh={1.55}>
            Primero harás una calibración corta: neutro de cabeza, boca y ojos.
          </Text>

          <Button
            type="button"
            variant="gradient"
            gradient={{ from: "violet.6", to: "grape.8", deg: 125 }}
            size="md"
            radius="md"
            fullWidth
            fw={800}
            onClick={onBeginCalibration}
            styles={{
              root: {
                boxShadow: "0 8px 24px rgba(91, 33, 182, 0.45)",
              },
            }}
          >
            Calibrar y preparar cámara
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}

const CALIB_STEPS = [
  {
    title: "Neutro de rostro",
    short: "Cabeza, boca y ojos",
    hint: "Mira al frente (centro), boca relajada o cerrada y ojos bien abiertos. Cuando estés listo, pulsa Capturar.",
    tips: [
      { emoji: "🧭", text: "Cabeza al frente, sin girar mucho." },
      { emoji: "😌", text: "Boca en reposo (no hablando)." },
      {
        emoji: "👀",
        text: "Ojos abiertos con normalidad (sirve para disparar después).",
      },
    ],
  },
  {
    title: "Boca para saltar",
    short: "Abre un poco",
    hint: "Abre la boca de forma clara (como si fueras a decir «ah») y mantén un segundo. Luego Capturar.",
    tips: [
      { emoji: "😮", text: "Labios separados, no hace falta gritar." },
      { emoji: "⏱️", text: "Mantén el gesto al pulsar Capturar." },
    ],
  },
];

/** Dos capturas: boca cerrada (neutro) y boca un poco abierta. Paso 0 guarda también apertura de ojos. */
export function CalibrationScreen({
  sampleRef,
  videoRef,
  canvasRef,
  hud,
  onDone,
  onCancel,
}) {
  const [step, setStep] = React.useState(0);
  const yawNeutralSamples = React.useRef([]);
  const mouthClosedSamples = React.useRef([]);
  const mouthOpenSamples = React.useRef([]);
  const eyeOpenNeutralSamples = React.useRef([]);

  const stepMeta = CALIB_STEPS[step] ?? CALIB_STEPS[0];

  const goBackStep = () => {
    if (step !== 1) return;
    yawNeutralSamples.current = [];
    mouthClosedSamples.current = [];
    eyeOpenNeutralSamples.current = [];
    mouthOpenSamples.current = [];
    setStep(0);
  };

  const capture = () => {
    const s = sampleRef?.current;
    if (!s) return;
    if (step === 0) {
      yawNeutralSamples.current.push(s.rawYaw ?? 0);
      mouthClosedSamples.current.push(s.rawMouthOpen ?? 0);
      eyeOpenNeutralSamples.current.push(s.rawEyeOpen ?? 0);
      setStep(1);
      return;
    }
    mouthOpenSamples.current.push(s.rawMouthOpen ?? 0);
    const neutralYawRaw =
      yawNeutralSamples.current.reduce((a, b) => a + b, 0) /
      Math.max(1, yawNeutralSamples.current.length);
    const mouthNeutral =
      mouthClosedSamples.current.reduce((a, b) => a + b, 0) /
      Math.max(1, mouthClosedSamples.current.length);
    const mouthOpenRef =
      mouthOpenSamples.current.reduce((a, b) => a + b, 0) /
      Math.max(1, mouthOpenSamples.current.length);
    const eyeOpenNeutral =
      eyeOpenNeutralSamples.current.reduce((a, b) => a + b, 0) /
      Math.max(1, eyeOpenNeutralSamples.current.length);
    onDone({
      neutralYawRaw,
      mouthNeutral,
      mouthGain: 6,
      yawGain: 1,
      mouthOpenRef,
      eyeOpenNeutral,
    });
  };

  return (
    <Box
      px="md"
      py={{ base: "md", sm: "lg" }}
      className="game-calibration-root"
    >
      <Paper
        component="section"
        radius="xl"
        p={{ base: "md", sm: "lg" }}
        maw={960}
        mx="auto"
        w="100%"
        withBorder
        shadow="xl"
        style={{
          background:
            "linear-gradient(160deg, rgba(46, 16, 101, 0.5) 0%, rgba(15, 23, 42, 0.94) 45%, rgba(2, 6, 23, 0.98) 100%)",
          borderColor: "rgba(167, 139, 250, 0.35)",
          boxShadow:
            "0 0 0 1px rgba(139, 92, 246, 0.12), 0 20px 50px rgba(0, 0, 0, 0.4)",
        }}
      >
        <Stack gap="lg" align="stretch">
          {hud ? (
            <Paper
              radius="md"
              p="sm"
              bg="dark.9"
              withBorder
              bd="1px solid dark.6"
            >
              {hud}
            </Paper>
          ) : null}

          <Box>
            <Group justify="space-between" align="center" wrap="wrap" gap="xs">
              <Title order={3} c="gray.0" fz={{ base: "1.2rem", sm: "1.4rem" }}>
                Calibración
              </Title>
              <Badge variant="light" color="violet" size="lg" radius="md">
                Paso {step + 1} / 2
              </Badge>
            </Group>
            <Progress
              value={(step + 1) * 50}
              size="sm"
              radius="xl"
              color="violet"
              mt="sm"
            />
          </Box>

          <Paper
            radius="md"
            p={{ base: "md", sm: "lg" }}
            w="100%"
            bg="dark.8"
            withBorder
            bd="1px solid color-mix(in srgb, var(--mantine-color-violet-4) 22%, transparent)"
          >
            <Stack gap={6} w="100%">
              <Text fw={800} c="gray.0" size="lg" ta={{ base: "center", sm: "left" }}>
                {stepMeta.title}
              </Text>
              <Text
                c="violet.2"
                size="sm"
                fw={600}
                ta={{ base: "center", sm: "left" }}
              >
                {stepMeta.short}
              </Text>
              <Text
                c="dimmed"
                size="sm"
                lh={1.65}
                ta={{ base: "center", sm: "left" }}
              >
                {stepMeta.hint}
              </Text>
            </Stack>
          </Paper>

          <Flex
            direction={{ base: "column", md: "row" }}
            gap={{ base: "lg", md: "xl" }}
            align="stretch"
            justify="flex-start"
            wrap="nowrap"
          >
            <Stack
              justify="space-between"
              gap="md"
              style={{ flex: 1, minWidth: 0 }}
              maw={{ md: 440 }}
              order={{ base: 2, md: 1 }}
            >
              <Paper
                radius="md"
                p="sm"
                bg="dark.9"
                bd="1px solid color-mix(in srgb, var(--mantine-color-violet-4) 18%, transparent)"
                style={{ flex: "0 0 auto" }}
              >
                <Box
                  component="ul"
                  style={{ listStyle: "none", margin: 0, padding: 0 }}
                >
                  {stepMeta.tips.map((t) => (
                    <Box
                      component="li"
                      key={`${step}-${t.text}`}
                      style={{ listStyle: "none" }}
                    >
                      <Group wrap="nowrap" align="flex-start" gap="sm" py={4}>
                        <Text
                          span
                          fz="lg"
                          lh={1.2}
                          style={{ flexShrink: 0 }}
                          aria-hidden
                        >
                          {t.emoji}
                        </Text>
                        <Text size="sm" c="gray.2" lh={1.55}>
                          {t.text}
                        </Text>
                      </Group>
                    </Box>
                  ))}
                </Box>
              </Paper>

              <Stack gap="sm" style={{ flexShrink: 0 }}>
                {step === 1 ? (
                  <Button
                    type="button"
                    variant="light"
                    color="violet"
                    size="md"
                    radius="md"
                    fullWidth
                    fw={700}
                    onClick={goBackStep}
                  >
                    ← Volver al paso 1
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="gradient"
                  gradient={{ from: "violet.6", to: "grape.8", deg: 125 }}
                  size="md"
                  radius="md"
                  fullWidth
                  fw={800}
                  onClick={capture}
                  styles={{
                    root: {
                      boxShadow: "0 8px 22px rgba(91, 33, 182, 0.4)",
                    },
                  }}
                >
                  Capturar
                </Button>
                <Button
                  type="button"
                  variant="default"
                  color="gray"
                  size="md"
                  radius="md"
                  fullWidth
                  onClick={onCancel}
                  styles={{
                    root: {
                      background: "rgba(30, 41, 59, 0.6)",
                      borderColor: "rgba(148, 163, 184, 0.35)",
                      color: "#e2e8f0",
                    },
                  }}
                >
                  Cancelar
                </Button>
              </Stack>
            </Stack>

            <Stack
              gap="xs"
              style={{ flex: 1, minWidth: 0 }}
              maw={{ base: "100%", md: 480 }}
              w={{ base: "100%", md: "auto" }}
              miw={0}
              order={{ base: 1, md: 2 }}
              justify="flex-start"
            >
              <Text
                size="xs"
                c="violet.2"
                fw={700}
                tt="uppercase"
                mb={4}
                ta={{ base: "center", md: "left" }}
                style={{ letterSpacing: "0.06em" }}
              >
                Tu cámara
              </Text>
              <Box
                style={{
                  flex: "1 1 auto",
                  minHeight: 0,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <WebcamOverlay
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                  size="lg"
                />
              </Box>
              <Text
                size="xs"
                c="dimmed"
                mt="xs"
                ta={{ base: "center", md: "left" }}
                lh={1.5}
                style={{ flexShrink: 0 }}
              >
                Los puntos blancos siguen tu rostro: compáralos con los gestos
                de arriba.
              </Text>
            </Stack>
          </Flex>
        </Stack>
      </Paper>
    </Box>
  );
}

export function GameOverOverlay({ onRetry }) {
  return (
    <Stack align="center" gap="md" py="xl" className="game-overlay">
      <Title order={2} c="red.3">
        Game Over
      </Title>
      <button type="button" className="game-primary-btn" onClick={onRetry}>
        Reintentar
      </button>
    </Stack>
  );
}

export function VictoryOverlay({ onRetry }) {
  return (
    <Stack align="center" gap="md" py="xl" className="game-overlay">
      <Title order={2} c="green.3">
        ¡Victoria!
      </Title>
      <Text c="dimmed" ta="center" maw={420}>
        Llegaste a la meta. El jefe cae con disparos (entrecierra los ojos).
      </Text>
      <button type="button" className="game-primary-btn" onClick={onRetry}>
        Volver a jugar
      </button>
    </Stack>
  );
}
