import { Modal, Text } from "@mantine/core";

const DEFAULT_OVERLAY_PROPS = { backgroundOpacity: 0.55, blur: 4 };

const DEFAULT_CLASS_NAMES = {
  content: "stats-modal-content",
  header: "stats-modal-header",
  body: "stats-modal-body",
};

function renderTitle(title) {
  if (typeof title === "string") {
    return (
      <Text fw={800} size="lg" tt="uppercase">
        {title}
      </Text>
    );
  }
  return title;
}

export function AppModal({
  opened,
  onClose,
  title,
  children,
  size = "lg",
  centered = true,
  radius = "lg",
  overlayProps,
  classNames,
  ...rest
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={renderTitle(title)}
      centered={centered}
      size={size}
      radius={radius}
      overlayProps={{ ...DEFAULT_OVERLAY_PROPS, ...overlayProps }}
      classNames={{ ...DEFAULT_CLASS_NAMES, ...classNames }}
      {...rest}
    >
      {children}
    </Modal>
  );
}
