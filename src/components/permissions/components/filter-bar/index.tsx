import { type ReactElement, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Select, type SelectOption } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// ─── Props ────────────────────────────────────────────────────────────────────

interface FilterBarProps {
  clientId:       string;
  search:         string;
  onClientChange: (id: string) => void;
  onSearchChange: (q: string) => void;
  clients:        { id: string; name: string }[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FilterBar({
  clientId,
  search,
  onClientChange,
  onSearchChange,
  clients,
}: FilterBarProps): ReactElement {
  const { t } = useTranslation();

  // Local state for the raw input value (debounce buffer)
  const [inputValue, setInputValue] = useState<string>(search);

  // Sync if parent resets search externally (e.g. clear all filters)
  useEffect(() => {
    setInputValue(search);
  }, [search]);

  // Debounce: fire onSearchChange 300ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, onSearchChange]);

  const clientOptions: SelectOption<string>[] = [
    { value: "", label: t("common.allClients") },
    ...clients.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      {/* Search input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          {t("common.search")}
        </label>
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t("permissions.searchPlaceholder")}
          leftIcon={<Search size={13} />}
          className="w-64"
          aria-label={t("common.search")}
        />
      </div>

      {/* Client filter */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          {t("clients.client")}
        </label>
        <Select
          value={clientId}
          options={clientOptions}
          onChange={onClientChange}
          aria-label={t("clients.client")}
          className="w-48"
        />
      </div>
    </div>
  );
}
