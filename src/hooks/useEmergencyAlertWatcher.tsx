import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const POLL_INTERVAL = 15000; // 15 seconds
const API_BASE_URL = 'https://kaleidoscopically-prorailroad-kris.ngrok-free.dev';

export function useEmergencyAlertWatcher(onNewAlert: (alert: any) => void) {
    const { getLocalizedText } = useLanguage();

    // Use localStorage to track which alerts have been notified in this session/device
    const [notifiedIds, setNotifiedIds] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem('notified_alert_ids');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch (e) {
            return new Set();
        }
    });

    // Ref to avoid closure issues in setInterval
    const notifiedIdsRef = useRef(notifiedIds);
    useEffect(() => {
        notifiedIdsRef.current = notifiedIds;
        localStorage.setItem('notified_alert_ids', JSON.stringify(Array.from(notifiedIds)));
    }, [notifiedIds]);

    const pollAlerts = useCallback(async () => {
        try {
            console.log('Polling for new emergency alerts (watcher)...');
            const response = await axios.get(`${API_BASE_URL}/overview`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });

            if (response.data && response.data.success) {
                const alerts = response.data.data.alerts || [];

                alerts.forEach((alert: any) => {
                    const alertId = alert.id || alert._id;
                    const isNew = !notifiedIdsRef.current.has(alertId);

                    // Only process NEW alerts that haven't been notified yet
                    if (isNew && (alert.status === 'NEW' || alert.status === 'active' || !alert.status)) {
                        // Prepare the data for the modal queue
                        const alertData = {
                            id: alertId,
                            patientId: alert.patientId,
                            patientCode: alert.patientCode || 'N/A',
                            patientName: alert.patientName || 'Unknown Patient',
                            severity: alert.severity || 'CAUTION',
                            message: getLocalizedText(alert.message) || alert.type || 'Emergency Alert',
                            timestamp: alert.createdAt || new Date().toISOString(),
                            status: alert.status || 'NEW',
                            type: alert.type || 'Alert',
                            value: alert.value || ''
                        };

                        onNewAlert(alertData);

                        // Mark as notified immediately so it doesn't duplicate in next poll
                        setNotifiedIds(prev => {
                            const next = new Set(prev);
                            next.add(alertId);
                            return next;
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error polling alerts:', error);
        }
    }, [getLocalizedText, onNewAlert]);

    useEffect(() => {
        // Initial poll
        pollAlerts();

        // Polling interval
        const interval = setInterval(pollAlerts, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [pollAlerts]);
}
