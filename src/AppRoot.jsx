import { useEffect, useState } from "react";
import { Loader, MantineProvider, Stack, Text } from "@mantine/core";
import App from "./App.jsx";
import { loadDashboardFaceModels } from "./services/faceApi.js";
import { prefetchRecentEmotionHistory } from "./utils/recentHistoryCache.js";

const SPLASH_MS = 3000;

export function AppRoot({ theme }) {
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void loadDashboardFaceModels();
    void prefetchRecentEmotionHistory();

    const id = window.setTimeout(() => {
      if (!cancelled) setShowApp(true);
    }, SPLASH_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  return (
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      {showApp ? <App /> : <SplashScreen />}
    </MantineProvider>
  );
}

function SplashScreen() {
  return (
    <div
      className="splash-screen"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Stack align="center" gap="xl">
        <Loader type="oval" color="violet" size="xl" />
        <Text className="splash-screen__title" fw={800} size="xl">
          MoodVision AI
        </Text>
      </Stack>
    </div>
  );
}
