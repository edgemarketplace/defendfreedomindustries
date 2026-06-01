import {Link} from '@/i18n/navigation';

type Product = {
    id: string;
    name: string;
    slug: string;
    featuredAsset?: {
        preview: string;
    } | null;
    variants?: {
        id: string;
        priceWithTax: number;
        currencyCode: string;
    }[];
};

async function getProducts() {
    const response = await fetch(process.env.VENDURE_SHOP_API_URL!, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "vendure-token": process.env.VENDURE_CHANNEL_TOKEN || "",
        },
        body: JSON.stringify({
            query: `
                query ProductsFallback {
                    products {
                        totalItems
                        items {
                            id
                            name
                            slug
                            featuredAsset {
                                preview
                            }
                            variants {
                                id
                                priceWithTax
                                currencyCode
                            }
                        }
                    }
                }
            `,
        }),
        cache: "no-store",
    });

    const json = await response.json();

    return json.data.products.items as Product[];
}

export async function SearchResults() {
    const products = await getProducts();

    return (
        <div className="lg:col-span-4">
            {products.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No products found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => {
                        const firstVariant = product.variants?.[0];

                        return (
                            <Link
                                key={product.id}
                                href={`/product/${product.slug}`}
                                className="group overflow-hidden rounded-xl border bg-card transition hover:shadow-lg"
                            >
                                <div className="aspect-square overflow-hidden bg-muted">
                                    {product.featuredAsset?.preview ? (
                                        <img
                                            src={product.featuredAsset.preview}
                                            alt={product.name}
                                            className="h-full w-full object-cover transition group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground">
                                            No image
                                        </div>
                                    )}
                                </div>

                                <div className="p-4">
                                    <h3 className="font-semibold">{product.name}</h3>

                                    {firstVariant && (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            ${(firstVariant.priceWithTax / 100).toFixed(2)}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
