import type {Metadata} from "next";
import {Suspense} from "react";
import {getRouteLocale} from "@/i18n/server";
import {HeroSection} from "@/components/layout/hero-section";
import {FeaturedProducts} from "@/components/commerce/featured-products";
import {SITE_NAME, SITE_URL, buildCanonicalUrl} from "@/lib/metadata";
import {BadgeCheck, Tag, Zap} from "lucide-react";
import {getTranslations} from 'next-intl/server';
import {toOgLocale} from '@/i18n/locale-utils';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});
    const ogLocale = toOgLocale(locale);

    return {
        title: {
            absolute: `${SITE_NAME} - ${t('pageTitle')}`,
        },
        description: t('description'),
        alternates: {
            canonical: buildCanonicalUrl("/"),
        },
        openGraph: {
            title: `${SITE_NAME} - ${t('pageTitle')}`,
            description: t('ogDescription'),
            type: "website",
            locale: ogLocale,
            url: SITE_URL,
        },
    };
}

const featureKeys = [
    {icon: BadgeCheck, key: 'highQuality'},
    {icon: Tag, key: 'bestPrices'},
    {icon: Zap, key: 'fastDelivery'},
] as const;

export default async function Home() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    return (
        <div className="min-h-screen">
            <HeroSection />
            <Suspense>
                <FeaturedProducts />
            </Suspense>

            <section className="py-16 md:py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
                        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t('proof.eyebrow')}</p>
                        <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">
                            {t('whyShopWithUs')}
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-5">
                        {featureKeys.map((feature) => (
                            <div
                                key={feature.key}
                                className="group relative space-y-4 rounded-[8px] border bg-card p-6 transition-all duration-300 hover:shadow-lg"
                            >
                                <div className="w-11 h-11 bg-primary/10 rounded-[8px] flex items-center justify-center transition-colors duration-300 group-hover:bg-primary/20">
                                    <feature.icon className="size-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold">{t(`features.${feature.key}.title`)}</h3>
                                <p className="text-muted-foreground leading-relaxed">{t(`features.${feature.key}.description`)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
