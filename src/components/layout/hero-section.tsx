import {Button} from "@/components/ui/button";
import {Link} from '@/i18n/navigation';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/i18n/server';
import Image from 'next/image';
import {ArrowRight, ShieldCheck, Sparkles, Truck} from 'lucide-react';

const heroImages = [
    "https://api.defendfreedomindustries.com/assets/source/f2/20231005_025659790_ios.jpeg",
    "https://api.defendfreedomindustries.com/assets/source/1c/20231005_025312400_ios.jpeg",
    "https://api.defendfreedomindustries.com/assets/source/94/15042.jpeg",
    "https://api.defendfreedomindustries.com/assets/source/40/img_2812.jpeg",
];

export async function HeroSection() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Hero'});
    const carouselImages = [...heroImages, ...heroImages];
    const highlights = [
        {icon: ShieldCheck, label: t('highlights.firstResponder')},
        {icon: Sparkles, label: t('highlights.customWork')},
        {icon: Truck, label: t('highlights.reliableDelivery')},
    ];

    return (
        <section className="relative min-h-[66svh] overflow-hidden bg-background">
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="hero-carousel-track flex h-full w-max gap-3 py-5 md:gap-5 md:py-8">
                    {carouselImages.map((src, index) => (
                        <div
                            key={`${src}-${index}`}
                            className="relative h-full w-[78vw] shrink-0 overflow-hidden rounded-[8px] md:w-[46vw] lg:w-[32vw] transform-gpu"
                        >
                            <Image
                                src={src}
                                alt=""
                                fill
                                priority={index < 2}
                                sizes="(min-width: 1024px) 34vw, (min-width: 768px) 46vw, 78vw"
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="absolute inset-0 bg-background/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/82 to-background/35" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

            <div className="container relative mx-auto flex min-h-[66svh] items-center px-4 py-12 md:py-16">
                <div className="max-w-3xl space-y-5">
                    <div className="inline-flex items-center gap-2 rounded-[8px] border border-border bg-background/85 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur">
                        <ShieldCheck className="size-4 text-primary" />
                        {t('eyebrow')}
                    </div>
                    <h1 className="text-4xl font-bold leading-none tracking-tight text-balance md:text-5xl lg:text-6xl animate-in fade-in slide-in-from-top-4 duration-700 fill-mode-backwards">
                        {t('title')}{" "}
                        <span className="text-primary">{t('titleHighlight')}</span>
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-backwards">
                        {t('subtitle')}
                    </p>
                    <div className="flex flex-col gap-3 pt-1 sm:flex-row animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-backwards">
                        <Button render={<Link href="/search" />} nativeButton={false} size="lg" className="h-10 min-w-44 px-4 text-base">
                            {t('shopNow')}
                            <ArrowRight className="size-4" />
                        </Button>
                        <a
                            href="#collections"
                            className="inline-flex h-10 min-w-44 shrink-0 items-center justify-center rounded-md border border-border bg-background px-4 text-base font-medium shadow-xs transition-all hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                            {t('viewCollections')}
                        </a>
                    </div>
                    <div className="grid max-w-2xl gap-3 pt-3 sm:grid-cols-3">
                        {highlights.map((highlight) => (
                            <div key={highlight.label} className="flex items-center gap-2 rounded-[8px] border bg-background/85 px-3 py-3 text-sm font-medium shadow-sm backdrop-blur">
                                <highlight.icon className="size-4 text-primary" />
                                <span>{highlight.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
