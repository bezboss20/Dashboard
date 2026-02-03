export type DeviceLocation = {
    deviceId: string;
    lat: number;
    lng: number;
    status: 'online' | 'offline';
    healthStatus: 'normal' | 'caution' | 'warning' | 'critical';
    lastUpdated: Date;
    patientId?: string;
    patientName?: string;
};
