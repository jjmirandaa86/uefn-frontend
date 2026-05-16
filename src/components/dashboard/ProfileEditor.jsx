import { useState } from "react";
import { Button, Stack, Text, TextInput } from "@mantine/core";
import { IconDownload, IconTrash } from "@tabler/icons-react";
import {
  PROFILE_AVATARS_FEMALE,
  PROFILE_AVATARS_MALE,
} from "../../data/profileAvatars.js";
import { AvatarGenderScrollRow } from "./profile/AvatarGenderScrollRow.jsx";

export function ProfileEditor({ initialName, initialAvatarId, onSave }) {
  const [name, setName] = useState(initialName);
  const [avatarId, setAvatarId] = useState(initialAvatarId);

  return (
    <Stack gap="lg">
      <TextInput
        label="Nombre de usuario"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        placeholder="Tu nombre"
      />

      <div>
        <Text size="sm" fw={700} mb="xs">
          Elegir avatar
        </Text>
        <Stack gap="md">
          <AvatarGenderScrollRow
            title="Hombres"
            items={PROFILE_AVATARS_MALE}
            avatarId={avatarId}
            setAvatarId={setAvatarId}
          />
          <AvatarGenderScrollRow
            title="Mujeres"
            items={PROFILE_AVATARS_FEMALE}
            avatarId={avatarId}
            setAvatarId={setAvatarId}
          />
        </Stack>
      </div>

      <Stack gap="sm">
        <Button
          variant="light"
          color="red"
          leftSection={<IconTrash size={18} />}
          type="button"
        >
          Eliminar historial
        </Button>
        <Button
          variant="light"
          color="red"
          leftSection={<IconTrash size={18} />}
          type="button"
        >
          Eliminar mis datos
        </Button>
        <Button
          variant="light"
          color="violet"
          leftSection={<IconDownload size={18} />}
          type="button"
        >
          Exportar datos
        </Button>
      </Stack>

      <Button
        fullWidth
        type="button"
        onClick={() => onSave({ name, avatarId })}
      >
        Guardar
      </Button>
    </Stack>
  );
}
