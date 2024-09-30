import { z } from "zod";

export const urlSchema = z.object({
  inputUrl: z.string().url({
    message: "Must be a valid URL" 
  }) 
})

export type UrlSchemaType = z.infer<typeof urlSchema>