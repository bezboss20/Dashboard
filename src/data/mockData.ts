export interface SleepHistoryRecord {
    date: string;            // ISO date "YYYY-MM-DD"
    durationHours: number;   // e.g., 7.5
    quality: number;         // 0-100
    stages?: { stage: 'Awake' | 'REM' | 'Light Sleep' | 'Deep Sleep'; percentage: number; durationHours?: number }[];
    interruptions?: number;
    latencyMinutes?: number;
    notes?: string;
}

export type PatientStatus = 'ACTIVE' | 'DISCHARGED' | 'TRANSFERRED';

export interface Alert {
    id: string;
    patientId: string;
    patientName: string;
    patientNameEnglish: string;
    type: '심박 위급' | '호흡 위급' | '낙상 감지';
    severity: 'critical' | 'warning' | 'caution';
    timestamp: Date;
    status: 'active' | 'acknowledged' | 'resolved';
    value?: string;
    acknowledgedAt?: Date;
    acknowledgedBy?: string;
    acknowledgedByEnglish?: string;
    resolvedAt?: Date;
    resolvedBy?: string;
    resolvedByEnglish?: string;
    notes?: string;
}

export interface Patient {
    id: string;
    name: string;
    nameKorean: string;
    nameEnglish: string;
    heartRate: number;
    breathingRate: number;
    sleepState: string;
    alertStatus: 'normal' | 'caution' | 'warning' | 'critical';
    stressIndex: number;
    sleepScore: number;
    sensorConnected: boolean;
    radarDetection: boolean;
    deviceStatus: string;
    deviceId: string;
    patientStatus: PatientStatus;
    lastUpdated: Date;
    heartRateHistory: {
        oneMin: Array<{ value: number; time?: string | Date }>;
        fiveMin: Array<{ value: number; time?: string | Date }>;
        fifteenMin: Array<{ value: number; time?: string | Date }>;
        thirtyMin: Array<{ value: number; time?: string | Date }>;
        oneHour: Array<{ value: number; time?: string | Date }>;
        sixHours: Array<{ value: number; time?: string | Date }>;
        twentyFourHours: Array<{ value: number; time?: string | Date }>;
    };
    breathingRateHistory: {
        oneMin: Array<{ value: number; time?: string | Date }>;
        fiveMin: Array<{ value: number; time?: string | Date }>;
        fifteenMin: Array<{ value: number; time?: string | Date }>;
        thirtyMin: Array<{ value: number; time?: string | Date }>;
        oneHour: Array<{ value: number; time?: string | Date }>;
        sixHours: Array<{ value: number; time?: string | Date }>;
        twentyFourHours: Array<{ value: number; time?: string | Date }>;
    };
    sleepData: {
        duration: number;
        quality: number;
        stages: Array<{
            stage: string;
            duration: number;
            percentage: number;
        }>;
    };
    sleepSession?: {
        bedInTime: string;
        sleepTime: string;
        wakeUpTime: string;
        bedOutTime: string;
        efficiency: number;
        interruptions: number;
        latency: number;
        avgSpO2: number;
        weeklyTrends: Array<{ day: string; hours: number }>;
    };
    sleepHistory: SleepHistoryRecord[];
    events: Array<{
        time: string;
        type: string;
        description: string;
    }>;
    personalInfo: {
        age: number;
        dateOfBirth: string;
        gender: string;
        bloodType: string;
        height: number;
        weight: number;
        roomNumber: string;
        bedNumber: string;
        admissionDate: string;
        contactNumber: string;
        doctorName: string;
        nurseName: string;
        doctorNameEnglish: string;
        nurseNameEnglish: string;
        hospital: string;
        hospitalEnglish: string;
        emergencyContact: {
            name: string;
            nameEnglish: string;
            relationship: string;
            relationshipEnglish: string;
            phone: string;
        };
    };
    medicalHistory: {
        diagnoses: string[];
        allergies: string[];
        medications: any[];
        previousSurgeries: any[];
        chronicConditions: string[];
    };
}

