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
 * Returns the localized label for health status.
 */
export const getHealthStatusLabel = (status: DeviceHealthStatus): string => {
    return status === 'normal' ? '정상' : '비정상';
};

/**
 * Returns the color classes for health status badges.
 */
export const getHealthStatusClasses = (status: DeviceHealthStatus): string => {
    return status === 'normal'
        ? 'text-green-600 bg-green-50'
        : 'text-red-600 bg-red-50';
};
