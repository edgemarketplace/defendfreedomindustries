import {Link} from '@/i18n/navigation';
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
                            <Link href="/" className="text-xl font-bold">
                                <img
                                    src="https://api.defendfreedomindustries.com/assets/source/f5/dfilogo.png"
                                    alt="Defend Freedom Industries"
                                    className="h-8 w-auto"
                                />
                            </Link>
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
                            <Suspense>
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