// Generate heart rate history for different time ranges
export const generateHeartRateHistoryAll = (baseRate: number) => {
    const now = new Date();

    // 1 minute - every second for last 60 seconds
    const oneMin = [];
    for (let i = 59; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 1000);
        const variance = Math.random() * 4 - 2;
        oneMin.push({
            time: time.toLocaleTimeString('en-US', { minute: '2-digit', second: '2-digit' }),
            value: Math.round(baseRate + variance)
        });
    }

    // 5 minutes - every 5 seconds for last 5 minutes
    const fiveMin = [];
    for (let i = 59; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 5 * 1000);
        const variance = Math.random() * 6 - 3;
        fiveMin.push({
            time: time.toLocaleTimeString('en-US', { minute: '2-digit', second: '2-digit' }),
            value: Math.round(baseRate + variance)
        });
    }

    // 15 minutes - every 15 seconds
    const fifteenMin = [];
    for (let i = 59; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 15 * 1000);
        const variance = Math.random() * 8 - 4;
        fifteenMin.push({
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            value: Math.round(baseRate + variance)
        });
    }

    // 30 minutes - every 30 seconds
    const thirtyMin = [];
    for (let i = 59; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 30 * 1000);
        const variance = Math.random() * 8 - 4;
        thirtyMin.push({
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            value: Math.round(baseRate + variance)
        });
    }

    // 1 hour - every minute
    const oneHour = [];
    for (let i = 59; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 1000);
        const variance = Math.random() * 8 - 4;
        oneHour.push({
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            value: Math.round(baseRate + variance)
        });
    }

    // 6 hours - every 6 minutes
    const sixHours = [];
    for (let i = 59; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 6 * 60 * 1000);
        const variance = Math.random() * 10 - 5;
        sixHours.push({
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            value: Math.round(baseRate + variance)
        });
    }

    // 24 hours - every hour
    const twentyFourHours = [];
    for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const variance = Math.random() * 10 - 5;
        twentyFourHours.push({
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            value: Math.round(baseRate + variance)
        });
    }

    return {
        oneMin: oneMin,
        fiveMin: fiveMin,
        fifteenMin: fifteenMin,
        thirtyMin: thirtyMin,
        oneHour: oneHour,
        sixHours: sixHours,
        twentyFourHours: twentyFourHours
    };
};

// Generate breathing rate history for different time ranges
export const generateBreathingRateHistoryAll = (baseRate: number) => {
    const now = new Date();

    // 1 minute - every second
    const oneMin = [];
    for (let i = 59; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 1000);
        const variance = Math.random() * 2 - 1;
        oneMin.push({
            time: time.toLocaleTimeString('en-US', { minute: '2-digit', second: '2-digit' }),
            value: Math.round(baseRate + variance)
        });
    }

    // 5 minutes - every 5 seconds
    const fiveMin = [];
    for (let i = 59; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 5 * 1000);
        const variance = Math.random() * 3 - 1.5;
        fiveMin.push({
            time: time.toLocaleTimeString('en-US', { minute: '2-digit', second: '2-digit' }),
            value: Math.round(baseRate + variance)
        });
    }

    // 15 minutes - every 15 seconds
    const fifteenMin = [];
    for (let i = 59; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 15 * 1000);
        const variance = Math.random() * 3 - 1.5;
        fifteenMin.push({
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            value: Math.round(baseRate + variance)
        });
    }

    // 30 minutes - every 30 seconds
    const thirtyMin = [];
    for (let i = 59; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 30 * 1000);
        const variance = Math.random() * 3 - 1.5;
        thirtyMin.push({
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            value: Math.round(baseRate + variance)
        });
    }

    // 1 hour - every minute
    const oneHour = [];
    for (let i = 59; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 1000);
        const variance = Math.random() * 3 - 1.5;
        oneHour.push({
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            value: Math.round(baseRate + variance)
        });
    }

    // 6 hours - every 6 minutes
    const sixHours = [];
    for (let i = 59; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 6 * 60 * 1000);
        const variance = Math.random() * 4 - 2;
        sixHours.push({
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            value: Math.round(baseRate + variance)
        });
    }

    // 24 hours - every hour
    const twentyFourHours = [];
    for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const variance = Math.random() * 4 - 2;
        twentyFourHours.push({
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            value: Math.round(baseRate + variance)
        });
    }

    return {
        oneMin: oneMin,
        fiveMin: fiveMin,
        fifteenMin: fifteenMin,
        thirtyMin: thirtyMin,
        oneHour: oneHour,
        sixHours: sixHours,
        twentyFourHours: twentyFourHours
    };
};

