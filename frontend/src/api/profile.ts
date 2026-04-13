import { useMutation } from "@tanstack/react-query";
import { updateCurrentUser, type AuthSessionUser } from "../services/authService";

export function useUpdateProfileMutation(onSuccess: (user: AuthSessionUser) => void) {
  return useMutation({
    mutationFn: updateCurrentUser,
    onSuccess,
  });
}
