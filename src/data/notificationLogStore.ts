import { mockAlerts, Alert } from './mockData';

export type NotificationLogStatus = "성공" | "실패";

export interface NotificationLog {
    id: string;
    timestamp: string; // YYYY-MM-DD HH:mm
    system: string;
    patientId: string;
    category: string;
    type: string;
    status: NotificationLogStatus;
    details: string;
}

let notificationLogs: NotificationLog[] = [];
let subscribers: (() => void)[] = [];

function notifySubscribers() {
    subscribers.forEach(cb => cb());
}

export function subscribe(cb: () => void) {
    subscribers.push(cb);
    return () => {
        subscribers = subscribers.filter(s => s !== cb);
    };
}

export function formatTimestamp(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}`;
}

export function createLogFromAlert(alert: Alert, action: "created" | "acknowledged" | "resolved"): NotificationLog {
    let type = "";
    let categoryBase = "";

    if (alert.type === '심박 위급') {
        categoryBase = "심박수 모니터링";
        type = alert.severity === 'critical' ? "CRITICAL_HEART_RATE" :
            alert.severity === 'warning' ? "WARNING_HEART_RATE" : "CAUTION_HEART_RATE";
    } else if (alert.type === '호흡 위급') {
        categoryBase = "호흡 모니터링";
        type = alert.severity === 'critical' ? "CRITICAL_BREATHING_RATE" :
            alert.severity === 'warning' ? "WARNING_BREATHING_RATE" : "CAUTION_BREATHING_RATE";
    } else if (alert.type === '낙상 감지') {
        categoryBase = "낙상 감지";
        type = "FALL_DETECTED";
    } else {
        categoryBase = "모니터링";
        type = "ALERT_EVENT";
    }

    const categorySuffix = alert.severity === 'caution' ? "경고" : "긴급 알림";
    const actionLabel = action === 'acknowledged' ? " (확인)" : action === 'resolved' ? " (해결)" : "";

    let details = "";
    if (action === 'created') {
        if (alert.type === '심박 위급') details = "Heart rate exceeded critical threshold";
        else if (alert.type === '호흡 위급') details = "Breathing rate below safe threshold";
        else if (alert.type === '낙상 감지') details = "Fall detected, emergency protocol initiated";
        else details = alert.value || alert.type;
    } else {
        details = `Alert ${action}: ${alert.type} (${alert.id})`;
    }

    return {
        id: `${alert.id}-${action}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: formatTimestamp(new Date()),
        system: "Radar Monitoring System",
        patientId: alert.patientId || "N/A",
        category: `${categoryBase}/${categorySuffix}${actionLabel}`,
        type: type,
        status: "성공",
        details: details
    };
}

export function appendNotificationLog(log: NotificationLog): void {
    notificationLogs.unshift(log);
    notifySubscribers();
}

export function getNotificationLogs(): NotificationLog[] {
    return [...notificationLogs];
}

// Seed the logs
const initialLogs: NotificationLog[] = [
    ...mockAlerts.map(alert => ({
        ...createLogFromAlert(alert, "created"),
        timestamp: formatTimestamp(alert.timestamp)
    })),
    {
        id: "SYS-001",
        timestamp: formatTimestamp(new Date(Date.now() - 3600000)),
        system: "System Health Check",
        patientId: "N/A",
        category: "시스템 관리/상태 확인",
        type: "SYSTEM_HEALTH_CHECK",
        status: "성공",
        details: "All systems operational"
    },
    {
        id: "SYS-002",
        timestamp: formatTimestamp(new Date(Date.now() - 7200000)),
        system: "Data Backup Service",
        patientId: "N/A",
        category: "시스템 관리/백업",
        type: "DATA_BACKUP",
        status: "실패",
        details: "Backup failed - connection timeout"
    }
];

notificationLogs = initialLogs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
