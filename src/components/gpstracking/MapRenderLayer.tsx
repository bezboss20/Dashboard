import React from 'react';
import { useMapRendering } from '../../context/MapRenderingContext';
import { GPSMap } from './GPSMap';
import { ErrorBoundary } from '../common/ErrorBoundary';

export function MapRenderLayer() {
    const { isGpsPage, placeholderRect, mapProps } = useMapRendering();

    // Always render a base background for non-GPS pages at the very bottom
    if (!isGpsPage) {
        return <div className="fixed inset-0 bg-gray-50 -z-50" />;
    }

    // If we're on GPS page but don't have coordinates or dimensions yet, show a placeholder background
    if (!mapProps || !placeholderRect || placeholderRect.width <= 0) {
        return <div className="fixed inset-0 bg-gray-50 z-0" />;
    }

    const { top, left, width, height } = placeholderRect;

    return (
        <div className="fixed inset-0 z-0 bg-gray-50 overflow-hidden pointer-events-none">
            {/* 
               Root-mounted map container positioned exactly where the UI placeholder is.
            */}
            <div
                className="map-root-container shadow-inner"
                style={{
                    position: 'fixed',
                    top: `${top}px`,
                    left: `${left}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                    pointerEvents: 'auto',
                    zIndex: 2,
                    backgroundColor: '#e5e7eb',
                    borderRadius: '0 0 1rem 1rem',
                    overflow: 'hidden'
                }}
            >
                <ErrorBoundary fallback={
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold text-xs p-8 text-center">
                        <div>
                            <p>MAP RENDERING ERROR</p>
                            <p className="font-normal mt-1">Please navigate back and try again.</p>
                        </div>
                    </div>
                }>
                    <GPSMap {...mapProps} isStandalone={true} />
                </ErrorBoundary>
            </div>

            {/* 
               Layered shadow to match UI card depth
            */}
            <div
                style={{
                    position: 'fixed',
                    top: `${top}px`,
                    left: `${left}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                    boxShadow: 'inset 0 6px 15px rgba(0,0,0,0.15)',
                    borderRadius: '0 0 1rem 1rem',
                    pointerEvents: 'none',
                    zIndex: 3,
                    border: '1px solid rgba(0,0,0,0.05)',
                    borderTop: 'none'
                }}
            />
        </div>
    );
}
