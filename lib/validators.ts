import { z } from "zod";

export const leadSchema = z.object({
  prenom: z.string().min(1, "Le prénom est requis").max(100),
  nom: z.string().min(1, "Le nom est requis").max(100),
  societe: z.string().min(1, "La société est requise").max(200),
  email: z.string().email("Email invalide"),
  profil: z.enum(["moe", "moa", "tp", "collectivite", "autre"], {
    errorMap: () => ({ message: "Veuillez sélectionner un profil" }),
  }),
  departement: z.string().max(100).default(""),
  message: z.string().max(2000).optional(),
});

export type LeadSchemaType = z.infer<typeof leadSchema>;

export const contactSchema = leadSchema.extend({
  message: z.string().min(10, "Le message doit faire au moins 10 caractères").max(2000),
});

export type ContactSchemaType = z.infer<typeof contactSchema>;
