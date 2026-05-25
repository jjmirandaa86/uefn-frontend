import { NavLink, Text } from "@mantine/core";
import { NAV_ITEMS } from "./navItems.js";

export function SidebarMenu({
  activeNav,
  onItemClick,
  sectionTitle = "Menu",
}) {
  return (
    <>
      <Text size="xs" fw={800} tt="uppercase" c="dimmed" mb="sm">
        {sectionTitle}
      </Text>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.id}
            leftSection={<Icon size={20} stroke={1.5} />}
            label={item.label}
            active={activeNav === item.id}
            variant="light"
            color="violet"
            mb={4}
            onClick={() => onItemClick(item.id)}
            onMouseEnter={
              item.id === "historial"
                ? () => {
                    import("../../utils/recentHistoryCache.js").then((m) =>
                      m.prefetchRecentEmotionHistory(),
                    );
                  }
                : undefined
            }
          />
        );
      })}
    </>
  );
}
