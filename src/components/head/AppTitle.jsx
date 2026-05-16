import { Text } from "@mantine/core";
import { IconBrandOpenai } from "@tabler/icons-react";

export function AppTitle({ title = "MoodVision AI" }) {
  return (
    <>
      <IconBrandOpenai
        className="brand-icon brand-icon--compact"
        size={22}
        stroke={1.25}
      />
      <Text fw={800} size="sm" visibleFrom="xs" lineClamp={1}>
        {title}
      </Text>
    </>
  );
}
