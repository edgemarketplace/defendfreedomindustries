import Image from "next/image";
import {getRouteLocale} from "@/i18n/server";
import { Link } from '@/i18n/navigation';
import {ArrowRight} from "lucide-react";
import {getTopCollections} from '@/lib/vendure/cached';

export async function FeaturedProducts() {
    const locale = await getRouteLocale();
    const collections = await getTopCollections(locale);

    return (
        <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="mb-10 flex flex-col gap-3 text-center md:mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Collections
                    </h2>
                    <p className="mx-auto max-w-2xl text-muted-foreground">
                        Shop by organization and find the gear made for your team.
                    </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {collections.map((collection) => {
                        const image = collection.featuredAsset ?? collection.assets[0];

                        return (
                            <Link
                                key={collection.id}
                                href={`/collection/${collection.slug}`}
                                className="group relative min-h-64 overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                {image ? (
                                    <Image
                                        src={image.source}
                                        alt={collection.name}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/70 to-primary/20" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/35 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-6">
                                    <h3 className="text-2xl font-bold tracking-tight text-foreground">
                                        {collection.name}
                                    </h3>
                                    <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors group-hover:underline underline-offset-4">
                                        Shop collection
                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    )
}
