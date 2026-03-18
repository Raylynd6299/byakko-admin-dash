import { useLocation } from "react-router";
import type { User } from "@/types/user.types";

interface LocationState {
  user?: User;
}

export function useDerivedClientId(): string | null {
  const location = useLocation();

  // From navigation state
  const state = location.state as LocationState | undefined;
  if (state?.user?.clientId) return state.user.clientId;

  // From URL query param (fallback)
  const params = new URLSearchParams(location.search);
  const clientIdParam = params.get("clientId");
  if (clientIdParam) return clientIdParam;

  return null;
}