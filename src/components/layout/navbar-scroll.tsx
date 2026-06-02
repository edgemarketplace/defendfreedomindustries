'use client';

import {useEffect, useRef} from 'react';

export function NavbarScrollBehavior() {
    const lastScrollY = useRef(0);

    useEffect(() => {
        const header = document.getElementById('main-header');
        if (!header) return;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < 60) {
                header.style.transform = 'translateY(0)';
            } else if (currentScrollY > lastScrollY.current) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, {passive: true});
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return null;
}
