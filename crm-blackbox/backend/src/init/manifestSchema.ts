import { z } from "zod";

export const fieldSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string().optional(),
});

export const manifestSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  defaultView: z.string().optional(),
  allowedWidgets: z.array(z.string()).optional(),
  fields: z.array(fieldSchema).optional(),
});

export type Manifest = z.infer<typeof manifestSchema>;
