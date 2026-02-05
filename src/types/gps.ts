export type DeviceLocation = {
    deviceId: string;
    lat: number;
    lng: number;
    status: 'online' | 'offline';
    healthStatus: 'normal' | 'caution' | 'warning' | 'critical';
    lastUpdated: Date;
    patientId?: string;
    patientName?: string;
    rssi?: number; // Signal strength in dBm (-30 to -90)
    accuracy?: number; // GPS Accuracy in meters
};
