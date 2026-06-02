import {getRouteLocale} from '@/i18n/server';
import {cacheLife, cacheTag} from 'next/cache';
import {getTopCollections} from '@/lib/vendure/cached';
import {Link} from '@/i18n/navigation';
import {getTranslations} from 'next-intl/server';

const COPYRIGHT_YEAR = 2026;

async function Copyright() {
    'use cache'
    cacheLife('days');

    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Footer'});

    return (
        <div>
            &copy; {COPYRIGHT_YEAR} {t('copyright')}
        </div>
    )
}

export async function Footer() {
    'use cache'
    cacheLife('days');

    const locale = await getRouteLocale();
    cacheTag(`footer-${locale}`);

    const t = await getTranslations({locale, namespace: 'Footer'});
    const collections = await getTopCollections(locale);

    return (
        <footer className="border-t border-border mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        <Link href="/" className="inline-block mb-4">
                            <img
                                src="https://api.defendfreedomindustries.com/assets/source/f5/dfilogo.png"
                                alt="Defend Freedom Industries"
                                className="h-8 w-auto"
                            />
                        </Link>
                        <p className="text-sm text-muted-foreground text-balance leading-relaxed">
                            {t('description')}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-4">{t('categories')}</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {collections.map((collection) => (
                                <li key={collection.id}>
                                    <Link
                                        href={`/collection/${collection.slug}`}
                                        className="hover:text-foreground transition-colors"
                                    >
                                        {collection.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-4">{t('customer')}</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link
                                    href="/search"
                                    className="hover:text-foreground transition-colors"
                                >
                                    {t('shopAll')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/account/orders"
                                    className="hover:text-foreground transition-colors"
                                >
                                    {t('orders')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/account/profile"
                                    className="hover:text-foreground transition-colors"
                                >
                                    {t('account')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-4">Contact</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a href="mailto:orders@defendfreedomindustries.com" className="hover:text-foreground transition-colors">
                                    orders@defendfreedomindustries.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <Copyright />
                </div>
            </div>
        </footer>
    );
}
