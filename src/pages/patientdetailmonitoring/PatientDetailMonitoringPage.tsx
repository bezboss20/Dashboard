import { usePatientDetail } from '../../hooks/usePatientDetail';
import { PatientDetailView } from '../../components/patientdetailmonitoring/PatientDetailView';

export function PatientDetailMonitoringPage({ patientId, onBack }: { patientId: string; onBack: () => void }) {
    const model = usePatientDetail(patientId);

    return (
        <PatientDetailView model={model} onBack={onBack} />
    );
}
