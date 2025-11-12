import { z } from "zod";

export const loginValidation = z.object({
  email: z.email("Email is required").nonempty("Email is required"),
  password: z.string().nonempty("Password is required"),
});
