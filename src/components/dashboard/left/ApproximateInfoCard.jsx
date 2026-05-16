import { useMemo } from "react";
import { Group, Text } from "@mantine/core";
import { useDashboardLiveSession } from "../../../hooks/useDashboardLiveSession.js";
import { AvatarAgeGenderRow } from "./avatar/AvatarAgeGenderRow.jsx";

export function ApproximateInfoCard() {
  const { approximateProfile } = useDashboardLiveSession();
  const { hasFace, ageYears, gender } = approximateProfile;

  const row = useMemo(() => {
    if (!hasFace || ageYears == null || !gender) {
      return {
        ageLabel: "—",
        genderLabel: "Sin detección",
        symbol: "neutral",
        gradient: { from: "slate.6", to: "dark.6", deg: 135 },
      };
    }
    const genderLabel = gender === "female" ? "Femenino" : "Masculino";
    return {
      ageLabel: `~${ageYears} años (aprox.)`,
      genderLabel,
      symbol: gender === "female" ? "female" : "male",
      gradient:
        gender === "female"
          ? { from: "pink.5", to: "grape.7", deg: 135 }
          : { from: "indigo.6", to: "cyan.7", deg: 135 },
    };
  }, [hasFace, ageYears, gender]);

  return (
    <>
      <Text size="xs" fw={800} tt="uppercase">
        Informacion Aproximada
      </Text>
      <Group mt="md" justify="space-between">
        <AvatarAgeGenderRow
          age={row.ageLabel}
          gender={row.genderLabel}
          symbol={row.symbol}
          gradient={row.gradient}
        />
      </Group>
    </>
  );
}
