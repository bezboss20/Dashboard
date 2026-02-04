import { ZoomIn, ZoomOut, Locate, Layers } from 'lucide-react';

interface MapControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onLocateUser: () => void;
    onToggleLayer: () => void;
}

export function MapControls({ onZoomIn, onZoomOut, onLocateUser, onToggleLayer }: MapControlsProps) {
    return (
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-1000">
            <button
                onClick={onZoomIn}
                className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                title="확대"
            >
                <ZoomIn className="w-5 h-5 text-gray-600" />
            </button>
            <button
                onClick={onZoomOut}
                className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                title="축소"
            >
                <ZoomOut className="w-5 h-5 text-gray-600" />
            </button>
            <button
                onClick={onLocateUser}
                className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                title="현재 위치"
            >
                <Locate className="w-5 h-5 text-gray-600" />
            </button>
            <button
                onClick={onToggleLayer}
                className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                title="레이어 변경"
            >
                <Layers className="w-5 h-5 text-gray-600" />
            </button>
        </div>
    );
}
