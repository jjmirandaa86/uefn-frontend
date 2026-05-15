import { useEffect, useState } from 'react';
import { Loader, MantineProvider, Stack, Text } from '@mantine/core';
import App from './App.jsx';

const SPLASH_MS = 3000;

export function AppRoot({ theme }) {
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setShowApp(true), SPLASH_MS);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      {showApp ? <App /> : <SplashScreen />}
    </MantineProvider>
  );
}

function SplashScreen() {
  return (
    <div className="splash-screen" role="status" aria-live="polite" aria-busy="true">
      <Stack align="center" gap="xl">
        <Loader type="oval" color="violet" size="xl" />
        <Text className="splash-screen__title" fw={800} size="xl">
          MoodVision AI
        </Text>
      </Stack>
    </div>
  );
}
