import z from "zod";

export const registrationSchema = z.object({
  body: z.object({
    firstName: z
      .string({
        required_error: "First name is required",
      })
      .min(1, "First name is required")
      .max(50),
    lastName: z
      .string({
        required_error: "Last name is required",
      })
      .min(1, "Last name is required")
      .max(50),
    email: z.email({
      required_error: "Email is required",
    }),
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(1, "Password is required")
      .min(6, { message: "Password should be at least 6 characters" }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email({
      required_error: "Email is required",
    }),
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(1, "Password is required"),
  }),
});
