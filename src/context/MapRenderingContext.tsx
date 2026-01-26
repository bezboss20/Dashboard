import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface MapRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface MapRenderingContextType {
    isGpsPage: boolean;
    setIsGpsPage: (val: boolean) => void;
    placeholderRect: MapRect | null;
    setPlaceholderRect: (rect: MapRect | null) => void;
    mapProps: any;
    setMapProps: (props: any) => void;
}

const MapRenderingContext = createContext<MapRenderingContextType | undefined>(undefined);

export function MapRenderingProvider({ children }: { children: ReactNode }) {
    const [isGpsPage, setIsGpsPage] = useState(false);
    const [placeholderRect, setPlaceholderRect] = useState<MapRect | null>(null);
    const [mapProps, setMapProps] = useState<any>(null);

    return (
        <MapRenderingContext.Provider
            value={{
                isGpsPage,
                setIsGpsPage,
                placeholderRect,
                setPlaceholderRect,
                mapProps,
                setMapProps
            }}
        >
            {children}
        </MapRenderingContext.Provider>
    );
}

export function useMapRendering() {
    const context = useContext(MapRenderingContext);
    if (!context) {
        throw new Error('useMapRendering must be used within a MapRenderingProvider');
    }
    return context;
}
