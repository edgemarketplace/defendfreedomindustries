import {locale as rootLocale} from 'next/root-params';
import {routing} from './routing';

/**
 * Safe wrapper around rootLocale() that validates against routing config
 * and falls back to defaultLocale instead of returning undefined.
 */
export async function getRouteLocale(): Promise<string> {
    const loc = await rootLocale();
    return routing.locales.includes(loc as any) ? loc : routing.defaultLocale;
}
