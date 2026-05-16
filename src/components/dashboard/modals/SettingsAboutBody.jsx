import { useRef, useState } from "react";
import { Button, Checkbox, Group, Input, Stack, Text, TextInput } from "@mantine/core";
import {
  API_URL,
  APP_DESCRIPTION,
  APP_VERSION,
  DEFAULT_RECOGNITION_TIME,
} from "../../../appMeta.js";

function parseLeadingDigits(raw) {
  const m = String(raw ?? "").match(/(\d+)/);
  return m ? m[1] : "10";
}

export function SettingsAboutBody({ onClose }) {
  const snapshot = useRef({
    apiUrl: API_URL,
    recognitionSeconds: parseLeadingDigits(DEFAULT_RECOGNITION_TIME),
    allowAnimations: true,
    allowAudio: true,
  });

  const [apiUrl, setApiUrl] = useState(snapshot.current.apiUrl);
  const [recognitionSeconds, setRecognitionSeconds] = useState(
    snapshot.current.recognitionSeconds,
  );
  const [allowAnimations, setAllowAnimations] = useState(
    snapshot.current.allowAnimations,
  );
  const [allowAudio, setAllowAudio] = useState(snapshot.current.allowAudio);

  const handleCancel = () => {
    setApiUrl(snapshot.current.apiUrl);
    setRecognitionSeconds(snapshot.current.recognitionSeconds);
    setAllowAnimations(snapshot.current.allowAnimations);
    setAllowAudio(snapshot.current.allowAudio);
    onClose?.();
  };

  const handleSave = () => {
    const sec =
      recognitionSeconds.trim() === ""
        ? parseLeadingDigits(DEFAULT_RECOGNITION_TIME)
        : recognitionSeconds;
    snapshot.current = {
      apiUrl,
      recognitionSeconds: sec,
      allowAnimations,
      allowAudio,
    };
    setRecognitionSeconds(sec);
    onClose?.();
  };

  return (
    <Stack gap="lg">
      <TextInput
        label="URL de la API"
        value={apiUrl}
        onChange={(e) => setApiUrl(e.currentTarget.value)}
        styles={{ input: { wordBreak: "break-all" } }}
      />

      <Input.Wrapper label="Tiempo de reconocimiento">
        <Group gap="sm" align="center" wrap="nowrap" w="100%" mt={6}>
          <TextInput
            value={recognitionSeconds}
            onChange={(e) =>
              setRecognitionSeconds(e.currentTarget.value.replace(/\D/g, "").slice(0, 5))
            }
            placeholder={parseLeadingDigits(DEFAULT_RECOGNITION_TIME)}
            aria-label="Valor en segundos"
            styles={{ root: { flex: 1, minWidth: 0 } }}
          />
          <Text size="sm" c="dimmed" style={{ flexShrink: 0, lineHeight: 1.2 }}>
            segundos
          </Text>
        </Group>
      </Input.Wrapper>

      <Checkbox
        label="Permite animaciones"
        checked={allowAnimations}
        onChange={(e) => setAllowAnimations(e.currentTarget.checked)}
      />
      <Checkbox
        label="Permite audio"
        checked={allowAudio}
        onChange={(e) => setAllowAudio(e.currentTarget.checked)}
      />
      <div>
        <Text size="xs" fw={800} tt="uppercase" c="dimmed">
          Descripcion
        </Text>
        <Text size="sm" mt={8} lh={1.65}>
          {APP_DESCRIPTION}
        </Text>
      </div>
      <div>
        <Text size="xs" fw={800} tt="uppercase" c="dimmed">
          Version
        </Text>
        <Text size="sm" mt={8} ff="monospace" fw={600}>
          {APP_VERSION}
        </Text>
      </div>

      <Group justify="flex-end" gap="sm" mt="md" wrap="wrap">
        <Button variant="default" color="gray" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button variant="filled" color="violet" onClick={handleSave}>
          Guardar
        </Button>
      </Group>
    </Stack>
  );
}
