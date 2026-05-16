import { Anchor, Text } from "@mantine/core";

export function ShellFooterCredits() {
  return (
    <div className="shell-footer-credits">
      <Text
        className="shell-footer-line"
        c="dimmed"
        ta="left"
        component="p"
        m={0}
      >
        Proyecto de grado desarrollado para Domenica Miranda.
      </Text>
      <Text
        className="shell-footer-line shell-footer-line--quote"
        c="dimmed"
        ta="left"
        component="p"
        m={0}
        lh={1.45}
        style={{ fontStyle: "italic" }}
      >
        &ldquo;Diseño de un sistema de reconocimiento de gestos faciales y
        su relación con la innovación en la interacción de videojuegos
        interactivos.&rdquo;
      </Text>
      <Text
        className="shell-footer-line"
        c="dimmed"
        ta="left"
        component="p"
        m={0}
      >
        &copy; 2026 Todos los derechos reservados - Powered by{" "}
        <Anchor
          className="shell-footer-link"
          href="https://acertijo.dev"
          target="_blank"
          rel="noreferrer"
          c="violet.3"
          fw={600}
          underline="hover"
        >
          Acertijo.dev
        </Anchor>
      </Text>
    </div>
  );
}
