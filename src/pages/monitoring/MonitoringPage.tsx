import { useState, useMemo } from 'react';
import { PatientOverviewTable } from '../../components/monitoring/PatientOverviewTable';
import { PatientFilterBar } from '../../components/monitoring/PatientFilterBar';
import { mockPatients, PatientStatus } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';

interface MonitoringPageProps {
    onViewPatientDetails: (patientId: string) => void;
    onViewSleepPage?: (patientId: string) => void;
}

export function MonitoringPage({ onViewPatientDetails, onViewSleepPage }: MonitoringPageProps) {
    const { t } = useLanguage();
    const [selectedPatientId, setSelectedPatientId] = useState<string>(mockPatients[0]?.id || 'P001');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<PatientStatus | 'ALL'>('ALL');

    // Calculate patient counts by status
    const patientCounts = useMemo(() => {
        return {
            active: mockPatients.filter(p => p.patientStatus === 'ACTIVE').length,
            discharged: mockPatients.filter(p => p.patientStatus === 'DISCHARGED').length,
            transferred: mockPatients.filter(p => p.patientStatus === 'TRANSFERRED').length,
        };
    }, []);

    // Filter patients by status
    const filteredByStatus = useMemo(() => {
        if (statusFilter === 'ALL') {
            return mockPatients;
        }
        return mockPatients.filter(p => p.patientStatus === statusFilter);
    }, [statusFilter]);

    return (
        <div className="space-y-4">
            {/* Patient Filter Bar */}
            <PatientFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                patientCounts={patientCounts}
                t={t}
            />

            {/* Patient Overview Table */}
            <PatientOverviewTable
                patients={filteredByStatus}
                selectedPatientId={selectedPatientId}
                onSelectPatient={setSelectedPatientId}
                onViewPatientDetails={onViewPatientDetails}
                onViewSleepPage={onViewSleepPage}
                searchQuery={searchQuery}
            />
        </div>
    );
}
