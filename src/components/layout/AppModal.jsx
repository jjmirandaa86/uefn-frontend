import { Modal, Text } from "@mantine/core";

const DEFAULT_OVERLAY_PROPS = { backgroundOpacity: 0.55 };
const DEFAULT_TRANSITION_PROPS = { duration: 0, transition: "fade" };

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
  transitionProps,
  classNames,
  lockScroll = false,
  returnFocus = false,
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
      lockScroll={lockScroll}
      returnFocus={returnFocus}
      overlayProps={{ ...DEFAULT_OVERLAY_PROPS, ...overlayProps }}
      transitionProps={{ ...DEFAULT_TRANSITION_PROPS, ...transitionProps }}
      classNames={{ ...DEFAULT_CLASS_NAMES, ...classNames }}
      {...rest}
    >
      {children}
    </Modal>
  );
}
