import {routing} from '@/i18n/routing';

export function localizePath(path: string, locale: string) {
    return locale === routing.defaultLocale
        ? path
        : path === '/' ? `/${locale}` : `/${locale}${path}`;
}
