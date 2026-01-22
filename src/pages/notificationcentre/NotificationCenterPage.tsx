import { useNotifications } from "../../hooks/useNotifications";
import { NotificationCenterView } from "../../components/notificationcentre/NotificationCenterView";

export function NotificationCenterPage({
    onViewPatientDetails,
}: {
    onViewPatientDetails?: (patientId: string) => void;
}) {
    const model = useNotifications();

    return (
        <NotificationCenterView
            model={model}
            onViewPatientDetails={onViewPatientDetails}
        />
    );
}