// Deterministic random based on a string seed
const seededRandom = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
};

// Generate deterministic sleep history for a patient
export const generateSleepHistory = (patientId: string, days: number = 90): SleepHistoryRecord[] => {
    const history: SleepHistoryRecord[] = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const seed = patientId + dateStr;
        const rand = (s: string) => seededRandom(seed + s);

        // Realistic variations
        const durationHours = 6 + (rand('dur') * 2.5);
        const quality = 60 + (rand('qual') * 35);
        const latency = 10 + Math.floor(rand('lat') * 30);
        const interruptions = Math.floor(rand('int') * 4);

        history.push({
            date: dateStr,
            durationHours: parseFloat(durationHours.toFixed(1)),
            quality: Math.round(quality),
            latencyMinutes: latency,
            interruptions: interruptions,
            stages: [
                { stage: 'Awake', percentage: 10, durationHours: durationHours * 0.1 },
                { stage: 'REM', percentage: 25, durationHours: durationHours * 0.25 },
                { stage: 'Light Sleep', percentage: 45, durationHours: durationHours * 0.45 },
                { stage: 'Deep Sleep', percentage: 20, durationHours: durationHours * 0.2 }
            ]
        });
    }
    return history;
};

// Helper to get patient by ID
export const getPatientById = (patientId: string): Patient | undefined => {
    return mockPatients.find(p => p.id === patientId);
};

// Helper to get aggregated trend data for Sparklines/Charts
export const getAggregatedSleepTrend = (patientId: string, view: 'Day' | 'Weekly' | 'Monthly') => {
    const patient = getPatientById(patientId);
    if (!patient) return [];

    const history = [...patient.sleepHistory].sort((a, b) => a.date.localeCompare(b.date));

    if (view === 'Day') {
        const latest = history[history.length - 1];
        return [{ label: '금일', hours: latest.durationHours, date: latest.date }];
    }

    if (view === 'Weekly') {
        // Last 7 records
        return history.slice(-7).map(record => {
            const date = new Date(record.date);
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return {
                label: days[date.getDay()],
                hours: record.durationHours,
                date: record.date
            };
        });
    }

    if (view === 'Monthly') {
        // Last 30 records
        return history.slice(-30).map(record => {
            const date = new Date(record.date);
            return {
                label: `${date.getMonth() + 1}/${date.getDate()}`,
                hours: record.durationHours,
                date: record.date
            };
        });
    }

    return [];
};
const koreanFirstNames = ['민준', '서연', '지우', '하은', '도윤', '서준', '예은', '시우', '지훈', '수아', '정우', '유나', '현우', '지아', '준서', '윤서', '건우', '채원', '지호', '다은', '태양', '소율', '승현', '수빈', '민재', '하린', '재윤', '수현', '예준', '지민', '우진', '서아', '현준', '서우', '선우', '아인', '재원', '지유', '이준', '하율', '성민', '지안', '동현', '서현', '주원', '은서', '시윤', '가은', '은우', '채은'];
const englishFirstNames = ['Min-jun', 'Seo-yeon', 'Ji-woo', 'Ha-en', 'Do-yun', 'Seo-jun', 'Ye-en', 'Si-woo', 'Ji-hoon', 'Su-ah', 'Jung-woo', 'Yu-na', 'Hyun-woo', 'Ji-ah', 'Jun-seo', 'Yun-seo', 'Geon-woo', 'Chae-won', 'Ji-ho', 'Da-en', 'Tae-yang', 'So-yul', 'Seung-hyun', 'Su-bin', 'Min-jae', 'Ha-rin', 'Jae-yun', 'Su-hyeon', 'Ye-jun', 'Ji-min', 'Woo-jin', 'Seo-ah', 'Hyun-jun', 'Seo-woo', 'Sun-woo', 'Ah-in', 'Jae-won', 'Ji-yu', 'Lee-jun', 'Ha-yul', 'Seung-min', 'Ji-an', 'Dong-hyun', 'Seo-hyun', 'Ju-won', 'Eun-seo', 'Si-yun', 'Ga-en', 'Eun-woo', 'Chae-en'];
const koreanLastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '전', '홍'];
const englishLastNames = ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho', 'Yoon', 'Jang', 'Lim', 'Han', 'Oh', 'Seo', 'Shin', 'Kwon', 'Hwang', 'An', 'Song', 'Jeon', 'Hong'];

