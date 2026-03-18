import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Select, type SelectOption } from "@/components/ui/select";
import { USER_STATUS, type UserStatus } from "@/types/user.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface FilterBarProps {
  clientId:      string;
  status:        UserStatus | "";
  onClientChange: (id: string) => void;
  onStatusChange: (s: UserStatus | "") => void;
  clients:       { id: string; name: string }[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FilterBar({
  clientId,
  status,
  onClientChange,
  onStatusChange,
  clients,
}: FilterBarProps): ReactElement {
  const { t } = useTranslation();

  const clientOptions: SelectOption<string>[] = [
    { value: "", label: t("common.allClients") },
    ...clients.map((c) => ({ value: c.id, label: c.name })),
  ];

  const statusOptions: SelectOption<UserStatus | "">[] = [
    { value: "", label: t("common.allStatuses") },
    { value: USER_STATUS.ACTIVE, label: t("status.active") },
    { value: USER_STATUS.INACTIVE, label: t("status.inactive") },
    { value: USER_STATUS.PENDING, label: t("status.pending") },
  ];

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          {t("users.client")}
        </label>
        <Select
          value={clientId}
          options={clientOptions}
          onChange={onClientChange}
          aria-label={t("users.client")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          {t("users.detail.status")}
        </label>
        <Select
          value={status}
          options={statusOptions}
          onChange={onStatusChange}
          aria-label={t("users.detail.status")}
        />
      </div>
    </div>
  );
}