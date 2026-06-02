import {NavbarCollections} from '@/components/layout/navbar/navbar-collections';
import {NavbarCart} from '@/components/layout/navbar/navbar-cart';
import {NavbarUser} from '@/components/layout/navbar/navbar-user';
import {MobileNavWrapper} from '@/components/layout/navbar/mobile-nav-wrapper';
import {Suspense} from 'react';
import {SearchInput} from '@/components/layout/search-input';
import {NavbarUserSkeleton} from '@/components/shared/skeletons/navbar-user-skeleton';
import {SearchInputSkeleton} from '@/components/shared/skeletons/search-input-skeleton';

function NavbarCartFallback() {
    return (
        <div className="flex items-center gap-2">
            <a
                href="/en/cart"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                aria-label="Shopping Cart"
            >
                <span aria-hidden="true">🛒</span>
            </a>
            <a
                href="/en/checkout"
                className="hidden sm:inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
                Checkout
            </a>
        </div>
    );
}

export function Navbar() {
    return (
        <>
            <div className="h-16" />
            <header
                id="main-header"
                className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md bg-background/80 transition-transform duration-300"
            >
                <div className="w-full px-4">
                    <div className="flex items-center justify-between h-16 gap-4">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
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
                            <nav className="hidden 2xl:flex items-center gap-4 min-w-0 overflow-x-auto whitespace-nowrap">
                                <Suspense>
                                    <NavbarCollections />
                                </Suspense>
                            </nav>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Suspense fallback={<NavbarCartFallback />}>
                                <NavbarCart />
                            </Suspense>
                            <Suspense fallback={<NavbarUserSkeleton />}>
                                <NavbarUser />
                            </Suspense>
                            <div className="hidden 2xl:flex">
                                <Suspense fallback={<SearchInputSkeleton />}>
                                    <SearchInput />
                                </Suspense>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
