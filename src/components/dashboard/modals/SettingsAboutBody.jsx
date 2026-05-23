import { useMemo, useRef, useState } from "react";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import {
  APP_SETTING_CARDS,
  APP_SETTING_FIELDS,
  getAppSettingFieldMap,
} from "../../../config/appSettingsFields.js";
import {
  getEffectiveAppSettings,
  saveAppSettings,
} from "../../../utils/appSettingsStore.js";

function SettingFieldInput({ field, value, onChange }) {
  const handleChange = (raw) => {
    if (field.type === "int") {
      onChange(raw.replace(/\D/g, "").slice(0, 8));
      return;
    }
    if (field.type === "float") {
      const cleaned = raw.replace(/[^0-9.]/g, "");
      const parts = cleaned.split(".");
      onChange(
        parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned,
      );
      return;
    }
    onChange(raw);
  };

  return (
    <TextInput
      value={value}
      onChange={(e) => handleChange(e.currentTarget.value)}
      placeholder={String(field.fallback ?? "")}
      size="sm"
      inputMode={field.type === "float" ? "decimal" : field.type === "int" ? "numeric" : "text"}
      styles={
        field.type === "url"
          ? { input: { wordBreak: "break-all" } }
          : undefined
      }
    />
  );
}

function SettingFieldRow({ field, value, onChange }) {
  return (
    <Stack gap={6}>
      <Group gap={6} wrap="nowrap" align="center">
        <Tooltip
          label={field.description}
          multiline
          w={280}
          withArrow
          position="top-start"
        >
          <Text
            component="span"
            size="sm"
            fw={600}
            c="gray.1"
            lh={1.3}
            style={{
              cursor: "help",
              borderBottom: "1px dotted rgba(196, 181, 253, 0.55)",
            }}
          >
            {field.title}
          </Text>
        </Tooltip>
        <Tooltip label={field.description} multiline w={280} withArrow>
          <ActionIcon
            variant="subtle"
            color="violet"
            size="sm"
            aria-label={`Información: ${field.title}`}
          >
            <IconInfoCircle size={15} stroke={1.75} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <SettingFieldInput field={field} value={value} onChange={onChange} />
    </Stack>
  );
}

function SettingsParamCard({ card, fieldMap, values, onFieldChange }) {
  const fields = card.fieldKeys
    .map((key) => fieldMap.get(key))
    .filter(Boolean);

  return (
    <Card
      padding="md"
      radius="lg"
      withBorder
      className="settings-param-card glass-card"
    >
      <Stack gap="sm">
        <div>
          <Text size="xs" fw={800} tt="uppercase" c="violet.3" lh={1.3}>
            {card.title}
          </Text>
          {card.description ? (
            <Text size="xs" c="dimmed" mt={4} lh={1.45}>
              {card.description}
            </Text>
          ) : null}
        </div>

        <SimpleGrid
          cols={card.columns === 1 ? 1 : { base: 1, xs: 2 }}
          spacing="sm"
          verticalSpacing="sm"
        >
          {fields.map((field) => (
            <SettingFieldRow
              key={field.key}
              field={field}
              value={values[field.key] ?? ""}
              onChange={(next) => onFieldChange(field.key, next)}
            />
          ))}
        </SimpleGrid>
      </Stack>
    </Card>
  );
}

export function SettingsAboutBody({ onClose }) {
  const fieldMap = useMemo(() => getAppSettingFieldMap(), []);
  const baselineRef = useRef(getEffectiveAppSettings());
  const [values, setValues] = useState(getEffectiveAppSettings);

  const setField = (key, next) => {
    setValues((prev) => ({ ...prev, [key]: next }));
  };

  const handleCancel = () => {
    setValues({ ...baselineRef.current });
    onClose?.();
  };

  const handleSave = () => {
    /** @type {Record<string, string>} */
    const normalized = {};
    for (const field of APP_SETTING_FIELDS) {
      let v = String(values[field.key] ?? "").trim();
      if (v === "") {
        v = String(field.fallback ?? "");
      }
      if (field.type === "int") {
        const n = Number(v);
        const clamped = Number.isFinite(n)
          ? Math.min(field.max ?? n, Math.max(field.min ?? n, Math.round(n)))
          : Number(field.fallback);
        v = String(clamped);
      }
      if (field.type === "float") {
        const n = Number(v);
        const clamped = Number.isFinite(n)
          ? Math.min(field.max ?? n, Math.max(field.min ?? n, n))
          : Number(field.fallback);
        v = String(clamped);
      }
      if (field.type === "url") {
        v = v.replace(/\/$/, "");
      }
      normalized[field.key] = v;
    }
    saveAppSettings(normalized);
    baselineRef.current = { ...normalized };
    setValues({ ...normalized });
    onClose?.();
  };

  return (
    <Stack gap="md" className="settings-about-body">
      <ScrollArea.Autosize mah="min(58vh, 520px)" type="auto" offsetScrollbars>
        <Stack gap="sm" pe={4}>
          {APP_SETTING_CARDS.map((card) => (
            <SettingsParamCard
              key={card.id}
              card={card}
              fieldMap={fieldMap}
              values={values}
              onFieldChange={setField}
            />
          ))}
        </Stack>
      </ScrollArea.Autosize>

      <Group justify="flex-end" gap="sm" mt="xs" wrap="wrap">
        <Button variant="default" color="gray" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button variant="filled" color="violet" onClick={handleSave}>
          Guardar
        </Button>
      </Group>
    </Stack>
  );
}
