import 'server-only';

import fs from 'fs/promises';
import path from 'path';
import { cache } from 'react';
import { z } from 'zod';

import {
  footerSchema,
  localeSchema,
  navSchema,
  processPageSchema,
  startPageSchema,
  sympathyTestSchema,
  visionPageSchema,
  type FooterContent,
  type Locale,
  type NavContent,
  type ProcessPageContent,
  type StartPageContent,
  type SympathyTestContent,
  type VisionPageContent,
} from './schemas';

const contentRoot = path.join(process.cwd(), 'content');

async function loadJsonFromLocale<T>(
  locale: Locale,
  relativePath: string,
  schema: z.ZodSchema<T>,
): Promise<T> {
  const normalizedLocale = localeSchema.parse(locale);
  const filePath = path.join(contentRoot, normalizedLocale, relativePath);
  const fileContents = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(fileContents);
  return schema.parse(parsed);
}

export const getNavContent = cache(
  async (locale: Locale = 'de'): Promise<NavContent> => {
    return loadJsonFromLocale(locale, 'nav.json', navSchema);
  },
);

export const getFooterContent = cache(
  async (locale: Locale = 'de'): Promise<FooterContent> => {
    return loadJsonFromLocale(locale, 'footer.json', footerSchema);
  },
);

export const getVisionPageContent = cache(
  async (locale: Locale = 'de'): Promise<VisionPageContent> => {
    return loadJsonFromLocale(locale, path.join('pages', 'vision.json'), visionPageSchema);
  },
);

export const getProcessPageContent = cache(
  async (locale: Locale = 'de'): Promise<ProcessPageContent> => {
    return loadJsonFromLocale(
      locale,
      path.join('pages', 'process.json'),
      processPageSchema,
    );
  },
);

export const getStartPageContent = cache(
  async (locale: Locale = 'de'): Promise<StartPageContent> => {
    return loadJsonFromLocale(locale, path.join('pages', 'start.json'), startPageSchema);
  },
);

export const getSympathyTestContent = cache(
  async (locale: Locale = 'de'): Promise<SympathyTestContent> => {
    return loadJsonFromLocale(locale, 'sympathyTest.json', sympathyTestSchema);
  },
);
