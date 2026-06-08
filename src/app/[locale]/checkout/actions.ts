'use server';

import {mutate} from '@/lib/vendure/api';
import {getAuthToken} from '@/lib/auth';
import {
    SetOrderShippingAddressMutation,
    SetOrderBillingAddressMutation,
    SetOrderShippingMethodMutation,
    AddPaymentToOrderMutation,
    CreateCustomerAddressMutation,
    TransitionOrderToStateMutation,
    SetCustomerForOrderMutation,
} from '@/lib/vendure/mutations';
import {revalidatePath, updateTag} from 'next/cache';
import {redirect} from '@/i18n/navigation';
import {getLocale} from 'next-intl/server';

const VENDURE_API_URL = process.env.VENDURE_SHOP_API_URL || process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL;
const VENDURE_CHANNEL_TOKEN = process.env.VENDURE_CHANNEL_TOKEN || process.env.NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN || '__default_channel__';
const VENDURE_AUTH_TOKEN_HEADER = process.env.VENDURE_AUTH_TOKEN_HEADER || 'vendure-auth-token';
const VENDURE_CHANNEL_TOKEN_HEADER = process.env.VENDURE_CHANNEL_TOKEN_HEADER || 'vendure-token';

interface AddressInput {
    fullName: string;
    streetLine1: string;
    streetLine2?: string;
    city: string;
    province: string;
    postalCode: string;
    countryCode: string;
    phoneNumber: string;
    company?: string;
}

export async function setShippingAddress(
    shippingAddress: AddressInput,
    useSameForBilling: boolean
) {
    const shippingResult = await mutate(
        SetOrderShippingAddressMutation,
        {input: shippingAddress},
        {useAuthToken: true}
    );

    if (shippingResult.data.setOrderShippingAddress.__typename !== 'Order') {
        throw new Error('Failed to set shipping address');
    }

    if (useSameForBilling) {
        await mutate(
            SetOrderBillingAddressMutation,
            {input: shippingAddress},
            {useAuthToken: true}
        );
    }

    const locale = await getLocale();
    revalidatePath(`/${locale}/checkout`);
}

export async function setShippingMethod(shippingMethodId: string) {
    const result = await mutate(
        SetOrderShippingMethodMutation,
        {shippingMethodId: [shippingMethodId]},
        {useAuthToken: true}
    );

    if (result.data.setOrderShippingMethod.__typename !== 'Order') {
        throw new Error('Failed to set shipping method');
    }

    const locale = await getLocale();
    revalidatePath(`/${locale}/checkout`);
}

export async function createCustomerAddress(address: AddressInput) {
    const result = await mutate(
        CreateCustomerAddressMutation,
        {input: address},
        {useAuthToken: true}
    );

    if (!result.data.createCustomerAddress) {
        throw new Error('Failed to create customer address');
    }

    const locale = await getLocale();
    revalidatePath(`/${locale}/checkout`);
    return result.data.createCustomerAddress;
}

export async function transitionToArrangingPayment() {
    const result = await mutate(
        TransitionOrderToStateMutation,
        {state: 'ArrangingPayment'},
        {useAuthToken: true}
    );

    if (result.data.transitionOrderToState?.__typename === 'OrderStateTransitionError') {
        const errorResult = result.data.transitionOrderToState;
        throw new Error(
            `Failed to transition order state: ${errorResult.errorCode} - ${errorResult.message}`
        );
    }

    const locale = await getLocale();
    revalidatePath(`/${locale}/checkout`);
}

async function mutateVendureRaw<TResult>(query: string): Promise<TResult> {
    if (!VENDURE_API_URL) {
        throw new Error('Vendure Shop API URL is not configured');
    }

    const authToken = await getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        [VENDURE_CHANNEL_TOKEN_HEADER]: VENDURE_CHANNEL_TOKEN,
    };

    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(VENDURE_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({query}),
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`Vendure API request failed with status ${response.status}`);
    }

    const newToken = response.headers.get(VENDURE_AUTH_TOKEN_HEADER);
    const result: {data?: TResult; errors?: Array<{message: string}>} = await response.json();

    if (result.errors?.length) {
        throw new Error(result.errors.map((error) => error.message).join(', '));
    }

    if (!result.data) {
        throw new Error('No data returned from Vendure API');
    }

    // createStripePaymentIntent keeps using the existing auth-token cookie. If Vendure
    // rotates the token, the shared API helper will persist it on the next normal mutation.
    void newToken;

    return result.data;
}

