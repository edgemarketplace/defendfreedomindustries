import type {Metadata} from "next";
import {Suspense} from "react";
import {getRouteLocale} from "@/i18n/server";
import {HeroSection} from "@/components/layout/hero-section";
import {FeaturedProducts} from "@/components/commerce/featured-products";
import {SITE_NAME, SITE_URL, buildCanonicalUrl} from "@/lib/metadata";
import {BadgeCheck, ClipboardCheck, PackageCheck, PenTool, Shirt, Tag, Users, Zap} from "lucide-react";
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

const audienceKeys = [
    {icon: Shirt, key: 'dutyShirts'},
    {icon: Users, key: 'teamStores'},
    {icon: PackageCheck, key: 'bulkOrders'},
] as const;

const processKeys = [
    {icon: PenTool, key: 'design'},
    {icon: ClipboardCheck, key: 'approve'},
    {icon: PackageCheck, key: 'deliver'},
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

            <section className="border-y bg-foreground text-background">
                <div className="container mx-auto grid gap-6 px-4 py-8 sm:grid-cols-3">
                    {audienceKeys.map((item) => (
                        <div key={item.key} className="flex items-start gap-3">
                            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-background/10">
                                <item.icon className="size-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-wide">{t(`audiences.${item.key}.title`)}</h2>
                                <p className="mt-1 text-sm leading-6 text-background/72">{t(`audiences.${item.key}.description`)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-muted/35 py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                        <div className="max-w-xl">
                            <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t('customOrders.eyebrow')}</p>
                            <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-4xl">
                                {t('customOrders.title')}
                            </h2>
                            <p className="mt-4 text-muted-foreground leading-7">
                                {t('customOrders.description')}
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {processKeys.map((item, index) => (
                                <div key={item.key} className="rounded-[8px] border bg-background p-5 shadow-sm">
                                    <div className="mb-5 flex items-center justify-between">
                                        <div className="flex size-10 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
                                            <item.icon className="size-5" />
                                        </div>
                                        <span className="text-sm font-semibold text-muted-foreground">0{index + 1}</span>
                                    </div>
                                    <h3 className="text-base font-semibold">{t(`customOrders.steps.${item.key}.title`)}</h3>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(`customOrders.steps.${item.key}.description`)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

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
