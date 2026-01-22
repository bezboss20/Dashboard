import { useMonitoringViewModel } from '../../hooks/useMonitoringViewModel';
import { MonitoringView } from '../../components/monitoring/MonitoringView';

interface MonitoringPageProps {
    onViewPatientDetails: (patientId: string) => void;
    onViewSleepPage?: (patientId: string) => void;
}

export function MonitoringPage({ onViewPatientDetails, onViewSleepPage }: MonitoringPageProps) {
    const viewModel = useMonitoringViewModel();

    return (
        <MonitoringView
            model={viewModel}
            onViewPatientDetails={onViewPatientDetails}
            onViewSleepPage={onViewSleepPage}
        />
    );
}
