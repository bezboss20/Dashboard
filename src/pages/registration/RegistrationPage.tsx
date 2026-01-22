import { useRegistration } from '../../hooks/useRegistration';
import { RegistrationView } from '../../components/registration/RegistrationView';

export function RegistrationPage() {
  const model = useRegistration();

  return <RegistrationView model={model} />;
}
