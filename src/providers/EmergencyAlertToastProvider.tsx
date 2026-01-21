import React, { ReactNode, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { EmergencyAlertToast, ToastAlertData } from '../components/alerts/EmergencyAlertToast';
import { useEmergencyAlertWatcher } from '../hooks/useEmergencyAlertWatcher';

interface EmergencyAlertToastProviderProps {
    children: ReactNode;
}

export const EmergencyAlertToastProvider: React.FC<EmergencyAlertToastProviderProps> = ({ children }) => {

    // Function to trigger the custom emergency toast
    const triggerToast = useCallback((alert: ToastAlertData) => {
        toast.custom(
            (t) => (
                <EmergencyAlertToast
                    alert={alert}
                    visible={t.visible}
                />
            ),
            {
                id: alert.id,
                duration: 4500,
                position: 'top-right',
            }
        );
    }, []);

    // Initialize the background observer that polls for new emergency events
    useEmergencyAlertWatcher(triggerToast);

    return (
        <>
            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={16}
                containerClassName="emergency-toaster-root"
                toastOptions={{
                    className: '',
                    style: {
                        background: 'transparent',
                        boxShadow: 'none',
                        padding: 0,
                    },
                }}
            />
            {children}
        </>
    );
};
