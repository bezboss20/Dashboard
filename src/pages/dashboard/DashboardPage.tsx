import { useDashboardData } from '../../hooks/useDashboardData';
import { DashboardView } from '../../components/dashboard/DashboardView';

interface DashboardPageProps {
    systemOnline: boolean;
    onViewPatientDetails: (patientId: string) => void;
}

export function DashboardPage({ systemOnline, onViewPatientDetails }: DashboardPageProps) {
    const dashboardData = useDashboardData();

    return (
        <DashboardView
            data={dashboardData}
            onViewPatientDetails={onViewPatientDetails}
        />
    );
}
