import { z } from 'zod';

export const localeSchema = z.enum(['de']);
export type Locale = z.infer<typeof localeSchema>;

export const navSchema = z.object({
  items: z.array(
    z.object({
      href: z.string(),
      label: z.string(),
    }),
  ),
  contact: z.object({
    label: z.string(),
    mailto: z.string(),
  }),
});
export type NavContent = z.infer<typeof navSchema>;

export const footerSchema = z.object({
  logoLink: z.string(),
  logoAlt: z.string(),
  addressLabel: z.string(),
  addressLines: z.array(z.string()).min(1),
  contactLabel: z.string(),
  contactEmail: z.string().email(),
  githubUrl: z.string().url(),
  secondary: z.object({
    copyright: z.string(),
    links: z.array(
      z.object({
        href: z.string(),
        label: z.string(),
      }),
    ),
  }),
});
export type FooterContent = z.infer<typeof footerSchema>;

export const visionPageSchema = z.object({
  title: z.string(),
  sections: z.array(
    z.object({
      heading: z.string().optional(),
      paragraphs: z.array(z.string()).min(1),
      quote: z.string().optional(),
    }),
  ),
});
export type VisionPageContent = z.infer<typeof visionPageSchema>;

export const processPageSchema = z.object({
  quote: z.string(),
  headline: z.string(),
  phases: z.array(
    z.object({
      title: z.string(),
      body: z.string(),
      image: z.object({
        src: z.string(),
        alt: z.string(),
      }),
    }),
  ),
});
export type ProcessPageContent = z.infer<typeof processPageSchema>;

export const startPageSchema = z.object({
  hero: z.object({
    introLines: z.array(z.string()).min(1),
    highlight: z.string(),
  }),
  headings: z.object({
    teamFit: z.string(),
    techStack: z.string(),
  }),
});
export type StartPageContent = z.infer<typeof startPageSchema>;

export const sympathyTestSchema = z.object({
  intro: z.string(),
  ctaLabel: z.string(),
  scale: z.object({
    left: z.string(),
    right: z.string(),
  }),
  likertLabels: z.array(
    z.object({
      text: z.string(),
      value: z.number(),
    }),
  ),
  initialScores: z.object({
    Innovativ: z.number(),
    Traditionell: z.number(),
    Projektorientiert: z.number(),
    Prozessorientiert: z.number(),
    Agil: z.number(),
    Strukturiert: z.number(),
    Bottom_up: z.number(),
    Top_down: z.number(),
  }),
  questions: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      questionText: z.string(),
      answerType: z.literal('Likert'),
      influenceMapping: z.record(z.record(z.string(), z.number())),
    }),
  ),
});
export type SympathyTestContent = z.infer<typeof sympathyTestSchema>;
