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
        type = alert.severity === 'critical' ? "위급_심박수" :
            alert.severity === 'warning' ? "경고_심박수" : "주의_심박수";
    } else if (alert.type === '호흡 위급') {
        categoryBase = "호흡 모니터링";
        type = alert.severity === 'critical' ? "위급_호흡수" :
            alert.severity === 'warning' ? "경고_호흡수" : "주의_호흡수";
    } else if (alert.type === '낙상 감지') {
        categoryBase = "낙상 감지";
        type = "낙상_감지";
    } else {
        categoryBase = "모니터링";
        type = "알림_이벤트";
    }

    const categorySuffix = alert.severity === 'caution' ? "경고" : "긴급 알림";
    const actionLabel = action === 'acknowledged' ? " (확인)" : action === 'resolved' ? " (해결)" : "";

    let details = "";
    if (action === 'created') {
        if (alert.type === '심박 위급') details = "심박수가 위험 기준치를 초과했습니다";
        else if (alert.type === '호흡 위급') details = "호흡수가 안전 기준치 이하입니다";
        else if (alert.type === '낙상 감지') details = "낙상 감지됨, 응급 프로토콜 시작";
        else details = alert.value || alert.type;
    } else {
        const actionText = action === 'acknowledged' ? "확인됨" : "해결됨";
        details = `알림 ${actionText}: ${alert.type} (${alert.id})`;
    }

    return {
        id: `${alert.id}-${action}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: formatTimestamp(new Date()),
        system: "레이더 모니터링 시스템",
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
        system: "시스템 상태 점검",
        patientId: "N/A",
        category: "시스템 관리/상태 확인",
        type: "시스템_상태_점검",
        status: "성공",
        details: "모든 시스템 정상 작동 중"
    },
    {
        id: "SYS-002",
        timestamp: formatTimestamp(new Date(Date.now() - 7200000)),
        system: "데이터 백업 서비스",
        patientId: "N/A",
        category: "시스템 관리/백업",
        type: "데이터_백업",
        status: "실패",
        details: "백업 실패 - 연결 시간 초과"
    }
];

notificationLogs = initialLogs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

