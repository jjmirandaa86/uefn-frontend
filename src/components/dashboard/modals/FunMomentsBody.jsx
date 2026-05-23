import { useCallback, useEffect, useState } from "react";
import {
  ActionIcon,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { useFunMoments } from "../../../hooks/useFunMoments.js";
import { downloadFunMomentImage } from "../../../utils/downloadFunMomentImage.js";

function FunMomentThumb({ item, onSelect }) {
  return (
    <figure className="fun-moment-thumb" title={item.emocion}>
      <button
        type="button"
        className="fun-moment-thumb__btn"
        onClick={() => onSelect(item)}
        aria-label={`Ver ${item.emocion} a las ${item.time}`}
      >
        <img
          src={item.imageUrl}
          alt=""
          loading="lazy"
          className="fun-moment-thumb__img"
        />
      </button>
      <figcaption className="fun-moment-thumb__caption">
        <span className="fun-moment-thumb__emoji" aria-hidden>
          {item.emoji}
        </span>
        <Text component="span" size="xs" c="gray.2">
          {item.time}
        </Text>
      </figcaption>
    </figure>
  );
}

function FunMomentPreview({ item, onClose }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadFunMomentImage(item);
    } catch {
      window.open(item.imageUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  }, [downloading, item]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
    },
    [onClose],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  return (
    <Stack
      gap="xs"
      className="fun-moment-preview"
      style={{ height: "100%", minHeight: 0 }}
    >
      <Group justify="space-between" align="center" wrap="nowrap" className="fun-moment-preview__toolbar">
        <Button variant="subtle" color="violet" size="xs" onClick={onClose}>
          ← Volver
        </Button>
        <Text size="xs" c="dimmed" truncate>
          Esc para volver
        </Text>
      </Group>

      <figure className="fun-moment-preview__figure">
        <div className="fun-moment-preview__img-wrap">
          <img
            src={item.imageUrl}
            alt={`${item.emocion} — ${item.time}`}
            className="fun-moment-preview__img"
          />
        </div>
        <figcaption className="fun-moment-preview__caption">
          <span className="fun-moment-preview__emoji" aria-hidden>
            {item.emoji}
          </span>
          <Text component="span" size="sm" fw={600} c="gray.0">
            {item.emocion}
          </Text>
          <Text component="span" size="sm" c="dimmed">
            {item.dateLabel} · {item.time}
            {item.nivelConfianza != null ? ` · ${item.nivelConfianza}%` : ""}
          </Text>
          <Tooltip label="Descargar imagen" withArrow position="top">
            <ActionIcon
              variant="subtle"
              color="violet"
              size="sm"
              className="fun-moment-preview__download"
              loading={downloading}
              aria-label="Descargar imagen"
              onClick={() => void handleDownload()}
            >
              <IconDownload size={16} stroke={1.75} />
            </ActionIcon>
          </Tooltip>
        </figcaption>
      </figure>
    </Stack>
  );
}

export function FunMomentsBody({ active = true }) {
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!active) setSelectedItem(null);
  }, [active]);

  const {
    items,
    loading,
    error,
    pageSize,
    total,
    pageIndex,
    pageCount,
    hasNewer,
    hasOlder,
    goNewer,
    goOlder,
  } = useFunMoments({ enabled: active });

  useEffect(() => {
    setSelectedItem(null);
  }, [items]);

  if (loading && !items.length) {
    return (
      <Text size="sm" c="dimmed">
        Cargando momentos…
      </Text>
    );
  }

  if (error) {
    return (
      <Text size="sm" c="red.4">
        {error}
      </Text>
    );
  }

  if (!items.length) {
    return (
      <Stack gap="md" className="fun-moments-modal-body">
        <Text size="sm" c="dimmed" lh={1.55}>
          Aún no hay capturas procesadas. Cuando el backend marque imágenes como
          procesadas, aparecerán aquí en miniatura.
        </Text>
      </Stack>
    );
  }

  if (selectedItem) {
    return (
      <div className="fun-moments-modal-body fun-moments-modal-body--preview fun-moments-viewport">
        <FunMomentPreview
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      </div>
    );
  }

  return (
    <Stack gap="sm" className="fun-moments-modal-body fun-moments-viewport">
      <Text size="xs" c="dimmed">
        {total} captura{total === 1 ? "" : "s"} procesada
        {total === 1 ? "" : "s"} · {pageSize} por página
      </Text>

      <SimpleGrid cols={4} spacing="sm" className="fun-moments-grid">
        {items.map((item) => (
          <FunMomentThumb
            key={item.id}
            item={item}
            onSelect={setSelectedItem}
          />
        ))}
      </SimpleGrid>

      <Group justify="space-between" className="fun-moments-pagination">
        <Button
          variant="light"
          color="violet"
          size="xs"
          disabled={!hasNewer || loading}
          onClick={goNewer}
        >
          Más recientes
        </Button>
        <Text size="xs" c="dimmed">
          Página {pageIndex}
          {pageCount > 0 ? ` de ${pageCount}` : ""}
        </Text>
        <Button
          variant="light"
          color="violet"
          size="xs"
          disabled={!hasOlder || loading}
          onClick={goOlder}
        >
          Más antiguas
        </Button>
      </Group>
    </Stack>
  );
}
