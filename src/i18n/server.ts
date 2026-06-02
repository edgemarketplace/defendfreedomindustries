import {routing} from './routing';

/**
 * Returns the current route locale.
 * Since we only have one locale ('en'), this always returns 'en'.
 * Kept as a function for consistency with the original codebase.
 */
export async function getRouteLocale(): Promise<string> {
    return routing.defaultLocale;
}
