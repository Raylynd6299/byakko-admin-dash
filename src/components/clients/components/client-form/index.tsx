import { ReactElement, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button, BUTTON_VARIANT } from "@/components/ui/button";
import {
  createClientSchema,
  editClientSchema,
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

// ─── Create form ──────────────────────────────────────────────────────────────

function CreateForm({
  onSubmit,
  onClose,
  isLoading,
}: {
  onSubmit:   (values: CreateClientFormValues) => void;
  onClose:    () => void;
  isLoading?: boolean;
}): ReactElement {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClientFormValues>({
    resolver: zodResolver(createClientSchema),
  });

  // Reset on unmount
  useEffect(() => (): void => { reset(); }, [reset]);

  return (
    <form
      id="client-create-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <Input
        label="Name"
        placeholder="my-service"
        error={errors.name?.message}
        disabled={isLoading}
        {...register("name")}
      />
      <Input
        label="Webhook URL"
        placeholder="https://example.com/webhook"
        hint="Optional. Receives event notifications."
        error={errors.webhookUrl?.message}
        disabled={isLoading}
        {...register("webhookUrl")}
      />
      <Input
        label="HMAC Secret"
        placeholder="at least 8 characters"
        hint="Optional. Used to sign webhook payloads."
        error={errors.hmacSecret?.message}
        disabled={isLoading}
        type="password"
        {...register("hmacSecret")}
      />

      {/* Footer actions passed via dialog footer slot */}
      <div className="hidden" aria-hidden="true">
        <Button
          type="button"
          variant={BUTTON_VARIANT.OUTLINE}
          size="sm"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" isLoading={isLoading}>
          Create Client
        </Button>
      </div>
    </form>
  );
}

// ─── Edit form ────────────────────────────────────────────────────────────────

function EditForm({
  client,
  onSubmit,
  onClose,
  isLoading,
}: {
  client:     Client;
  onSubmit:   (values: EditClientFormValues) => void;
  onClose:    () => void;
  isLoading?: boolean;
}): ReactElement {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditClientFormValues>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      webhookUrl: client.webhookUrl ?? "",
      hmacSecret: "",
    },
  });

  // Reset whenever the client changes
  useEffect(() => {
    reset({ webhookUrl: client.webhookUrl ?? "", hmacSecret: "" });
  }, [client.id, reset, client.webhookUrl]);

  return (
    <form
      id="client-edit-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <Input
        label="Webhook URL"
        placeholder="https://example.com/webhook"
        hint="Leave blank to remove the current URL."
        error={errors.webhookUrl?.message}
        disabled={isLoading}
        {...register("webhookUrl")}
      />
      <Input
        label="HMAC Secret"
        placeholder="Enter new secret to rotate"
        hint="Leave blank to keep the existing secret."
        error={errors.hmacSecret?.message}
        disabled={isLoading}
        type="password"
        {...register("hmacSecret")}
      />

      <div className="hidden" aria-hidden="true">
        <Button
          type="button"
          variant={BUTTON_VARIANT.OUTLINE}
          size="sm"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" isLoading={isLoading}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}

// ─── ClientForm ───────────────────────────────────────────────────────────────

export function ClientForm({
  open,
  onClose,
  isLoading = false,
  ...modeProps
}: ClientFormProps): ReactElement {
  const formId   = modeProps.mode === "create" ? "client-create-form" : "client-edit-form";
  const title    = modeProps.mode === "create" ? "New Client" : `Edit ${modeProps.client.name}`;
  const submitLabel = modeProps.mode === "create" ? "Create Client" : "Save Changes";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={
        modeProps.mode === "create"
          ? "Register a new API client. The API key will be shown once."
          : "Update webhook URL or rotate the HMAC secret."
      }
      footer={
        <>
          <Button
            variant={BUTTON_VARIANT.OUTLINE}
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
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
