import { z } from "zod";
import type { CourseFAQItem } from "@/types/faq";

export type { CourseFAQItem };

export function calculateCandidateAge(dateString: string): number | null {
  const parts = dateString.trim().split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null;
  }
  const [year, month, day] = parts;
  const birthDate = new Date(year, month - 1, day);
  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return null;
  }
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export const CourseRegistrationSchema = z
  .object({
    nome: z.string().trim().min(2, "Il nome deve contenere almeno 2 caratteri."),
    cognome: z
      .string()
      .trim()
      .min(2, "Il cognome deve contenere almeno 2 caratteri."),
    citta: z.string().trim().min(2, "Inserisci il comune di residenza."),
    dataNascita: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Inserisci una data di nascita valida.")
      .refine(
        (val) => {
          const age = calculateCandidateAge(val);
          return age !== null && age >= 14 && age < 40;
        },
        {
          message:
            "Per partecipare al corso è necessario avere tra i 14 anni compiuti e i 40 anni non ancora compiuti.",
        },
      ),
    telefono: z
      .string()
      .trim()
      .min(8, "Inserisci un recapito telefonico valido (almeno 8 cifre).")
      .regex(
        /^[+\d\s().-]{8,20}$/,
        "Inserisci un numero di telefono valido (es. 392 4700055).",
      ),
    email: z.string().trim().email("Inserisci un indirizzo email valido."),
    privacy: z.boolean().refine((val) => val === true, {
      message:
        "È obbligatorio confermare la presa visione dell'Informativa sulla Privacy per procedere con l'iscrizione.",
    }),
    consensoGenitori: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    const age = calculateCandidateAge(data.dataNascita);
    if (age !== null && age >= 14 && age < 18 && data.consensoGenitori !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["consensoGenitori"],
        message:
          "Per i candidati minorenni (14–17 anni) è obbligatorio confermare che l'esercente la responsabilità genitoriale è informato della candidatura.",
      });
    }
  });

export type CourseRegistrationPayload = z.infer<
  typeof CourseRegistrationSchema
>;

export interface CourseHeroBadge {
  id: string;
  label: string;
  tone: "emerald" | "blue" | "gold";
}

export interface CourseHeroData {
  kicker?: string;
  title: string;
  paragraphs: string[];
  badges?: CourseHeroBadge[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  whatsappCtaLabel: string;
  imageCaptionLeft?: string;
  imageCaptionRight?: string;
}

export interface CourseBenefitItem {
  id: string;
  number: string;
  title: string;
  description: string;
  highlight?: string;
  group: "primary" | "secondary";
}

export interface CourseBenefitsData {
  kicker?: string;
  title: string;
  lead: string;
  kitBoxTitle?: string;
  kitBoxCaption?: string;
  kitBoxItems?: string[];
  items: CourseBenefitItem[];
}

export interface CourseStepItem {
  id: string;
  stepNumber?: string;
  label?: string;
  title: string;
  durationTag?: string;
  description: string;
}

export interface CourseRequirementItem {
  id: string;
  term: string;
  definition: string;
  highlight?: string;
}

export interface CourseStepsAndRequirementsData {
  stepsKicker?: string;
  stepsTitle: string;
  stepsLead: string;
  steps: CourseStepItem[];
  requirementsKicker?: string;
  requirementsTitle: string;
  requirementsLead?: string;
  requirements: CourseRequirementItem[];
}

export interface CourseRegistrationSectionData {
  kicker?: string;
  title: string;
  lead: string;
  whatsappBoxTitle: string;
  whatsappBoxDescription: string;
  whatsappButtonLabel: string;
  sedeCaption: string;
  privacyNotice: string;
  minorsNotice?: string;
  submitLabel: string;
  successTitle: string;
  successMessage: string;
}

export interface CourseDataset {
  activeEdition: string;
  status: "iscrizioni_aperte" | "in_corso" | "prossima_apertura";
  startDate: string;
  schedule: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  contactPhoneDisplay: string;
  whatsappNumber: string;
  whatsappText: string;
  hero: CourseHeroData;
  benefits: CourseBenefitsData;
  journey: CourseStepsAndRequirementsData;
  registration: CourseRegistrationSectionData;
}
