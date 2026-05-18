import React from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Image,
  Paper,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconCamera,
  IconCoinFilled,
  IconCrown,
  IconFaceId,
  IconHeartFilled,
  IconInfoCircle,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
  IconSparkles,
  IconTarget,
} from "@tabler/icons-react";
import charactersArtSvgUrl from "../assets/Super-Mario-PNG-Photos.png?url";
import designSnesControlPng from "../assets/design-snes-control.png?url";
import gameOverTitlePng from "../assets/Game-Over.png?url";

/**
 * @param {"sm" | "lg"} [size] — `lg` en calibración para ver gestos y landmarks con claridad.
 */
export function WebcamOverlay({
  videoRef,
  canvasRef,
  size = "sm",
  cornerBrackets = false,
}) {
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
      {cornerBrackets && large ? (
        <Box
          aria-hidden
          pos="absolute"
          inset={0}
          style={{ zIndex: 3, pointerEvents: "none" }}
        >
          {[
            { t: 14, l: 14, bt: 3, bl: 3, br: 0, bb: 0, rTL: 2 },
            { t: 14, r: 14, bt: 3, br: 3, bl: 0, bb: 0, rTR: 2 },
            { b: 14, l: 14, bb: 3, bl: 3, br: 0, bt: 0, rBL: 2 },
            { b: 14, r: 14, bb: 3, br: 3, bl: 0, bt: 0, rBR: 2 },
          ].map((c, i) => (
            <Box
              key={i}
              pos="absolute"
              w={28}
              h={28}
              style={{
                top: c.t,
                left: c.l,
                right: c.r,
                bottom: c.b,
                borderTopWidth: c.bt,
                borderBottomWidth: c.bb,
                borderLeftWidth: c.bl,
                borderRightWidth: c.br,
                borderStyle: "solid",
                borderColor: "rgba(196, 181, 253, 0.95)",
                borderTopLeftRadius: c.rTL,
                borderTopRightRadius: c.rTR,
                borderBottomLeftRadius: c.rBL,
                borderBottomRightRadius: c.rBR,
              }}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

export function GameHUD({
  hud,
  facialLabel,
  onRestart,
  onPauseToggle,
  gamePaused = false,
  variant = "default",
}) {
  if (variant === "bar") {
    const violet = "var(--mantine-color-violet-4)";
    const dividerProps = {
      orientation: "vertical",
      color: "rgba(148, 163, 184, 0.28)",
      my: 4,
      style: { alignSelf: "stretch" },
    };

    const stat = (Icon, iconColor, iconGlow, label, value, explanation) => (
      <Tooltip
        label={explanation}
        position="top"
        withArrow
        multiline
        maw={280}
        openDelay={200}
        closeDelay={80}
        events={{ hover: true, focus: true, touch: true }}
      >
        <Box
          style={{
            flex: 1,
            cursor: "help",
            minWidth: 0,
            borderRadius: 10,
          }}
        >
          <Group
            gap="sm"
            align="center"
            justify="flex-start"
            wrap="nowrap"
            py={4}
            px={{ base: 4, xs: 8, sm: 12 }}
          >
            <Box
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                filter: iconGlow,
              }}
            >
              <Icon size={36} stroke={1.35} color={iconColor} />
            </Box>
            <Stack gap={0} align="flex-start" justify="center" miw={0}>
              <Text size="xs" c="gray.2" fw={500} lh={1.25}>
                {label}
              </Text>
              <Text fz="lg" fw={800} c="gray.0" lh={1.15}>
                {value}
              </Text>
            </Stack>
          </Group>
        </Box>
      </Tooltip>
    );

    return (
      <Paper
        component="div"
        radius={22}
        p="md"
        className="game-hud"
        withBorder
        bd="1px solid rgba(167, 139, 250, 0.38)"
        style={{
          minWidth: 0,
          flex: 1,
          background:
            "linear-gradient(165deg, rgba(24, 24, 56, 0.97) 0%, rgba(11, 14, 41, 0.99) 45%, rgba(8, 10, 32, 1) 100%)",
          boxShadow:
            "0 0 0 1px rgba(139, 92, 246, 0.12), 0 0 32px rgba(91, 33, 182, 0.22), 0 16px 40px rgba(0, 0, 0, 0.45)",
        }}
      >
        <Stack gap="sm">
          <Group
            justify="space-between"
            align="flex-start"
            wrap="nowrap"
            gap="md"
          >
            <Text
              size="xs"
              fw={800}
              c="gray.4"
              tt="uppercase"
              style={{ letterSpacing: "0.14em" }}
            >
              HUD
            </Text>
            {onRestart || onPauseToggle ? (
              <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
                {onPauseToggle ? (
                  <Button
                    type="button"
                    variant="light"
                    color="gray"
                    size="xs"
                    radius="md"
                    fw={700}
                    leftSection={
                      gamePaused ? (
                        <IconPlayerPlay size={14} stroke={1.5} />
                      ) : (
                        <IconPlayerPause size={14} stroke={1.5} />
                      )
                    }
                    onClick={onPauseToggle}
                    title={gamePaused ? "Continuar partida" : "Pausar partida"}
                  >
                    {gamePaused ? "Continuar" : "Pausa"}
                  </Button>
                ) : null}
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
            ) : null}
          </Group>

          <Box
            py={{ base: 6, sm: 10 }}
            px={{ base: 4, sm: 8 }}
            style={{
              borderRadius: 18,
              background:
                "linear-gradient(90deg, rgba(15, 23, 42, 0.92) 0%, rgba(11, 14, 41, 0.96) 50%, rgba(15, 23, 42, 0.92) 100%)",
              border: "1px solid rgba(167, 139, 250, 0.28)",
              boxShadow:
                "inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 24px rgba(124, 58, 237, 0.12)",
            }}
          >
            <Group wrap="nowrap" align="stretch" gap={0} grow>
              {stat(
                IconTarget,
                violet,
                "drop-shadow(0 0 12px rgba(167, 139, 250, 0.75))",
                "Puntos",
                hud.score,
                "Tu puntuación total. Sube al coger monedas (+100), al eliminar enemigos saltando encima (+250), al acertar disparos a enemigos (+180) y al golpear al enemigo final (+150).",
              )}
              <Divider {...dividerProps} />
              {stat(
                IconCoinFilled,
                "#fbbf24",
                "drop-shadow(0 0 10px rgba(251, 191, 36, 0.55))",
                "Monedas",
                hud.coins,
                "Cuántas monedas has recogido en este intento. Cada moneda suma puntos y cuenta aquí.",
              )}
              <Divider {...dividerProps} />
              {stat(
                IconHeartFilled,
                "#f87171",
                "drop-shadow(0 0 10px rgba(248, 113, 113, 0.55))",
                "Vidas",
                hud.lives,
                "Intentos que te quedan. Pierdes una si caes al vacío, te toca un enemigo o el enemigo final del nivel te golpea.",
              )}
              <Divider {...dividerProps} />
              {stat(
                IconCrown,
                "#c4b5fd",
                "drop-shadow(0 0 12px rgba(196, 181, 253, 0.65))",
                "Jefe",
                hud.bossHp,
                "Vida del enemigo fuerte al final del recorrido (el grande rojo). Disminúyela disparándole: entrecierra los ojos y mantén la boca casi cerrada. Cuando llegue a 0, lo eliminas.",
              )}
            </Group>
          </Box>

          <Divider color="rgba(148, 163, 184, 0.15)" />
          <Tooltip
            label="Lo que la cámara está leyendo ahora: por ejemplo mirar a los lados para moverte, boca para saltar, sonrisa para sprint y ojos entrecerrados para disparar (según la calibración)."
            position="top"
            withArrow
            multiline
            maw={300}
            openDelay={200}
            closeDelay={80}
            events={{ hover: true, focus: true, touch: true }}
          >
            <Group
              gap="sm"
              wrap="nowrap"
              align="center"
              style={{ cursor: "help", borderRadius: 8 }}
            >
              <ThemeIcon size="sm" radius="sm" variant="light" color="violet">
                <IconFaceId size={16} stroke={1.5} />
              </ThemeIcon>
              <Text size="sm" c="gray.2" lh={1.4}>
                <Text span c="gray.4" fw={600}>
                  Rostro:{" "}
                </Text>
                <Text span c="gray.0" fw={700}>
                  {facialLabel}
                </Text>
              </Text>
            </Group>
          </Tooltip>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="sm" className="game-hud" style={{ minWidth: 0, flex: 1 }}>
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
        <Title order={4} c="gray.0" fz="clamp(0.95rem, 3vw, 1.1rem)">
          HUD
        </Title>
        {onRestart || onPauseToggle ? (
          <Group gap="xs" wrap="nowrap">
            {onPauseToggle ? (
              <Button
                type="button"
                variant="light"
                color="gray"
                size="xs"
                radius="md"
                fw={700}
                leftSection={
                  gamePaused ? (
                    <IconPlayerPlay size={14} stroke={1.5} />
                  ) : (
                    <IconPlayerPause size={14} stroke={1.5} />
                  )
                }
                onClick={onPauseToggle}
                title={gamePaused ? "Continuar partida" : "Pausar partida"}
              >
                {gamePaused ? "Continuar" : "Pausa"}
              </Button>
            ) : null}
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
    leftTone: "blue",
    rightHint: "✥",
  },
  {
    emoji: "😮",
    title: "Saltar",
    hint: "Abre la boca.",
    leftTone: "purple",
    rightHint: "⬆",
  },
  {
    emoji: "😁",
    title: "Sprint",
    hint: "Sonríe.",
    leftTone: "purple",
    rightHint: "⚡",
  },
  {
    emoji: "😑",
    title: "Disparar",
    hint: "Entrecierra los ojos.",
    leftTone: "purple",
    rightHint: "⌖",
  },
];

function StartEmojiSlot({ emoji, tone }) {
  const isBlue = tone === "blue";
  return (
    <Box
      style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isBlue
          ? "linear-gradient(145deg, #3b82f6, #1d4ed8)"
          : "linear-gradient(145deg, #7c3aed, #4c1d95)",
        border: "1px solid rgba(255,255,255,0.22)",
        boxShadow: isBlue
          ? "0 0 22px rgba(59, 130, 246, 0.65), inset 0 1px 0 rgba(255,255,255,0.2)"
          : "0 0 26px rgba(167, 139, 250, 0.55), inset 0 1px 0 rgba(255,255,255,0.15)",
      }}
      aria-hidden
    >
      <Text fz={26} lh={1} style={{ lineHeight: 1 }}>
        {emoji}
      </Text>
    </Box>
  );
}

function ActionHintGlyph({ glyph }) {
  return (
    <Box
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(76, 29, 149, 0.35)",
        border: "1px solid rgba(196, 181, 253, 0.45)",
        boxShadow: "0 0 14px rgba(139, 92, 246, 0.35)",
      }}
      aria-hidden
    >
      <Text fz={16} fw={800} c="violet.2" lh={1} style={{ lineHeight: 1 }}>
        {glyph}
      </Text>
    </Box>
  );
}

export function StartScreenOverlay({ onBeginCalibration }) {
  return (
    <Stack
      align="center"
      justify="center"
      gap="lg"
      py={{ base: "xl", sm: 56 }}
      px="md"
      className="game-overlay--start"
    >
      <Box pos="relative" w="100%" maw={500} style={{ overflow: "visible" }}>
        <Paper
          component="section"
          radius={28}
          px={{ base: "md", sm: "lg" }}
          pb={{ base: "lg", sm: "xl" }}
          pt={72}
          w="100%"
          withBorder={false}
          style={{
            overflow: "visible",
            background:
              "linear-gradient(165deg, rgba(30, 27, 75, 0.82) 0%, rgba(15, 23, 42, 0.92) 42%, rgba(2, 6, 23, 0.96) 100%)",
            border: "2px solid rgba(167, 139, 250, 0.55)",
            boxShadow:
              "0 0 0 1px rgba(139, 92, 246, 0.35), 0 0 48px rgba(124, 58, 237, 0.35), 0 24px 60px rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Box
            pos="absolute"
            left="50%"
            style={{
              transform: "translateX(-50%)",
              top: -56,
              width: "min(104%, 440px)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            <Box pos="relative" w="100%">
              <Image
                src={designSnesControlPng}
                alt="Mando retro de referencia"
                fit="contain"
                w="100%"
                maw={420}
                mx="auto"
                style={{
                  filter: "drop-shadow(0 16px 36px rgba(0, 0, 0, 0.55))",
                }}
              />
              <Box
                pos="absolute"
                left={0}
                right={0}
                top="30%"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Badge
                  variant="filled"
                  color="dark"
                  size="xxl"
                  radius="xl"
                  tt="uppercase"
                  px="sm"
                  styles={{
                    root: {
                      background: "rgba(15, 23, 42, 0.88)",
                      border: "1px solid rgba(148, 163, 184, 0.35)",
                      boxShadow: "0 0 18px rgba(139, 92, 246, 0.45)",
                    },
                    label: {
                      fontSize: "0.62rem",
                      letterSpacing: "0.12em",
                      fontWeight: 800,
                      textAlign: "center",
                      lineHeight: 1.35,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    },
                  }}
                >
                  <div>Sin teclado</div>
                  <div>solo rostro</div>
                </Badge>
              </Box>
            </Box>
          </Box>

          <br />
          <br />
          <Stack gap="md" align="stretch" mt="xs">
            <Text ta="center" c="gray.0" size="sm" fw={600}>
              Plataformas con tu cara
            </Text>
            <Text ta="center" c="dimmed" size="sm" lh={1.55} px="xs">
              Tras calibrar la cámara, cada gesto activa una acción en el nivel.
            </Text>

            <Paper
              radius="xl"
              p={{ base: "sm", sm: "md" }}
              mt="sm"
              bg="rgba(2, 6, 23, 0.55)"
              bd="1px solid rgba(139, 92, 246, 0.28)"
              style={{
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <Box
                component="ul"
                style={{ listStyle: "none", margin: 0, padding: 0 }}
              >
                {START_FACE_CONTROLS.map(
                  ({ emoji, title, hint, leftTone, rightHint }, index) => (
                    <Box
                      component="li"
                      key={title}
                      aria-label={`${title}: ${hint}`}
                      py="sm"
                      style={{
                        borderTop:
                          index > 0
                            ? "1px solid rgba(51, 65, 85, 0.65)"
                            : undefined,
                      }}
                    >
                      <Group
                        wrap="nowrap"
                        align="center"
                        justify="space-between"
                        gap="md"
                      >
                        <StartEmojiSlot emoji={emoji} tone={leftTone} />
                        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                          <Text fw={800} size="sm" c="gray.0">
                            {title}
                          </Text>
                          <Text size="xs" c="dimmed" lh={1.5}>
                            {hint}
                          </Text>
                        </Stack>
                        <ActionHintGlyph glyph={rightHint} />
                      </Group>
                    </Box>
                  ),
                )}
              </Box>
            </Paper>

            <Group gap="xs" align="flex-start" wrap="nowrap" mt="xs">
              <Text fz="md" lh={1} style={{ flexShrink: 0 }} aria-hidden>
                💡
              </Text>
              <Text size="xs" c="dimmed" lh={1.55} style={{ flex: 1 }}>
                Primero harás una calibración corta:{" "}
                <Text span c="violet.3" fw={700}>
                  neutro de cabeza, boca y ojos.
                </Text>
              </Text>
            </Group>

            <Button
              type="button"
              variant="gradient"
              gradient={{ from: "violet.6", to: "cyan.7", deg: 95 }}
              size="md"
              radius="xl"
              fullWidth
              fw={800}
              tt="uppercase"
              mt="xs"
              leftSection={
                <Text component="span" fz="lg" lh={1}>
                  📷
                </Text>
              }
              onClick={onBeginCalibration}
              styles={{
                root: {
                  boxShadow:
                    "0 0 28px rgba(124, 58, 237, 0.45), 0 12px 32px rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(196, 181, 253, 0.35)",
                },
                label: { letterSpacing: "0.06em", fontSize: "0.8rem" },
              }}
            >
              Calibrar y preparar cámara
            </Button>
          </Stack>
        </Paper>
      </Box>
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
          <Box>
            <Group justify="space-between" align="center" wrap="wrap" gap="xs">
              <Title
                order={3}
                c="gray.0"
                fz={{ base: "1.25rem", sm: "1.45rem" }}
                fw={800}
              >
                Calibración
              </Title>
              <Badge
                variant="light"
                color="violet"
                size="lg"
                radius="xl"
                tt="uppercase"
                fw={800}
                px="md"
                style={{ letterSpacing: "0.06em" }}
              >
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
            <Flex
              gap="md"
              align="flex-start"
              direction={{ base: "column", sm: "row" }}
            >
              <ThemeIcon
                size={54}
                radius="md"
                variant="gradient"
                gradient={{ from: "violet.6", to: "grape.9" }}
                style={{
                  flexShrink: 0,
                  boxShadow: "0 0 20px rgba(124, 58, 237, 0.45)",
                }}
              >
                <IconFaceId size={28} stroke={1.35} />
              </ThemeIcon>
              <Stack gap={8} style={{ flex: 1, minWidth: 0 }}>
                <Text fw={800} c="gray.0" size="lg" lh={1.35}>
                  {stepMeta.title}
                </Text>
                <Text c="violet.3" size="sm" fw={700}>
                  {stepMeta.short}
                </Text>
                <Text c="dimmed" size="sm" lh={1.65}>
                  {stepMeta.hint}
                </Text>
              </Stack>
            </Flex>
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
              maw={{ md: 420 }}
              order={{ base: 2, md: 1 }}
            >
              <Paper
                radius="md"
                p="md"
                bg="dark.9"
                withBorder
                bd="1px solid color-mix(in srgb, var(--mantine-color-violet-4) 18%, transparent)"
              >
                <Group justify="space-between" align="center" mb="sm">
                  <Text fw={800} size="sm" c="gray.1">
                    Indicaciones
                  </Text>
                  <ThemeIcon
                    size="sm"
                    radius="xl"
                    variant="light"
                    color="gray"
                    aria-label="Información"
                  >
                    <IconInfoCircle size={16} stroke={1.5} />
                  </ThemeIcon>
                </Group>
                <Stack gap={0}>
                  {stepMeta.tips.map((t, i) => (
                    <React.Fragment key={`${step}-${t.text}`}>
                      {i > 0 ? (
                        <Divider variant="dashed" color="dark.5" my="sm" />
                      ) : null}
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
                    </React.Fragment>
                  ))}
                </Stack>
              </Paper>

              <Box visibleFrom="md" w="100%" mt="auto">
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
                      background: "rgba(15, 23, 42, 0.75)",
                      borderColor: "rgba(148, 163, 184, 0.45)",
                      color: "#e2e8f0",
                      fontWeight: 700,
                    },
                  }}
                >
                  Cancelar
                </Button>
              </Box>
            </Stack>

            <Stack
              gap="sm"
              style={{ flex: 1, minWidth: 0 }}
              maw={{ base: "100%", md: 480 }}
              w={{ base: "100%", md: "auto" }}
              miw={0}
              order={{ base: 1, md: 2 }}
              justify="flex-start"
            >
              <Group
                justify="space-between"
                align="center"
                wrap="wrap"
                gap="xs"
              >
                <Text fw={800} size="sm" c="gray.0">
                  Tu cámara
                </Text>
                <Group gap={8} wrap="nowrap" align="center">
                  <Box
                    w={8}
                    h={8}
                    bg="green.5"
                    style={{
                      borderRadius: 9999,
                      boxShadow: "0 0 10px rgba(34, 197, 94, 0.65)",
                    }}
                  />
                  <Text size="sm" c="green.4" fw={700}>
                    Cámara lista
                  </Text>
                </Group>
              </Group>

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
                  cornerBrackets
                />
              </Box>

              <Group gap={8} align="flex-start" wrap="nowrap">
                <IconSparkles
                  size={16}
                  stroke={1.5}
                  style={{
                    flexShrink: 0,
                    marginTop: 2,
                    color: "var(--mantine-color-violet-4)",
                  }}
                />
                <Text size="xs" c="dimmed" lh={1.55} style={{ flex: 1 }}>
                  Los puntos blancos siguen tu rostro: compáralos con los gestos
                  de arriba.
                </Text>
              </Group>

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

              <Box visibleFrom="md" w="100%">
                <Button
                  type="button"
                  variant="gradient"
                  gradient={{ from: "violet.6", to: "grape.8", deg: 125 }}
                  size="md"
                  radius="md"
                  fullWidth
                  fw={800}
                  onClick={capture}
                  leftSection={<IconCamera size={18} stroke={1.5} />}
                  styles={{
                    root: {
                      boxShadow: "0 8px 22px rgba(91, 33, 182, 0.45)",
                    },
                  }}
                >
                  Capturar
                </Button>
              </Box>
            </Stack>
          </Flex>

          <Box hiddenFrom="md" w="100%" mt="md">
            <Group gap="sm" grow wrap="nowrap" align="stretch">
              <Button
                type="button"
                variant="default"
                color="gray"
                size="md"
                radius="md"
                miw={0}
                style={{ flex: 1 }}
                onClick={onCancel}
                styles={{
                  root: {
                    background: "rgba(15, 23, 42, 0.75)",
                    borderColor: "rgba(148, 163, 184, 0.45)",
                    color: "#e2e8f0",
                    fontWeight: 700,
                  },
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="gradient"
                gradient={{ from: "violet.6", to: "grape.8", deg: 125 }}
                size="md"
                radius="md"
                miw={0}
                style={{ flex: 1.35 }}
                fw={800}
                onClick={capture}
                leftSection={<IconCamera size={18} stroke={1.5} />}
                styles={{
                  root: {
                    boxShadow: "0 8px 22px rgba(91, 33, 182, 0.45)",
                  },
                }}
              >
                Capturar
              </Button>
            </Group>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

export function GameOverOverlay({ onRetry }) {
  return (
    <Box
      component="section"
      w="100%"
      py={{ base: "lg", sm: "xl" }}
      px="md"
      className="game-overlay"
      style={{
        marginInline: "auto",
        maxWidth: "min(100%, 560px)",
      }}
    >
      <Paper
        radius={28}
        p={{ base: "lg", sm: "xl" }}
        withBorder
        bd="1px solid rgba(167, 139, 250, 0.45)"
        shadow="xl"
        style={{
          background:
            "linear-gradient(165deg, rgba(30, 27, 75, 0.92) 0%, rgba(15, 23, 42, 0.96) 48%, rgba(2, 6, 23, 0.98) 100%)",
          boxShadow:
            "0 0 0 1px rgba(139, 92, 246, 0.3), 0 0 40px rgba(124, 58, 237, 0.25), 0 24px 56px rgba(0, 0, 0, 0.55)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Stack gap="lg" align="center">
          <Image
            src={gameOverTitlePng}
            alt="Game Over"
            w="100%"
            maw={480}
            mah={140}
            fit="contain"
            style={{
              filter: "drop-shadow(0 10px 28px rgba(0, 0, 0, 0.5))",
            }}
          />

          <Divider
            w="100%"
            color="rgba(148, 163, 184, 0.25)"
            label={
              <ThemeIcon variant="light" color="violet" size="sm" radius="xl">
                <IconSparkles size={14} stroke={1.5} />
              </ThemeIcon>
            }
            labelPosition="center"
          />
          <Button
            type="button"
            fullWidth
            maw={400}
            size="md"
            radius="md"
            fw={800}
            variant="gradient"
            gradient={{ from: "violet.6", to: "grape.8", deg: 125 }}
            leftSection={<IconRefresh size={18} stroke={1.75} />}
            onClick={onRetry}
            styles={{
              root: {
                boxShadow: "0 8px 24px rgba(91, 33, 182, 0.5)",
              },
            }}
          >
            Reintentar desde el inicio
          </Button>
          <Text size="sm" c="gray.4" ta="center" maw={420} lh={1.55}>
            Se acabaron las vidas. Sigue practicando los gestos con la cámara y
            vuelve al nivel cuando quieras.
          </Text>
          <Image
            src={charactersArtSvgUrl}
            alt="Personajes"
            w="100%"
            maw={340}
            mah={200}
            fit="contain"
            style={{
              opacity: 0.92,
              filter: "drop-shadow(0 12px 28px rgba(0, 0, 0, 0.35))",
            }}
          />
        </Stack>
      </Paper>
    </Box>
  );
}

export function VictoryOverlay({ onRetry }) {
  return (
    <Stack align="center" gap="md" py="xl" className="game-overlay">
      <Title order={2} c="green.3">
        ¡Victoria!
      </Title>
      <Text c="dimmed" ta="center" maw={420}>
        Llegaste a la meta. El enemigo final cae con disparos (entrecierra los
        ojos).
      </Text>
      <button type="button" className="game-primary-btn" onClick={onRetry}>
        Volver a jugar
      </button>
    </Stack>
  );
}
