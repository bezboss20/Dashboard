import React, { useState, useEffect, useMemo, ReactNode } from 'react';

interface ResponsiveScaleShellProps {
    children: ReactNode;
    /** The design width to scale from (default: 2560px) */
    designWidth?: number;
    /** Maximum viewport width for mobile layout (default: 480px) */
    mobileMax?: number;
    /** Minimum scale factor to prevent content from becoming too small */
    minScale?: number;
    /** Maximum scale factor (default: 1) */
    maxScale?: number;
}

/**
 * ResponsiveScaleShell
 * 
 * A global wrapper component that:
 * - Mobile (320px–480px): Keeps the UI exactly as-is (no scaling)
 * - Tablet/Laptop/Desktop (768px–2559px): Scales the UI to visually match 2560px layout
 * - 2560px and above: Shows the normal desktop layout at full scale (scale = 1)
 */
export function ResponsiveScaleShell({
    children,
    designWidth = 2560,
    mobileMax = 1023, // Updated to 1023 to start scaling from 1024
    minScale = 0.1,  // Reduced minScale to allow more aggressive scaling if needed
    maxScale = 1,
}: ResponsiveScaleShellProps) {
    const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
    const [viewportWidth, setViewportWidth] = useState<number>(
        typeof window !== 'undefined' ? window.innerWidth : 2560
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Media query for screens below 1024px (mobile/tablet)
        const mediaQuery = window.matchMedia(`(max-width: ${mobileMax}px)`);

        const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
            setIsSmallScreen(e.matches);
        };

        // Set initial state
        handleMediaChange(mediaQuery);

        // Resize handler for viewport width
        const handleResize = () => {
            setViewportWidth(window.innerWidth);
        };
        handleResize();

        // Add event listeners
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleMediaChange);
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handleMediaChange);
        }
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleMediaChange);
            } else {
                mediaQuery.removeListener(handleMediaChange);
            }
            window.removeEventListener('resize', handleResize);
        };
    }, [mobileMax]);

    /**
     * Determine if we should use scaled desktop layout
     * - Only for viewports >= 1024px AND <= designWidth (2560px)
     * - Not for small screens (mobile/tablet < 1024px)
     */
    const useScaledDesktopLayout = useMemo(() => {
        return !isSmallScreen && viewportWidth >= 1024;
    }, [isSmallScreen, viewportWidth]);

    /**
     * Calculate scale factor
     * - Scales the content to fit the current viewport while maintaining 2560px layout
     * - Clamped between minScale and maxScale
     */
    const scaleFactor = useMemo(() => {
        if (!useScaledDesktopLayout) return 1;

        // If viewport is larger than design width, we still use scale 1 or could scale up.
        // The user said 1024-2560, so for > 2560 we might just keep it at 1 or scale up.
        // Let's assume they want it to fit even if larger (maxScale=1 usually means no scale up).
        const rawScale = viewportWidth / designWidth;
        return Math.max(minScale, Math.min(maxScale, rawScale));
    }, [useScaledDesktopLayout, viewportWidth, designWidth, minScale, maxScale]);

    /**
     * Wrapper styles for scaled content
     * - transform: scale(scaleFactor) - scales down the content
     * - transformOrigin: 'top left' - scales from top-left corner
     * - width: 100 / scaleFactor % - compensates for the scaled width so content fills viewport
     * - height: 100 / scaleFactor % - compensates for the scaled height
     */
    const scaleWrapperStyle: React.CSSProperties | undefined = useScaledDesktopLayout
        ? {
            transform: `scale(${scaleFactor})`,
            transformOrigin: 'top left',
            width: `${(1 / scaleFactor) * 100}%`,
            height: `${(1 / scaleFactor) * 100}%`,
            position: 'absolute',
            top: 0,
            left: 0,
        }
        : undefined;

    if (!useScaledDesktopLayout) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gray-50">
            <div style={scaleWrapperStyle} className="overflow-auto">
                {children}
            </div>
        </div>
    );
}

export default ResponsiveScaleShell;
