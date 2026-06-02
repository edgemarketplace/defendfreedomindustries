import {ProductGrid} from '@/components/commerce/product-grid';
import {getActiveCurrencyCode} from '@/lib/currency-server';
import {buildSearchInput, getCurrentPage} from '@/lib/search-helpers';
import {query} from '@/lib/vendure/api';
import {SearchProductsQuery} from '@/lib/vendure/queries';
import {getRouteLocale} from '@/i18n/server';

type SearchParams = {[key: string]: string | string[] | undefined};

interface SearchResultsProps {
    searchParams: Promise<SearchParams>;
}

async function getSearchProducts(searchParams: SearchParams, currencyCode: string) {
    const locale = await getRouteLocale();

    return query(SearchProductsQuery, {
        input: buildSearchInput({searchParams}),
    }, {
        languageCode: locale,
        currencyCode,
        fetch: {cache: 'no-store'},
    });
}

export async function SearchResults({searchParams}: SearchResultsProps) {
    const resolvedSearchParams = await searchParams;
    const currencyCode = await getActiveCurrencyCode();
    const page = getCurrentPage(resolvedSearchParams);
    const productDataPromise = getSearchProducts(resolvedSearchParams, currencyCode);

    return (
        <div className="lg:col-span-4">
            <ProductGrid productDataPromise={productDataPromise} currentPage={page} take={12} />
        </div>
    );
}
