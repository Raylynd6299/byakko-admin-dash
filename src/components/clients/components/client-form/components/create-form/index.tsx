import { type ReactElement, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button, BUTTON_VARIANT } from "@/components/ui/button";
import { createClientSchema, type CreateClientFormValues } from "@/schemas/client.schema";

interface CreateFormProps {
  onSubmit:   (values: CreateClientFormValues) => void;
  onClose:    () => void;
  isLoading?: boolean;
}

export function CreateForm({ onSubmit, onClose, isLoading }: CreateFormProps): ReactElement {
  const { t } = useTranslation();

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
        label={t("clients.name")}
        placeholder="my-service"
        hint={t("clients.create.nameHint")}
        error={errors.name?.message}
        disabled={isLoading}
        {...register("name")}
      />
      <Input
        label={t("clients.webhookUrl")}
        placeholder="https://example.com/webhook"
        hint={t("clients.create.webhookHint")}
        error={errors.webhookUrl?.message}
        disabled={isLoading}
        {...register("webhookUrl")}
      />
      <Input
        label="HMAC Secret"
        placeholder="at least 8 characters"
        hint={t("clients.create.hmacHint")}
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
          {t("common.cancel")}
        </Button>
        <Button type="submit" size="sm" isLoading={isLoading}>
          {t("clients.create.title")}
        </Button>
      </div>
    </form>
  );
}