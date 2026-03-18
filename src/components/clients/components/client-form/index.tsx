import { type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "@/components/ui/dialog";
import { Button, BUTTON_VARIANT } from "@/components/ui/button";
import { CreateForm } from "./components/create-form";
import { EditForm } from "./components/edit-form";
import {
  type CreateClientFormValues,
  type EditClientFormValues,
} from "@/schemas/client.schema";
import type { Client } from "@/types/client.types";

// ─── Mode discrimination ──────────────────────────────────────────────────────

interface CreateMode {
  mode:     "create";
  client?:  never;
  onSubmit: (values: CreateClientFormValues) => void;
}

interface EditMode {
  mode:     "edit";
  client:   Client;
  onSubmit: (values: EditClientFormValues) => void;
}

type ClientFormMode = CreateMode | EditMode;

// ─── Props ────────────────────────────────────────────────────────────────────

type ClientFormProps = ClientFormMode & {
  open:       boolean;
  onClose:    () => void;
  isLoading?: boolean;
};

// ─── ClientForm ───────────────────────────────────────────────────────────────

export function ClientForm({
  open,
  onClose,
  isLoading = false,
  ...modeProps
}: ClientFormProps): ReactElement {
  const { t } = useTranslation();

  const formId   = modeProps.mode === "create" ? "client-create-form" : "client-edit-form";
  const title    = modeProps.mode === "create"
    ? t("clients.create.title")
    : t("clients.edit.title", { name: modeProps.client.name });
  const description = modeProps.mode === "create"
    ? t("clients.create.description")
    : t("clients.edit.description");
  const submitLabel = modeProps.mode === "create"
    ? t("clients.create.title")
    : t("clients.edit.saveButton");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button
            variant={BUTTON_VARIANT.OUTLINE}
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form={formId}
            size="sm"
            isLoading={isLoading}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      {modeProps.mode === "create" ? (
        <CreateForm
          onSubmit={modeProps.onSubmit}
          onClose={onClose}
          isLoading={isLoading}
        />
      ) : (
        <EditForm
          client={modeProps.client}
          onSubmit={modeProps.onSubmit}
          onClose={onClose}
          isLoading={isLoading}
        />
      )}
    </Dialog>
  );
}
