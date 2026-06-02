import {NavbarCollections} from '@/components/layout/navbar/navbar-collections';
import {NavbarCart} from '@/components/layout/navbar/navbar-cart';
import {NavbarUser} from '@/components/layout/navbar/navbar-user';
import {MobileNavWrapper} from '@/components/layout/navbar/mobile-nav-wrapper';
import {Suspense} from 'react';
import {SearchInput} from '@/components/layout/search-input';
import {NavbarUserSkeleton} from '@/components/shared/skeletons/navbar-user-skeleton';
import {SearchInputSkeleton} from '@/components/shared/skeletons/search-input-skeleton';

export function Navbar() {
    return (
        <>
            <div className="h-16" />
            <header
                id="main-header"
                className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md bg-background/80 transition-transform duration-300"
            >
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <Suspense>
                                <MobileNavWrapper />
                            </Suspense>
                            <a href="/en" className="text-xl font-bold shrink-0">
                                <img
                                    src="https://api.defendfreedomindustries.com/assets/source/f5/dfilogo.png"
                                    alt="Defend Freedom Industries"
                                    className="h-8 w-auto"
                                />
                            </a>
                            <nav className="hidden md:flex items-center gap-6">
                                <Suspense>
                                    <NavbarCollections />
                                </Suspense>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:flex">
                                <Suspense fallback={<SearchInputSkeleton />}>
                                    <SearchInput />
                                </Suspense>
                            </div>
                            <Suspense fallback={
                                <div className="flex items-center gap-2">
                                    <a href="/en/cart" className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground" aria-label="Shopping Cart">
                                        <span aria-hidden="true">🛒</span>
                                    </a>
                                    <a href="/en/checkout" className="hidden sm:inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
                                        Checkout
                                    </a>
                                </div>
                            }>
                                <NavbarCart />
                            </Suspense>
                            <Suspense fallback={<NavbarUserSkeleton />}>
                                <NavbarUser />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
