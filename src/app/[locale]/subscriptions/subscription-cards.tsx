'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, ShoppingCart, CheckCircle2, Loader2 } from 'lucide-react';
import { addToCart } from '@/app/[locale]/product/[slug]/actions';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface SubscriptionProduct {
    id: string;
    name: string;
    description: string;
    variants: Array<{
        id: string;
        name: string;
        priceWithTax: number;
        stockLevel: string;
    }>;
}

interface SubscriptionCardsProps {
    rebelProduct: SubscriptionProduct;
    patriotProduct: SubscriptionProduct;
    t: ReturnType<typeof useTranslations<'Subscriptions'>>;
}

export function SubscriptionCards({ rebelProduct, patriotProduct, t }: SubscriptionCardsProps) {
    const [isPending, startTransition] = useTransition();
    const [addedId, setAddedId] = useState<string | null>(null);

    const handleSubscribe = async (variantId: string, productName: string) => {
        startTransition(async () => {
            const result = await addToCart(variantId, 1);
            if (result.success) {
                setAddedId(variantId);
                toast.success(t('cards.addedToast', { name: productName }));
                setTimeout(() => setAddedId(null), 3000);
            } else {
                toast.error(t('cards.errorToast'), {
                    description: result.error,
                });
            }
        });
    };

    const parseDescription = (html: string) => {
        // Extract list items from HTML
        const items: string[] = [];
        const regex = /<p>[•■]\s*(.+?)<\/p>/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            items.push(match[1].replace(/<\/?strong>/g, ''));
        }
        return items;
    };

    const rebelItems = parseDescription(rebelProduct.description);
    const patriotItems = parseDescription(patriotProduct.description);

    const rebelPrice = rebelProduct.variants[0]?.priceWithTax
        ? (rebelProduct.variants[0].priceWithTax / 100).toFixed(2)
        : '9.99';
    const patriotPrice = patriotProduct.variants[0]?.priceWithTax
        ? (patriotProduct.variants[0].priceWithTax / 100).toFixed(2)
        : '19.99';

    return (
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Rebel Package */}
            <Card className="relative flex flex-col border-border/50 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-lg">
                <CardHeader className="text-center pb-4 space-y-4">
                    <Badge variant="secondary" className="self-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                        <Zap className="h-3 w-3" />
                        {t('cards.rebel.badge')}
                    </Badge>
                    <h2 className="text-2xl font-bold tracking-tight">{t('cards.rebel.title')}</h2>
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-primary">${rebelPrice}</span>
                        <span className="text-muted-foreground text-sm">/{t('cards.perMonth')}</span>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                    <ul className="space-y-3">
                        {rebelItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">{item}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                            <Star className="h-4 w-4 text-amber-500" />
                            {t('cards.rebel.yearlyGiftsTitle')}
                        </div>
                        <p className="text-xs text-muted-foreground">{t('cards.rebel.yearlyGiftsDesc')}</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        size="lg"
                        className="w-full h-12 text-base font-semibold"
                        disabled={isPending}
                        onClick={() => handleSubscribe(rebelProduct.variants[0].id, rebelProduct.name)}
                    >
                        {addedId === rebelProduct.variants[0].id ? (
                            <>
                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                {t('cards.added')}
                            </>
                        ) : isPending ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                {t('cards.processing')}
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                {t('cards.subscribeNow')}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {/* Patriot Package */}
            <Card className="relative flex flex-col border-2 border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gap-1.5 px-4 py-1 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground">
                        <Crown className="h-3 w-3" />
                        {t('cards.patriot.badge')}
                    </Badge>
                </div>
                <CardHeader className="text-center pb-4 space-y-4 pt-8">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight">{t('cards.patriot.title')}</h2>
                        <p className="text-xs text-muted-foreground">{t('cards.patriot.popular')}</p>
                    </div>
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-primary">${patriotPrice}</span>
                        <span className="text-muted-foreground text-sm">/{t('cards.perMonth')}</span>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                    <ul className="space-y-3">
                        {patriotItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">{item}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                            <Star className="h-4 w-4 text-amber-500" />
                            {t('cards.patriot.yearlyGiftsTitle')}
                        </div>
                        <p className="text-xs text-muted-foreground">{t('cards.patriot.yearlyGiftsDesc')}</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        size="lg"
                        className="w-full h-12 text-base font-semibold"
                        disabled={isPending}
                        onClick={() => handleSubscribe(patriotProduct.variants[0].id, patriotProduct.name)}
                    >
                        {addedId === patriotProduct.variants[0].id ? (
                            <>
                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                {t('cards.added')}
                            </>
                        ) : isPending ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                {t('cards.processing')}
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                {t('cards.subscribeNow')}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
