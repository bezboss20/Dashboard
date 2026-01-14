import { useState } from 'react';
import { PatientOverviewTable } from '../components/PatientOverviewTable';
import { mockPatients } from '../data/mockData';

interface MonitoringPageProps {
    onViewPatientDetails: (patientId: string) => void;
}

export function MonitoringPage({ onViewPatientDetails }: MonitoringPageProps) {
    const [selectedPatientId, setSelectedPatientId] = useState<string>(mockPatients[0]?.id || 'P001');

    return (
        <div className="p-6 space-y-6">
            {/* Patient Overview Table */}
            <PatientOverviewTable
                patients={mockPatients}
                selectedPatientId={selectedPatientId}
                onSelectPatient={setSelectedPatientId}
                onViewPatientDetails={onViewPatientDetails}
            />
        </div>
    );
}
