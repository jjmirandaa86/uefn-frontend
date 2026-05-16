import { Button, Text } from "@mantine/core";

export function DashboardCameraStage({
  videoRef,
  status,
  startCamera,
  stopCamera,
}) {
  return (
    <section className="center-stage">
      <div className="camera-panel">
        <video
          ref={videoRef}
          className="camera-video"
          autoPlay
          muted
          playsInline
        />
        {status !== "ready" && (
          <div className="camera-placeholder">
            <div className="face-frame" />
            <Text fw={800} size="xl">
              Vista previa IA
            </Text>
            {typeof window !== "undefined" && !window.isSecureContext && (
              <Text
                size="sm"
                c="orange.3"
                maw={440}
                ta="center"
                lh={1.55}
              >
                Por seguridad del navegador, la camara no esta disponible con{" "}
                <Text span fw={800} component="span">
                  http://
                </Text>{" "}
                en esta direccion (IP de red). Abre la misma app con{" "}
                <Text span fw={800} component="span">
                  https://
                </Text>{" "}
                (puerto {window.location.port || "5173"}). El certificado es de
                desarrollo: acepta la advertencia del navegador.
              </Text>
            )}
            <Text c="dimmed" maw={420} ta="center">
              Activa la camara para conectar la deteccion facial. La demo
              mantiene el dashboard funcionando con datos de ejemplo.
            </Text>
            {status === "insecure" && (
              <Button
                mt="xs"
                variant="light"
                color="gray"
                type="button"
                onClick={stopCamera}
              >
                Cerrar aviso
              </Button>
            )}
            <Button
              mt="md"
              type="button"
              onClick={startCamera}
              disabled={status === "requesting"}
            >
              Activar camara
            </Button>
          </div>
        )}
        <div className="scan-corners" />
        <Text className="camera-motivation" ta="right" fw={600}>
          Tu sonrisa puede cambiar tu dia.
        </Text>
      </div>
    </section>
  );
}
