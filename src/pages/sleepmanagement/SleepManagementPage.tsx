import { useSleepAnalytics } from '../../hooks/useSleepAnalytics';
import { SleepManagementView } from '../../components/sleepmanagement/SleepManagementView';

interface SleepManagementPageProps {
  initialPatientId?: string | null;
  onBack?: () => void;
}

export function SleepManagementPage({ initialPatientId, onBack }: SleepManagementPageProps) {
  const model = useSleepAnalytics(initialPatientId);

  return <SleepManagementView model={model} onBack={onBack} />;
}
