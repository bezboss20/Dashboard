/**
 * Logic for deriving and labeling device health status.
 */

export type ConnectionStatus = 'online' | 'offline';
export type DeviceHealthStatus = 'normal' | 'abnormal';

interface DeriveParams {
    connectionStatus: ConnectionStatus | string;
    deviceStatus: string;
}

/**
 * Derives health status based on connection and device status.
 * offline, error, maintenance -> abnormal
 */
export const deriveHealthStatus = ({ connectionStatus, deviceStatus }: DeriveParams): DeviceHealthStatus => {
    if (connectionStatus === 'offline') return 'abnormal';
    if (deviceStatus === 'error' || deviceStatus === 'maintenance') return 'abnormal';
    return 'normal';
};

/**
 * Returns the translation key for health status.
 * Components should use t(getHealthStatusLabel(status)) to get localized text.
 */
export const getHealthStatusLabel = (status: DeviceHealthStatus): string => {
    return status === 'normal' ? 'status.normal' : 'status.abnormal';
};

/**
 * Returns the color classes for health status badges.
 */
export const getHealthStatusClasses = (status: DeviceHealthStatus): string => {
    return status === 'normal'
        ? 'text-green-600 bg-green-50'
        : 'text-red-600 bg-red-50';
};
