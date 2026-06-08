import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ShoppingBag, ClipboardList, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Price } from '@/components/commerce/price';
import { getRouteLocale } from '@/i18n/server';
import { getTranslations } from 'next-intl/server';
import { query } from '@/lib/vendure/api';
import { graphql } from '@/graphql';

const GetOrderByCodeQuery = graphql(`
    query GetOrderByCode($code: String!) {
        orderByCode(code: $code) {
            id
            code
            state
            totalWithTax
            currencyCode
            lines {
                id
                productVariant {
                    id
                    name
                    product {
                        id
                        name
                        slug
                        featuredAsset {
                            id
                            preview
                        }
                    }
                }
                quantity
                linePriceWithTax
            }
            shippingAddress {
                fullName
                company
                streetLine1
                streetLine2
                city
                province
                postalCode
                country
                phoneNumber
            }
            payments {
                id
                method
                amount
                state
                transactionId
            }
        }
    }
`);

interface OrderConfirmationProps {
    paramsPromise: Promise<{ locale: string; code: string }>;
}

async function getOrderByCode(code: string) {
    // Try authenticated query first (works for logged-in users)
    try {
        const { data } = await query(GetOrderByCodeQuery, { code }, { useAuthToken: true });
        return data.orderByCode ?? null;
    } catch {
        // Fall back to public query (works for guest orders with the
        // GuestOrderByCodeAccessStrategy that grants access to payment states)
        try {
            const { data } = await query(GetOrderByCodeQuery, { code });
            return data.orderByCode ?? null;
        } catch {
            return null;
        }
    }
}

function formatOrderState(state: string): string {
    return state
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, s => s.toUpperCase())
        .trim();
}

export async function OrderConfirmation({ paramsPromise }: OrderConfirmationProps) {
    const { code } = await paramsPromise;
    const locale = await getRouteLocale();
    const t = await getTranslations({ locale, namespace: 'OrderConfirmation' });
    const commonT = await getTranslations({ locale, namespace: 'Common' });
    const order = await getOrderByCode(code);

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="rounded-full bg-amber-500 p-5 shadow-lg shadow-amber-500/20">
                                    <Loader2 className="h-10 w-10 text-white animate-spin" strokeWidth={3} />
                                </div>
                            </div>
                            <CardTitle className="text-3xl">{t('orderConfirmed')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <p className="text-muted-foreground">
                                We received your order. Payment is being confirmed and your order details will be available shortly.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Order reference: <span className="font-semibold text-foreground">{code}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                If your order details do not appear within a few minutes, please check your confirmation email or contact us.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Button nativeButton={false} render={<Link href="/" />} className="flex-1" size="lg">
                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                    {t('continueShopping')}
                                </Button>
                                <Button
                                    nativeButton={false}
                                    render={<a href="mailto:Info@defendfreedomindustries.com" />}
                                    variant="outline"
                                    className="flex-1"
                                    size="lg"
                                >
                                    Contact Support
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const paymentState = order.payments?.[0]?.state ?? null;
    const isPaymentConfirmed = paymentState === 'Settled' || paymentState === 'Authorized' || order.state === 'PaymentSettled' || order.state === 'PaymentAuthorized';

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <div className={`rounded-full p-5 shadow-lg ${isPaymentConfirmed ? 'bg-primary shadow-primary/25' : 'bg-amber-500 shadow-amber-500/20'}`}>
                            {isPaymentConfirmed ? (
                                <Check className="h-10 w-10 text-primary-foreground" strokeWidth={3} />
                            ) : (
                                <Loader2 className="h-10 w-10 text-white animate-spin" strokeWidth={3} />
                            )}
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{t('orderConfirmed')}</h1>
                    <p className="text-muted-foreground">
                        {t('thankYou')}{' '}
                        <span className="font-semibold text-foreground">{order.code}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t('emailConfirmation')}
                    </p>
                    {!isPaymentConfirmed && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Payment status: {paymentState ? formatOrderState(paymentState) : 'Processing'}
                        </div>
                    )}
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>{t('orderSummary')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {order.lines.map((line) => (
                            <div key={line.id} className="flex gap-4 items-center">
                                {line.productVariant.product.featuredAsset && (
                                    <div className="flex-shrink-0">
                                        <Image
                                            src={line.productVariant.product.featuredAsset.preview}
                                            alt={line.productVariant.name}
                                            width={80}
                                            height={80}
                                            className="rounded-lg object-cover h-20 w-20 object-center"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium">{line.productVariant.product.name}</p>
                                    {line.productVariant.name !== line.productVariant.product.name && (
                                        <p className="text-sm text-muted-foreground">
                                            {line.productVariant.name}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-0.5">{t('qty', { quantity: line.quantity })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">
                                        <Price value={line.linePriceWithTax} currencyCode={order.currencyCode} />
                                    </p>
                                </div>
                            </div>
                        ))}

                        <Separator />

                        <div className="flex justify-between items-baseline font-bold text-lg">
                            <span>{t('total')}</span>
                            <span className="text-xl">
                                <Price value={order.totalWithTax} currencyCode={order.currencyCode} />
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {order.shippingAddress && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>{t('shippingAddress')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{order.shippingAddress.fullName}</p>
                            {order.shippingAddress.company && (
                                <p className="text-sm text-muted-foreground">{order.shippingAddress.company}</p>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">
                                {order.shippingAddress.streetLine1}
                                {order.shippingAddress.streetLine2 && `, ${order.shippingAddress.streetLine2}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {order.shippingAddress.city}, {order.shippingAddress.province}{' '}
                                {order.shippingAddress.postalCode}
                            </p>
                            <p className="text-sm text-muted-foreground">{order.shippingAddress.country}</p>
                            {order.shippingAddress.phoneNumber && (
                                <p className="text-sm text-muted-foreground">{order.shippingAddress.phoneNumber}</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button nativeButton={false} render={<Link href="/" />} className="flex-1" size="lg">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        {t('continueShopping')}
                    </Button>
                    <Button nativeButton={false} render={<Link href="/account/orders" />} variant="outline" className="flex-1" size="lg">
                        <ClipboardList className="mr-2 h-4 w-4" />
                        {t('viewOrders')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
