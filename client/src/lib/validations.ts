import { z } from "zod";

// Form validation schemas
export const adCopyFormSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  brandName: z.string().min(1, "Brand name is required"),
  productDescription: z.string().min(10, "Product description should be at least 10 characters"),
  keyFeatures: z.string().optional(),
  ageRange: z.string()
    .refine(value => value !== "none", { message: "Please select an age range" })
    .optional(),
  gender: z.string()
    .refine(value => value !== "none", { message: "Please select a gender focus" })
    .optional(),
  interests: z.string().optional(),
  tone: z.string()
    .refine(value => value !== "none", { message: "Tone is required" })
    .min(1, "Tone is required"),
  platform: z.string()
    .refine(value => value !== "none", { message: "Platform is required" })
    .min(1, "Platform is required"),
  variations: z.number().min(1).max(10).default(3),
});

export type AdCopyFormValues = z.infer<typeof adCopyFormSchema>;
