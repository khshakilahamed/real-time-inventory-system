import z from "zod";

export const createDropSchema = z.object({
  body: z.object({
    name: z.string().min(1, "name is required"),
    price: z.number({ coerce: true }).positive("price must be positive"),
    totalStock: z
      .number({ coerce: true })
      .int()
      .min(1, "totalStock must be a positive integer"),
    startsAt: z
      .string()
      .datetime({ message: "startsAt must be a valid ISO date" }) // e.g. "2026-07-15T18:00:00.000Z"
      .refine((val) => new Date(val) >= new Date(), {
        message: "startsAt must be a current or future date",
      })
      .optional(),
    imageUrl: z
      .string()
      .url("imageUrl must be a valid URL")
      .optional()
      .nullable(),
  }),
});
