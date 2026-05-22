import { environment } from '../../../environments/environment';

const apiUrl = environment.apiUrl;
const apiOrigin = apiUrl.replace(/\/api\/?$/, '');

export const APP_CONFIG = {
  apiUrl,
  /** Base origin for serving static files (e.g. /uploads/...) */
  fileBaseUrl: apiOrigin,
  appName: 'حسابات البطاطس',
  defaultLanguage: 'ar',
  supportedLanguages: ['ar', 'en'] as const,
};

export type SupportedLanguage = (typeof APP_CONFIG.supportedLanguages)[number];

/**
 * Convert a relative image path returned by the API (e.g. "/uploads/farmers/abc.jpg")
 * to a fully-qualified URL the browser can load. Returns null if no path.
 */
export function toFullImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return `${APP_CONFIG.fileBaseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
}
