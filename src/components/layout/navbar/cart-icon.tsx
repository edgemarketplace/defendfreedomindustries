'use client';

import {ShoppingCart} from "lucide-react";
import {Button} from "@/components/ui/button";
import { Link } from '@/i18n/navigation';
import {useTranslations} from 'next-intl';


interface CartIconProps {
    cartItemCount: number;
    showCheckout?: boolean;
}

export function CartIcon({cartItemCount, showCheckout = cartItemCount > 0}: CartIconProps) {
    const t = useTranslations('Navigation');
    return (
        <div className="flex items-center gap-2">
            <Button render={<Link href="/cart" />} nativeButton={false} variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5"/>
                {cartItemCount > 0 && (
                    <span
                        className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                    </span>
                )}
                <span className="sr-only">{t('shoppingCart')}</span>
            </Button>
            {showCheckout && (
                <Button render={<Link href="/checkout" />} nativeButton={false} variant="default" size="sm" className="hidden sm:inline-flex">
                    {t('checkout')}
                </Button>
            )}
        </div>
    );
}
