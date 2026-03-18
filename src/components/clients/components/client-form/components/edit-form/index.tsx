import { type ReactElement, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button, BUTTON_VARIANT } from "@/components/ui/button";
import { editClientSchema, type EditClientFormValues } from "@/schemas/client.schema";
import type { Client } from "@/types/client.types";

interface EditFormProps {
  client:     Client;
  onSubmit:   (values: EditClientFormValues) => void;
  onClose:    () => void;
  isLoading?: boolean;
}

export function EditForm({ client, onSubmit, onClose, isLoading }: EditFormProps): ReactElement {
  const { t } = useTranslation();

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
        label={t("clients.webhookUrl")}
        placeholder="https://example.com/webhook"
        hint={t("clients.edit.webhookPlaceholder")}
        error={errors.webhookUrl?.message}
        disabled={isLoading}
        {...register("webhookUrl")}
      />
      <Input
        label="HMAC Secret"
        placeholder={t("clients.edit.hmacPlaceholder")}
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
          {t("common.cancel")}
        </Button>
        <Button type="submit" size="sm" isLoading={isLoading}>
          {t("clients.edit.saveButton")}
        </Button>
      </div>
    </form>
  );
}