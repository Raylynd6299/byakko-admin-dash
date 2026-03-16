import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { createCategory, deleteCategory } from "@/services/categories.service";
import { CATEGORY_QUERY_KEYS } from "@/hooks/queries/useCategories";
import type { Category, CreateCategoryInput } from "@/types/category.types";

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateCategory(): UseMutationResult<Category, Error, CreateCategoryInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSuccess: (): void => {
      void queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
    },
  });
}

// ─── Delete ────────────────────────────────────────────────────────────────────

interface DeleteCategoryArgs {
  id:       string;
  clientId: string;
}

export function useDeleteCategory(): UseMutationResult<void, Error, DeleteCategoryArgs> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, clientId }: DeleteCategoryArgs) => deleteCategory(id, clientId),
    onSuccess: (): void => {
      void queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.all });
    },
  });
}