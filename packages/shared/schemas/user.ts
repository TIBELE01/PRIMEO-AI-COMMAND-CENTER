import { z } from "zod";

/** Profil de l'utilisateur connecté, tel que renvoyé par `GET /me` de l'API. */
export const currentUserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  fullName: z.string(),
  role: z.enum(["executive", "administrator", "observer"]),
  mfa: z.object({
    required: z.boolean(),
    satisfied: z.boolean(),
  }),
});

export type CurrentUser = z.infer<typeof currentUserSchema>;