const generateName = (index: number) => {
    const lastNameIndex = index % koreanLastNames.length;
    const firstNameIndex = index % koreanFirstNames.length;
    return {
        ko: koreanLastNames[lastNameIndex] + koreanFirstNames[firstNameIndex],
        en: `${englishLastNames[lastNameIndex]} ${englishFirstNames[firstNameIndex]}`
    };
};

// Helper function to generate random vital signs
const generateVitalSigns = (severity: 'normal' | 'caution' | 'warning' | 'critical') => {
    let heartRate, breathingRate, stressIndex, sleepScore;

    if (severity === 'critical') {
        heartRate = Math.random() > 0.5 ? Math.floor(Math.random() * 25) + 120 : Math.floor(Math.random() * 15) + 35;
        breathingRate = Math.random() > 0.5 ? Math.floor(Math.random() * 10) + 26 : Math.floor(Math.random() * 5) + 5;
        stressIndex = Math.floor(Math.random() * 15) + 85;
        sleepScore = Math.floor(Math.random() * 20) + 30;
    } else if (severity === 'warning') {
        heartRate = Math.random() > 0.5 ? Math.floor(Math.random() * 15) + 100 : Math.floor(Math.random() * 10) + 45;
        breathingRate = Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 20 : Math.floor(Math.random() * 3) + 10;
        stressIndex = Math.floor(Math.random() * 20) + 65;
        sleepScore = Math.floor(Math.random() * 20) + 50;
    } else if (severity === 'caution') {
        heartRate = Math.random() > 0.5 ? Math.floor(Math.random() * 10) + 90 : Math.floor(Math.random() * 10) + 55;
        breathingRate = Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 18 : Math.floor(Math.random() * 2) + 12;
        stressIndex = Math.floor(Math.random() * 15) + 50;
        sleepScore = Math.floor(Math.random() * 15) + 65;
    } else {
        heartRate = Math.floor(Math.random() * 30) + 60;
        breathingRate = Math.floor(Math.random() * 6) + 12;
        stressIndex = Math.floor(Math.random() * 30) + 20;
        sleepScore = Math.floor(Math.random() * 20) + 75;
    }

    return { heartRate, breathingRate, stressIndex, sleepScore };
};

