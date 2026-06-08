import Image from "next/image";
import {getRouteLocale} from "@/i18n/server";
import { Link } from '@/i18n/navigation';
import {ArrowRight} from "lucide-react";
import {getTopCollections} from '@/lib/vendure/cached';
import {getTranslations} from 'next-intl/server';

export async function FeaturedProducts() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});
    const collections = await getTopCollections(locale);

    return (
        <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="mb-10 flex flex-col gap-3 md:mb-12">
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                        {t('collections.eyebrow')}
                    </p>
                    <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-4xl">
                        {t('collections.title')}
                    </h2>
                    <p className="max-w-2xl text-muted-foreground leading-7">
                        {t('collections.description')}
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {collections.map((collection) => {
                        const image = collection.featuredAsset ?? collection.assets[0];

                        return (
                            <Link
                                key={collection.id}
                                href={`/collection/${collection.slug}`}
                                className="group relative min-h-60 overflow-hidden rounded-[8px] border bg-card shadow-sm transition-all duration-300 hover:shadow-xl"
                            >
                                {image ? (
                                    <Image
                                        src={image.source}
                                        alt={collection.name}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/70 to-primary/20" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-background/96 via-background/45 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-5">
                                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                                        {collection.name}
                                    </h3>
                                    <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors group-hover:underline underline-offset-4">
                                        {t('collections.shopCollection')}
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
