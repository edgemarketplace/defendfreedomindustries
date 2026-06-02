'use client';

import {useEffect, useMemo, useState} from 'react';
import {useRouter} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Loader2, AlertCircle} from 'lucide-react';
import {Elements, PaymentElement, useElements, useStripe} from '@stripe/react-stripe-js';
import {loadStripe, type StripeElementsOptions} from '@stripe/stripe-js';
import {createStripePaymentIntent, completeStripeOrder} from './actions';

const stripePublishableKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
    'pk_test_51TSidFEEYwBLtqTLOXX9wRaBXn49b9r0fyC99kpdzlko2xa4sUQdEVyMd7X7HM14Q1NDK7JgUKYGf9561hNi8MJ900lYx9lxpU';
const stripePromise = loadStripe(stripePublishableKey);

interface StripePaymentPanelProps {
    orderCode: string;
    disabled?: boolean;
}

export default function StripePaymentPanel({orderCode, disabled}: StripePaymentPanelProps) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingIntent, setLoadingIntent] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadIntent() {
            setLoadingIntent(true);
            setError(null);
            try {
                const result = await createStripePaymentIntent();
                if (!cancelled) {
                    setClientSecret(result.clientSecret);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Unable to initialize Stripe payment.');
                }
            } finally {
                if (!cancelled) {
                    setLoadingIntent(false);
                }
            }
        }

        loadIntent();

        return () => {
            cancelled = true;
        };
    }, []);

    const options = useMemo<StripeElementsOptions | undefined>(() => {
        if (!clientSecret) return undefined;
        return {
            clientSecret,
            appearance: {
                theme: 'stripe',
            },
        };
    }, [clientSecret]);

    if (loadingIntent) {
        return (
            <Button disabled className="w-full" size="lg">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading secure payment form...
            </Button>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!stripePromise || !options) return null;

    return (
        <Elements stripe={stripePromise} options={options}>
            <StripePaymentForm orderCode={orderCode} disabled={disabled}/>
        </Elements>
    );
}

function StripePaymentForm({orderCode, disabled}: StripePaymentPanelProps) {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!stripe || !elements || disabled) return;

        setSubmitting(true);
        setError(null);
        try {
            const {error: submitError} = await elements.submit();
            if (submitError) {
                setError(submitError.message || 'Please check your payment details.');
                setSubmitting(false);
                return;
            }

            const {error: paymentError, paymentIntent} = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
                confirmParams: {
                    return_url: `${window.location.origin}/order-confirmation/${orderCode}`,
                },
            });

            if (paymentError) {
                setError(paymentError.message || 'Payment could not be confirmed.');
                setSubmitting(false);
                return;
            }

            if (paymentIntent && ['succeeded', 'processing', 'requires_capture'].includes(paymentIntent.status)) {
                await completeStripeOrder(orderCode);
                return;
            }

            router.push(`/order-confirmation/${orderCode}`);
        } catch (err) {
            if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
                throw err;
            }
            setError(err instanceof Error ? err.message : 'Payment could not be completed.');
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <PaymentElement/>
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <Button
                onClick={handleSubmit}
                disabled={submitting || disabled || !stripe || !elements}
                size="lg"
                className="w-full"
            >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pay and place order
            </Button>
        </div>
    );
}