const sleepStates = ['정상 수면', 'REM 수면', '얕은 수면', '깊은 수면'];
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const genders = ['남성', '여성'];
const doctors = [
    { ko: '이민호 과장', en: 'Dr. Lee Min-ho' },
    { ko: '김지수 교수', en: 'Dr. Kim Ji-soo' },
    { ko: '박성훈 전문의', en: 'Dr. Park Sung-hoon' },
    { ko: '최민정 원장', en: 'Dr. Choi Min-jung' },
    { ko: '정해인 교수', en: 'Dr. Jung Hae-in' },
    { ko: '강소라 과장', en: 'Dr. Kang So-ra' }
];
const nurses = [
    { ko: '김지원 간호사', en: 'Nurse Kim Ji-won' },
    { ko: '박민영 간호사', en: 'Nurse Park Min-young' },
    { ko: '이성경 간호사', en: 'Nurse Lee Sung-kyung' },
    { ko: '정소민 간호사', en: 'Nurse Jung So-min' },
    { ko: '최우식 간호사', en: 'Nurse Choi Woo-shik' },
    { ko: '서예지 간호사', en: 'Nurse Seo Ye-ji' }
];

// Helper function to generate auto Patient ID
const generateAutoPatientId = (index: number) => {
    const baseDate = new Date('2024-12-01');
    const daysToAdd = Math.floor(index / 10); // 10 patients per day
    const date = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const randomNum = String(1000 + index).padStart(4, '0');
    return `P${year}${month}${day}-${randomNum}`;
};

