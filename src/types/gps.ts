export type DeviceLocation = {
    deviceId: string;
    lat: number;
    lng: number;
    status: 'online' | 'offline';
    lastUpdated: Date;
    patientId?: string;
    patientName?: string;
};
