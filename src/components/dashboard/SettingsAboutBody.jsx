import { useState } from "react";
import { Checkbox, Stack, Text, TextInput } from "@mantine/core";
import {
  API_URL,
  APP_DESCRIPTION,
  APP_VERSION,
  DEFAULT_RECOGNITION_TIME,
} from "../../appMeta.js";

export function SettingsAboutBody() {
  const [apiUrl, setApiUrl] = useState(API_URL);
  const [recognitionTime, setRecognitionTime] = useState(
    DEFAULT_RECOGNITION_TIME,
  );
  const [allowAnimations, setAllowAnimations] = useState(true);
  const [allowAudio, setAllowAudio] = useState(true);

  return (
    <Stack gap="lg">
      <TextInput
        label="URL de la API"
        value={apiUrl}
        onChange={(e) => setApiUrl(e.currentTarget.value)}
        styles={{ input: { wordBreak: "break-all" } }}
      />
      <TextInput
        label="Tiempo de reconocimiento"
        value={recognitionTime}
        onChange={(e) => setRecognitionTime(e.currentTarget.value)}
      />
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
    </Stack>
  );
}
