import {getRouteLocale} from '@/i18n/server';
import {getTopCollections} from '@/lib/vendure/cached';
import {MobileNav} from '@/components/layout/navbar/mobile-nav';

export async function MobileNavWrapper() {
    const locale = await getRouteLocale();

    const collections = await getTopCollections(locale);

    return <MobileNav collections={collections} />;
}
