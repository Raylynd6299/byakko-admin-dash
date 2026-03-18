import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Select, type SelectOption } from "@/components/ui/select";

// ─── Props ────────────────────────────────────────────────────────────────────

interface FilterBarProps {
  clientId:       string;
  onClientChange: (id: string) => void;
  clients:        { id: string; name: string }[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FilterBar({ clientId, onClientChange, clients }: FilterBarProps): ReactElement {
  const { t } = useTranslation();

  const clientOptions: SelectOption<string>[] = [
    { value: "", label: t("common.allClients") },
    ...clients.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="mb-4 flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
        {t("clients.client")}
      </label>
      <Select
        value={clientId}
        options={clientOptions}
        onChange={onClientChange}
        aria-label={t("clients.client")}
      />
    </div>
  );
}