// Initial static alerts to ensure consistency across the app
export const mockAlerts: Alert[] = [
    {
        id: 'A001',
        patientId: 'P20241208-1072',
        patientName: '김철수',
        patientNameEnglish: 'Kim Chul-su',
        type: '심박 위급',
        severity: 'critical',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        status: 'active',
        value: '138 BPM'
    },
    {
        id: 'A002',
        patientId: 'P20241208-1073',
        patientName: '이서연',
        patientNameEnglish: 'Lee Seo-yeon',
        type: '호흡 위급',
        severity: 'critical',
        timestamp: new Date(Date.now() - 3 * 60 * 1000),
        status: 'active',
        value: '32 RPM'
    },
    {
        id: 'A003',
        patientId: 'P20241208-1074',
        patientName: '박지후',
        patientNameEnglish: 'Park Ji-hu',
        type: '심박 위급',
        severity: 'critical',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: 'active',
        value: '42 BPM'
    },
    {
        id: 'A004',
        patientId: 'P20241208-1075',
        patientName: '최하은',
        patientNameEnglish: 'Choi Ha-en',
        type: '낙상 감지',
        severity: 'critical',
        timestamp: new Date(Date.now() - 6 * 60 * 1000),
        status: 'active',
        value: 'Fall Detected'
    },
    {
        id: 'A005',
        patientId: 'P20241208-1076',
        patientName: '정도윤',
        patientNameEnglish: 'Jung Do-yun',
        type: '호흡 위급',
        severity: 'critical',
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        status: 'active',
        value: '8 RPM'
    },
    {
        id: 'A006',
        patientId: 'P20241208-1077',
        patientName: '강서준',
        patientNameEnglish: 'Kang Seo-jun',
        type: '심박 위급',
        severity: 'warning',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        status: 'active',
        value: '108 BPM'
    },
    {
        id: 'A007',
        patientId: 'P20241208-1078',
        patientName: '조예은',
        patientNameEnglish: 'Cho Ye-en',
        type: '호흡 위급',
        severity: 'warning',
        timestamp: new Date(Date.now() - 12 * 60 * 1000),
        status: 'active',
        value: '24 RPM'
    },
    {
        id: 'A008',
        patientId: 'P20241208-1079',
        patientName: '윤시우',
        patientNameEnglish: 'Yoon Si-woo',
        type: '심박 위급',
        severity: 'warning',
        timestamp: new Date(Date.now() - 14 * 60 * 1000),
        status: 'active',
        value: '48 BPM'
    },
    {
        id: 'A009',
        patientId: 'P20241209-1080',
        patientName: '장지훈',
        patientNameEnglish: 'Jang Ji-hoon',
        type: '낙상 감지',
        severity: 'warning',
        timestamp: new Date(Date.now() - 16 * 60 * 1000),
        status: 'active',
        value: 'Movement Detected'
    },
    {
        id: 'A010',
        patientId: 'P20241209-1081',
        patientName: '임수아',
        patientNameEnglish: 'Lim Su-ah',
        type: '호흡 위급',
        severity: 'caution',
        timestamp: new Date(Date.now() - 18 * 60 * 1000),
        status: 'active',
        value: '20 RPM'
    },
    {
        id: 'A011',
        patientId: 'P20241209-1082',
        patientName: '한정우',
        patientNameEnglish: 'Han Jung-woo',
        type: '심박 위급',
        severity: 'caution',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        status: 'active',
        value: '94 BPM'
    },
    {
        id: 'A012',
        patientId: 'P20241209-1083',
        patientName: '오유나',
        patientNameEnglish: 'Oh Yu-na',
        type: '호흡 위급',
        severity: 'warning',
        timestamp: new Date(Date.now() - 22 * 60 * 1000),
        status: 'active',
        value: '23 RPM'
    },
    {
        id: 'A013',
        patientId: 'P20241209-1084',
        patientName: '서현우',
        patientNameEnglish: 'Seo Hyun-woo',
        type: '심박 위급',
        severity: 'critical',
        timestamp: new Date(Date.now() - 24 * 60 * 1000),
        status: 'active',
        value: '128 BPM'
    },
    {
        id: 'A014',
        patientId: 'P20241209-1085',
        patientName: '신지아',
        patientNameEnglish: 'Shin Ji-ah',
        type: '낙상 감지',
        severity: 'caution',
        timestamp: new Date(Date.now() - 26 * 60 * 1000),
        status: 'active',
        value: 'Movement Alert'
    },
    {
        id: 'A015',
        patientId: 'P20241209-1086',
        patientName: '권준서',
        patientNameEnglish: 'Kwon Jun-seo',
        type: '호흡 위급',
        severity: 'critical',
        timestamp: new Date(Date.now() - 28 * 60 * 1000),
        status: 'active',
        value: '6 RPM'
    },
    {
        id: 'A016',
        patientId: 'P20241209-1087',
        patientName: '황윤서',
        patientNameEnglish: 'Hwang Yun-seo',
        type: '심박 위급',
        severity: 'warning',
        timestamp: new Date(Date.now() - 35 * 60 * 1000),
        status: 'acknowledged',
        value: '105 BPM',
        acknowledgedAt: new Date(Date.now() - 30 * 60 * 1000),
        acknowledgedBy: '김지수 교수',
        acknowledgedByEnglish: 'Dr. Kim Ji-soo',
        notes: 'Monitoring closely, medications adjusted'
    },
    {
        id: 'A017',
        patientId: 'P20241209-1088',
        patientName: '안건우',
        patientNameEnglish: 'An Geon-woo',
        type: '호흡 위급',
        severity: 'critical',
        timestamp: new Date(Date.now() - 50 * 60 * 1000),
        status: 'acknowledged',
        value: '9 RPM',
        acknowledgedAt: new Date(Date.now() - 45 * 60 * 1000),
        acknowledgedBy: '박성훈 전문의',
        acknowledgedByEnglish: 'Dr. Park Sung-hoon',
        notes: 'Respiratory support initiated'
    },
    {
        id: 'A018',
        patientId: 'P20241209-1089',
        patientName: '송채원',
        patientNameEnglish: 'Song Chae-won',
        type: '낙상 감지',
        severity: 'warning',
        timestamp: new Date(Date.now() - 65 * 60 * 1000),
        status: 'resolved',
        value: 'Fall Detected',
        acknowledgedAt: new Date(Date.now() - 60 * 60 * 1000),
        acknowledgedBy: '박민영 간호사',
        acknowledgedByEnglish: 'Nurse Park Min-young',
        resolvedAt: new Date(Date.now() - 55 * 60 * 1000),
        resolvedBy: '최민정 원장',
        resolvedByEnglish: 'Dr. Choi Min-jung',
        notes: 'Patient evaluated, minor bruising, stable condition'
    },
    {
        id: 'A019',
        patientId: 'P20241210-1090',
        patientName: '전지호',
        patientNameEnglish: 'Jeon Ji-ho',
        type: '심박 위급',
        severity: 'caution',
        timestamp: new Date(Date.now() - 75 * 60 * 1000),
        status: 'resolved',
        value: '96 BPM',
        acknowledgedAt: new Date(Date.now() - 70 * 60 * 1000),
        acknowledgedBy: '이성경 간호사',
        acknowledgedByEnglish: 'Nurse Lee Sung-kyung',
        resolvedAt: new Date(Date.now() - 60 * 60 * 1000),
        resolvedBy: '정해인 교수',
        resolvedByEnglish: 'Dr. Jung Hae-in',
        notes: 'Heart rate normalized after rest period'
    },
    {
        id: 'A020',
        patientId: 'P20241210-1091',
        patientName: '홍다은',
        patientNameEnglish: 'Hong Da-en',
        type: '호흡 위급',
        severity: 'warning',
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
        status: 'resolved',
        value: '22 RPM',
        acknowledgedAt: new Date(Date.now() - 85 * 60 * 1000),
        acknowledgedBy: '정소민 간호사',
        acknowledgedByEnglish: 'Nurse Jung So-min',
        resolvedAt: new Date(Date.now() - 70 * 60 * 1000),
        resolvedBy: '강소라 과장',
        resolvedByEnglish: 'Dr. Kang So-ra',
        notes: 'Breathing exercises performed, condition improved'
    }
];

