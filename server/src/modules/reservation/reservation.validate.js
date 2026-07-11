import { z } from "zod";

export const getReservationSchema = z.object({
  query: z.object({
    status: z.enum(["pending", "completed", "cancelled", "expired"]).optional(),
  }),
});
