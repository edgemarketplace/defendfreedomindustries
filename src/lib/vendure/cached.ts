import {cacheLife, cacheTag} from 'next/cache';
import {query} from './api';
import {GetActiveChannelQuery, GetAvailableCountriesQuery, GetTopCollectionsQuery} from './queries';

/**
 * Get the active channel with caching enabled.
 * Channel configuration rarely changes, so we cache it for 1 hour.
 * Channel config is language-independent, so no locale parameter needed.
 */
export async function getActiveChannelCached() {
    'use cache';
    cacheLife('hours');

    const result = await query(GetActiveChannelQuery);
    return result.data.activeChannel;
}

/**
 * Get available countries with caching enabled.
 * Countries list rarely changes, so we cache it with max duration.
 * Country names are translatable, so locale is required.
 */
export async function getAvailableCountriesCached(locale: string) {
    'use cache';
    cacheLife('max');
    cacheTag(`countries-${locale}`);

    const result = await query(GetAvailableCountriesQuery, undefined, {languageCode: locale});
    return result.data.availableCountries || [];
}

/**
 * Get top-level collections with caching enabled.
 * Collections can change in the Vendure admin, so keep the cache short enough
 * for newly-added collections to appear on the storefront automatically.
 * Collection names are translatable, so locale is required.
 */
export async function getTopCollections(locale: string) {
    'use cache';
    cacheLife('hours');
    cacheTag(`collections-${locale}`);

    const result = await query(GetTopCollectionsQuery, undefined, {languageCode: locale});
    return result.data.collections.items;
}
