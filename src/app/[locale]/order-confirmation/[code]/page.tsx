import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { getRouteLocale } from '@/i18n/server';
import { noIndexRobots } from '@/lib/metadata';
import { OrderConfirmation } from './order-confirmation';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({ locale, namespace: 'OrderConfirmation' });
    return {
        title: t('pageTitle'),
        robots: noIndexRobots(),
    };
}

export default async function OrderConfirmationPage(props: PageProps<'/[locale]/order-confirmation/[code]'>) {
    const locale = await getRouteLocale();
    const t = await getTranslations({ locale, namespace: 'Common' });

    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="text-muted-foreground">{t('loading')}</p>
            </div>
        }>
            <OrderConfirmation paramsPromise={props.params} />
        </Suspense>
    );
}
