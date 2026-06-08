import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { getRouteLocale } from '@/i18n/server';
import { query } from '@/lib/vendure/api';
import { GetProductDetailQuery } from '@/lib/vendure/queries';
import { SubscriptionCards } from './subscription-cards';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({ locale, namespace: 'Subscriptions' });
    return {
        title: t('pageTitle'),
        description: t('pageDescription'),
    };
}

async function SubscriptionProducts({ locale, t }: { locale: string; t: Awaited<ReturnType<typeof getTranslations>> }) {
    const [rebelResult, patriotResult] = await Promise.all([
        query(GetProductDetailQuery, { slug: 'rebel-package' }, { languageCode: locale }),
        query(GetProductDetailQuery, { slug: 'patriot-package' }, { languageCode: locale }),
    ]);

    const rebelProduct = rebelResult.data.product;
    const patriotProduct = patriotResult.data.product;

    if (!rebelProduct || !patriotProduct) {
        return null;
    }

    return (
        <SubscriptionCards
            rebelProduct={rebelProduct}
            patriotProduct={patriotProduct}
            t={t}
        />
    );
}

export default async function SubscriptionsPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({ locale, namespace: 'Subscriptions' });

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-border/50">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
                <div className="container mx-auto px-4 py-16 md:py-24 relative">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                            {t('hero.title')}
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            {t('hero.subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Subscription Cards */}
            <section className="container mx-auto px-4 py-12 md:py-20">
                <Suspense fallback={<div className="text-center py-12 text-muted-foreground">{t('loading')}</div>}>
                    <SubscriptionProducts locale={locale} t={t} />
                </Suspense>
            </section>

            {/* Trust Badges */}
            <section className="border-t border-border/50 bg-muted/20">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div className="space-y-2">
                            <div className="text-2xl font-bold text-primary">$9.99+</div>
                            <div className="text-sm text-muted-foreground">{t('trust.startingAt')}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-2xl font-bold text-primary">10-20%</div>
                            <div className="text-sm text-muted-foreground">{t('trust.memberDiscounts')}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-2xl font-bold text-primary">Free</div>
                            <div className="text-sm text-muted-foreground">{t('trust.yearlyGifts')}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-2xl font-bold text-primary">24/7</div>
                            <div className="text-sm text-muted-foreground">{t('trust.support')}</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
