export const getBestPatientId = (item: any): string => {
    if (!item) return '';

    const p = item.patient || {};
    const pIdField = item.patientId;

    const possibleIds = [
        (typeof pIdField === 'string' ? pIdField : undefined),
        p._id,
        p.id,
        (typeof pIdField === 'object' ? pIdField?._id : undefined),
        (typeof pIdField === 'object' ? pIdField?.id : undefined),
        (typeof item.patient === 'string' ? item.patient : undefined)
    ];

    for (const id of possibleIds) {
        if (id && typeof id === 'string' && id.length > 20 && id !== item.patientCode) {
            return id;
        }
    }

    return '';
};

export const getHeartRateSeverity = (hr: number): 'critical' | 'warning' | 'caution' | 'normal' => {
    if (!hr || hr <= 0) return 'normal';
    if (hr > 100 || hr < 50) return 'critical';
    if (hr > 90 || hr < 60) return 'warning';
    if (hr > 85 || hr < 65) return 'caution';
    return 'normal';
};

export const getBreathingRateSeverity = (br: number): 'critical' | 'warning' | 'caution' | 'normal' => {
    if (!br || br <= 0) return 'normal';
    if (br > 25 || br < 10) return 'critical';
    if (br > 22 || br < 12) return 'warning';
    if (br > 20 || br < 14) return 'caution';
    return 'normal';
};

export const statusColors = {
    critical: '#dc2626', // red-600
    warning: '#ea580c',  // orange-600
    caution: '#ca8a04',  // yellow-600
    normal: '#16a34a',   // green-600
    stable: '#16a34a',   // green-600
    gray: '#6b7280'      // gray-500 for neutral/offline
};