export async function createStripePaymentIntent(): Promise<{clientSecret: string}> {
    await transitionToArrangingPayment();

    const result = await mutateVendureRaw<{createStripePaymentIntent: string}>(`
        mutation CreateStripePaymentIntent {
            createStripePaymentIntent
        }
    `);

    return {clientSecret: result.createStripePaymentIntent};
}

export async function completeStripeOrder(orderCode: string) {
    updateTag('cart');
    updateTag('active-order');

    // Brief async settle: give the Stripe webhook a moment to process
    // the payment and move the order out of ArrangingPayment.
    // The order confirmation page handles graceful status display
    // via client-side polling and the updated access strategy.
    const settleWebhook = async () => {
        try {
            // Fire a no-op settle check against Vendure to nudge the order state.
            // The Stripe webhook may still be processing; this is best-effort.
            await mutate(
                TransitionOrderToStateMutation,
                { state: 'ArrangingPayment' },
                { useAuthToken: true }
            );
        } catch {
            // Ignore — the order may already be past ArrangingPayment,
            // or the webhook hasn't fired yet. The confirmation page polls.
        }
    };
    // Start settle check in background — don't await, redirect immediately
    void settleWebhook();

    const locale = await getLocale();
    redirect({ href: `/order-confirmation/${orderCode}`, locale });
}

export async function placeOrder(paymentMethodCode: string) {
    // First, transition the order to ArrangingPayment state
    await transitionToArrangingPayment();

    // Prepare metadata based on payment method
    const metadata: Record<string, unknown> = {};

    // For dummy/external payment handlers, include the required fields
    if (paymentMethodCode === 'standard-payment' || paymentMethodCode === 'external-payment') {
        metadata.shouldDecline = false;
        metadata.shouldError = false;
        metadata.shouldErrorOnSettle = false;
    }

    // Add payment to the order — with automaticSettle dummy handler,
    // this immediately transitions to PaymentSettled and fires the OrderWebhook
    const result = await mutate(
        AddPaymentToOrderMutation,
        {
            input: {
                method: paymentMethodCode,
                metadata,
            },
        },
        {useAuthToken: true}
    );

    if (result.data.addPaymentToOrder.__typename !== 'Order') {
        const errorResult = result.data.addPaymentToOrder;
        throw new Error(
            `Failed to place order: ${errorResult.errorCode} - ${errorResult.message}`
        );
    }

    const orderCode = result.data.addPaymentToOrder.code;

    // Update the cart tag to immediately invalidate cached cart data
    updateTag('cart');
    updateTag('active-order');

    const locale = await getLocale();
    redirect({href: `/order-confirmation/${orderCode}`, locale});
}

interface GuestCustomerInput {
    emailAddress: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
}

export type SetCustomerForOrderResult =
    | { success: true }
    | { success: false; errorCode: 'EMAIL_CONFLICT'; message: string }
    | { success: false; errorCode: 'GUEST_CHECKOUT_DISABLED'; message: string }
    | { success: false; errorCode: 'NO_ACTIVE_ORDER'; message: string }
    | { success: false; errorCode: 'UNKNOWN'; message: string };

export async function setCustomerForOrder(
    input: GuestCustomerInput
): Promise<SetCustomerForOrderResult> {
    const result = await mutate(
        SetCustomerForOrderMutation,
        { input },
        { useAuthToken: true }
    );

    const response = result.data.setCustomerForOrder;

    switch (response.__typename) {
        case 'Order': {
            const locale = await getLocale();
            revalidatePath(`/${locale}/checkout`);
            return { success: true };
        }
        case 'AlreadyLoggedInError':
            return { success: true };
        case 'EmailAddressConflictError':
            return { success: false, errorCode: 'EMAIL_CONFLICT', message: response.message };
        case 'GuestCheckoutError':
            return { success: false, errorCode: 'GUEST_CHECKOUT_DISABLED', message: response.message };
        case 'NoActiveOrderError':
            return { success: false, errorCode: 'NO_ACTIVE_ORDER', message: response.message };
        default:
            return { success: false, errorCode: 'UNKNOWN', message: 'Unknown error' };
    }
}