// Generate 100 patients
const generatePatients = () => {
    const patients = [];

    // Distribution: 70% normal, 15% caution, 10% warning, 5% critical
    const severityDistribution = [
        ...Array(70).fill('normal'),
        ...Array(15).fill('caution'),
        ...Array(10).fill('warning'),
        ...Array(5).fill('critical')
    ];

    for (let i = 0; i < 100; i++) {
        const patientId = generateAutoPatientId(i);
        const namePair = generateName(i);
        let name = namePair.ko;
        let nameEn = namePair.en;

        // Find if this patient has an alert to sync data
        const alert = mockAlerts.find(a => a.patientId === patientId);
        if (alert) {
            name = alert.patientName;
            const alertIndex = parseInt(alert.id.substring(1)) || 0;
            nameEn = generateName(alertIndex).en;
        }

        let severity = severityDistribution[i] as 'normal' | 'caution' | 'warning' | 'critical';
        if (alert) {
            severity = alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'caution';
        }

        const vitals = generateVitalSigns(severity);

        // Override vitals based on alert values
        if (alert && alert.value && alert.value !== 'Fall Detected' && alert.value !== 'Movement Alert' && alert.value !== 'Movement Detected') {
            if (alert.type === '심박 위급') {
                vitals.heartRate = parseInt(alert.value);
            } else if (alert.type === '호흡 위급') {
                vitals.breathingRate = parseInt(alert.value);
            }
        }

        const age = Math.floor(Math.random() * 50) + 30;
        const gender = genders[Math.floor(Math.random() * genders.length)];
        const sleepState = sleepStates[Math.floor(Math.random() * sleepStates.length)];
        const roomNumber = String(Math.floor(Math.random() * 5) + 3) + String(Math.floor(Math.random() * 10)).padStart(2, '0');
        const bedNumber = String.fromCharCode(65 + (i % 4)); // A, B, C, D

        const sleepHistory = generateSleepHistory(patientId, 90);
        const latestSleep = sleepHistory[0];

        const randomDoctor = doctors[Math.floor(Math.random() * doctors.length)];
        const randomNurse = nurses[Math.floor(Math.random() * nurses.length)];
        const emergencyNamePair = generateName(i + 50);

        const patient: Patient = {
            id: patientId,
            name: name,
            nameKorean: name,
            nameEnglish: nameEn,
            heartRate: vitals.heartRate,
            breathingRate: vitals.breathingRate,
            sleepState: sleepState,
            alertStatus: severity,
            stressIndex: vitals.stressIndex,
            sleepScore: latestSleep.quality,
            sensorConnected: Math.random() > 0.05,
            radarDetection: Math.random() > 0.03,
            deviceStatus: Math.random() > 0.1 ? 'online' : 'offline',
            deviceId: `D${20240000 + i}`,
            patientStatus: i < 80 ? 'ACTIVE' : (i < 92 ? 'DISCHARGED' : 'TRANSFERRED'),
            lastUpdated: new Date(Date.now() - Math.random() * 300000),
            heartRateHistory: generateHeartRateHistoryAll(vitals.heartRate),
            breathingRateHistory: generateBreathingRateHistoryAll(vitals.breathingRate),
            sleepHistory: sleepHistory,
            sleepData: {
                duration: latestSleep.durationHours,
                quality: latestSleep.quality,
                stages: latestSleep.stages?.map(s => ({
                    stage: s.stage,
                    duration: s.durationHours || 0,
                    percentage: s.percentage
                })) || []
            },
            sleepSession: {
                bedInTime: '22:25',
                sleepTime: '22:55',
                wakeUpTime: '06:13',
                bedOutTime: '06:31',
                efficiency: 90 + Math.floor(Math.random() * 8),
                interruptions: latestSleep.interruptions || 0,
                latency: latestSleep.latencyMinutes || 0,
                avgSpO2: 95 + Math.floor(Math.random() * 5),
                weeklyTrends: [] // To be derived if needed, but getAggregatedSleepTrend is better
            },
            events: [
                { time: '오전 02:15', type: 'normal', description: '깊은 수면 단계 진입' },
                { time: '오전 04:30', type: 'normal', description: 'REM 수면 단계' }
            ],
            personalInfo: {
                age: age,
                dateOfBirth: `${1930 + age}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
                gender: gender,
                bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
                height: Math.floor(Math.random() * 30) + 155,
                weight: Math.floor(Math.random() * 40) + 50,
                roomNumber: roomNumber,
                bedNumber: bedNumber,
                admissionDate: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
                contactNumber: `+82-10-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
                doctorName: randomDoctor.ko,
                nurseName: randomNurse.ko,
                doctorNameEnglish: randomDoctor.en,
                nurseNameEnglish: randomNurse.en,
                hospital: '국민간호병원',
                hospitalEnglish: 'National Nursing Hospital',
                emergencyContact: {
                    name: emergencyNamePair.ko,
                    nameEnglish: emergencyNamePair.en,
                    relationship: Math.random() > 0.5 ? '배우자' : '자녀',
                    relationshipEnglish: Math.random() > 0.5 ? 'Spouse' : 'Child',
                    phone: `+82-10-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`
                }
            },
            medicalHistory: {
                diagnoses: ['특이사항 없음'],
                allergies: Math.random() > 0.7 ? ['없음'] : ['페니실린 알레르기'],
                medications: [],
                previousSurgeries: [],
                chronicConditions: []
            }
        };

        patients.push(patient);
    }

    return patients;
};

export const mockPatients: Patient[] = generatePatients();

export const registerNewPatient = (patient: Patient) => {
    mockPatients.push(patient);
};

/**
 * Update a patient's status in the mock database.
 * Structured for easy replacement with a real API call.
 * @param patientId - The ID of the patient to update
 * @param newStatus - The new status to set
 * @returns Promise<boolean> - true if update successful, false otherwise
 */
export const updatePatientStatus = async (
    patientId: string,
    newStatus: PatientStatus
): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const patientIndex = mockPatients.findIndex(p => p.id === patientId);

    if (patientIndex === -1) {
        return { success: false, error: 'Patient not found' };
    }

    // Update the patient status
    mockPatients[patientIndex].patientStatus = newStatus;
    mockPatients[patientIndex].lastUpdated = new Date();

    return { success: true };
};
