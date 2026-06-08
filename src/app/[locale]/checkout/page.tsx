import type {Metadata} from 'next';
import {connection} from 'next/server';
import {unstable_noStore as noStore} from 'next/cache';
import {getActiveCurrencyCode} from '@/lib/currency-server';
import {getRouteLocale} from '@/i18n/server';
import {getTranslations} from 'next-intl/server';
import {query} from '@/lib/vendure/api';
import {
    GetActiveCustomerQuery,
    GetActiveOrderForCheckoutQuery,
    GetCustomerAddressesQuery,
    GetEligiblePaymentMethodsQuery,
    GetEligibleShippingMethodsQuery,
} from '@/lib/vendure/queries';
import {redirect} from '@/i18n/navigation';
import CheckoutFlow from './checkout-flow';
import {CheckoutProvider} from './checkout-provider';
import {noIndexRobots} from '@/lib/metadata';
import {getAvailableCountriesCached} from '@/lib/vendure/cached';
import {getAuthToken} from '@/lib/auth';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Checkout'});
    return {
        title: t('pageTitle'),
        robots: noIndexRobots(),
    };
}

export default async function CheckoutPage() {
    await connection();
    noStore();

    const locale = await getRouteLocale();
    const currencyCode = await getActiveCurrencyCode();
    const t = await getTranslations({locale, namespace: 'Checkout'});
    const authToken = await getAuthToken();

    // Fetch customer — if this fails, treat as guest
    let customer = null;
    try {
        const customerRes = await query(GetActiveCustomerQuery, undefined, {
            token: authToken,
            fetch: {cache: 'no-store'},
        });
        customer = customerRes.data.activeCustomer;
    } catch {
        // No active customer / guest checkout
    }
    const isGuest = !customer;

    const perSessionFetch = {cache: 'no-store' as const};

    // Fetch all checkout data — if any critical query fails, redirect to cart
    let orderRes, addressesRes, countries, shippingMethodsRes, paymentMethodsRes;
    try {
        [orderRes, addressesRes, countries, shippingMethodsRes, paymentMethodsRes] =
            await Promise.all([
                query(GetActiveOrderForCheckoutQuery, {}, {token: authToken, currencyCode, fetch: perSessionFetch}),
                isGuest
                    ? Promise.resolve({ data: { activeCustomer: null } })
                    : query(GetCustomerAddressesQuery, {}, {token: authToken, fetch: perSessionFetch}),
                getAvailableCountriesCached(locale),
                query(GetEligibleShippingMethodsQuery, {}, {token: authToken, currencyCode, fetch: perSessionFetch}),
                query(GetEligiblePaymentMethodsQuery, {}, {token: authToken, currencyCode, fetch: perSessionFetch}),
            ]);
    } catch {
        // If any query fails (e.g. Vendure API unreachable), redirect to cart
        return redirect({href: '/cart', locale});
    }

    const activeOrder = orderRes.data.activeOrder;

    if (!activeOrder || activeOrder.lines.length === 0) {
        return redirect({href: '/cart', locale});
    }

    if (activeOrder.state !== 'AddingItems' && activeOrder.state !== 'ArrangingPayment') {
        return redirect({href: `/order-confirmation/${activeOrder.code}`, locale});
    }

    const addresses = addressesRes.data.activeCustomer?.addresses || [];
    const shippingMethods = shippingMethodsRes.data.eligibleShippingMethods || [];
    const paymentMethods =
        paymentMethodsRes.data.eligiblePaymentMethods?.filter((m) => m.isEligible) || [];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">{t('pageTitle')}</h1>
            <CheckoutProvider
                order={activeOrder}
                addresses={addresses}
                countries={countries}
                shippingMethods={shippingMethods}
                paymentMethods={paymentMethods}
                isGuest={isGuest}
            >
                <CheckoutFlow/>
            </CheckoutProvider>
        </div>
    );
}
