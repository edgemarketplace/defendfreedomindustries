import {Button} from "@/components/ui/button";
import {Link} from '@/i18n/navigation';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/i18n/server';

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

    return (
        <section className="relative overflow-hidden bg-background">
            <div className="absolute inset-0" aria-hidden="true">
                <div className="hero-carousel-track flex h-full w-max gap-4 py-6 md:gap-6 md:py-10">
                    {carouselImages.map((src, index) => (
                        <div
                            key={`${src}-${index}`}
                            className="relative h-full w-[78vw] shrink-0 overflow-hidden rounded-3xl md:w-[46vw] lg:w-[34vw]"
                        >
                            <img
                                src={src}
                                alt=""
                                loading={index < 2 ? "eager" : "lazy"}
                                className="object-cover absolute inset-0 w-full h-full"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="absolute inset-0 bg-background/45 backdrop-blur-[1px]" />
            <div className="absolute inset-0 bg-gradient-to-br from-background/75 via-background/40 to-background/65" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--color-primary)/20,transparent)]" />

            <div className="container relative mx-auto px-4 py-28 md:py-40 lg:py-48">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight animate-in fade-in slide-in-from-top-4 duration-700 fill-mode-backwards">
                        {t('title')}{" "}
                        <span className="text-primary">{t('titleHighlight')}</span>
                    </h1>
                    <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-backwards">
                        {t('subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-backwards">
                        <Button render={<Link href="/search" />} nativeButton={false} size="lg" className="min-w-[200px] text-base">
                            {t('shopNow')}
                        </Button>
                        <a
                            href="#collections"
                            className="inline-flex shrink-0 items-center justify-center rounded-md border bg-clip-padding font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px border-border bg-background shadow-xs hover:bg-muted hover:text-foreground h-10 gap-1.5 px-2.5 min-w-[200px] text-base"
                        >
                            {t('viewCollections')}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
