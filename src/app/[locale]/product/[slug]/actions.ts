'use server';

import { mutate } from '@/lib/vendure/api';
import { AddToCartMutation } from '@/lib/vendure/mutations';
import { updateTag } from 'next/cache';
import { setAuthToken, removeAuthToken } from '@/lib/auth';
import { getActiveCurrencyCode } from '@/lib/currency-server';
import { getLocale, getTranslations } from 'next-intl/server';

export async function addToCart(variantId: string, quantity: number = 1) {
  const locale = await getLocale();
  const currencyCode = await getActiveCurrencyCode();
  const t = await getTranslations({locale, namespace: 'Errors'});

  try {
    const result = await mutate(AddToCartMutation, { variantId, quantity }, { useAuthToken: true, currencyCode });

    if (result.token) {
      await setAuthToken(result.token);
    }

    if (result.data.addItemToOrder.__typename === 'Order') {
      updateTag('cart');
      updateTag('active-order');
      return { success: true, order: result.data.addItemToOrder };
    } else {
      // If the error is about order state, clear the stale auth token so a fresh order is created
      const errorMsg = result.data.addItemToOrder.message;
      if (errorMsg && errorMsg.includes('AddingItems')) {
        await removeAuthToken();
        // Retry once without the stale token
        const retryResult = await mutate(AddToCartMutation, { variantId, quantity }, { useAuthToken: false, currencyCode });
        if (retryResult.token) {
          await setAuthToken(retryResult.token);
        }
        if (retryResult.data.addItemToOrder.__typename === 'Order') {
          updateTag('cart');
          updateTag('active-order');
          return { success: true, order: retryResult.data.addItemToOrder };
        }
        return { success: false, error: retryResult.data.addItemToOrder.message };
      }
      return { success: false, error: errorMsg };
    }
  } catch {
    return { success: false, error: t('failedAddToCart') };
  }
}
