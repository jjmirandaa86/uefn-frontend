import { Group, Text } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { AvatarAgeGenderRow } from "./avatar/AvatarAgeGenderRow.jsx";

export function ApproximateInfoCard() {
  return (
    <>
      <Text size="xs" fw={800} tt="uppercase">
        Informacion Aproximada
      </Text>
      <Group mt="md" justify="space-between">
        <AvatarAgeGenderRow
          icon={IconUser}
          gradient={{ from: "violet.6", to: "grape.8", deg: 135 }}
        />
      </Group>
    </>
  );
}
