import z from "zod";

export const forgotPasswordValidation = z.object({
  email: z.email("Invalid email address").nonempty("Email is required"),
});

export const resetPasswordValidation = z
  .object({
    email: z.email("Invalid email address").nonempty("Email is required"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .refine(
        (val) => /[A-Z]/.test(val),
        "Password must contain at least one uppercase letter"
      )
      .refine(
        (val) => /[a-z]/.test(val),
        "Password must contain at least one lowercase letter"
      )
      .refine(
        (val) => /[0-9]/.test(val),
        "Password must contain at least one number"
      )
      .refine(
        (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val),
        "Password must contain at least one special character"
      ),

    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .refine(
        (val) => /[A-Z]/.test(val),
        "Password must contain at least one uppercase letter"
      )
      .refine(
        (val) => /[a-z]/.test(val),
        "Password must contain at least one lowercase letter"
      )
      .refine(
        (val) => /[0-9]/.test(val),
        "Password must contain at least one number"
      )
      .refine(
        (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val),
        "Password must contain at least one special character"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
