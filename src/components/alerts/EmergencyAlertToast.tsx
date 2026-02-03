import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ToastAlertData {
    id: string;
    patientName: string;
    message: string;
}

interface EmergencyAlertToastProps {
    alert: ToastAlertData;
    visible: boolean;
}

export const EmergencyAlertToast: React.FC<EmergencyAlertToastProps> = ({ alert, visible }) => {
    return (
        <div
            className={`
                ${visible ? 'animate-custom-enter' : 'animate-custom-leave'}
                w-[90vw] sm:w-auto sm:min-w-[320px] sm:max-w-md
                bg-red-600 border border-red-700 rounded-2xl shadow-2xl p-4
                pointer-events-auto flex items-center gap-4
                ring-4 ring-red-200/50
            `}
        >
            {/* Minimal Icon */}
            <div className="bg-white/20 p-2 rounded-xl text-white shrink-0">
                <AlertTriangle className="w-6 h-6" />
            </div>

            {/* Compact Content */}
            <div className="min-w-0 flex-1">
                <h3 className="text-white font-black text-sm uppercase tracking-wider truncate mb-0.5">
                    {alert.patientName}
                </h3>
                <p className="text-red-50 text-xs font-bold leading-tight wrap-break-word line-clamp-2">
                    {alert.message}
                </p>
            </div>

            {/* Progress indicator for auto-dismiss */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full overflow-hidden rounded-b-2xl">
                <div className="h-full bg-white animate-progress-shrink" />
            </div>
        </div>
    );
};
