import { Stack } from "@mantine/core";
import GameMain from "../../game/GameMain.jsx";

export function GameScreen() {
  return (
    <section className="game-screen" aria-label="Juego">
      <Stack gap="md" maw={720} mx="auto" py="xl">
        <GameMain />
      </Stack>
    </section>
  );
}
