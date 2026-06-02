import {CartIcon} from './cart-icon';
import {query} from '@/lib/vendure/api';
import {GetActiveOrderQuery} from '@/lib/vendure/queries';
import {getAuthToken} from '@/lib/auth';

export async function NavbarCart() {
    // Note: not using 'use cache' here because this function uses cookies()
    // via getAuthToken(), which is not available during static generation.
    let cartItemCount = 0;
    try {
        const token = await getAuthToken();
        const orderResult = await query(GetActiveOrderQuery, undefined, {
            token,
            tags: ['cart'],
        });
        cartItemCount = orderResult.data.activeOrder?.totalQuantity || 0;
    } catch {
        // User not authenticated or no active order
    }

    return <CartIcon cartItemCount={cartItemCount} />;
}
