import { UserPlus } from 'lucide-react';
import { BasicInfoForm } from './BasicInfoForm';
import { SubmitActions } from './SubmitActions';
import { useRegistration } from '../../hooks/useRegistration';

interface RegistrationViewProps {
    model: ReturnType<typeof useRegistration>;
}

export function RegistrationView({ model }: RegistrationViewProps) {
    const { state, actions, t, language } = model;

    return (
        <div className="w-full min-h-full bg-gray-50 flex flex-col items-stretch">
            {/* Header */}
            <div className="w-full px-4 py-2 bg-white border-b border-gray-200 shrink-0 lg:px-6 lg:py-4 min-[2500px]:px-12 min-[2500px]:py-8">
                <div className="flex items-center gap-2 min-[2500px]:gap-4 min-[2500px]:max-w-none! min-[2500px]:mx-0! w-full">
                    <UserPlus className="w-4 h-4 text-blue-600 lg:w-5 lg:h-5 min-[2500px]:w-8 min-[2500px]:h-8" />
                    <h1 className="text-gray-900 text-md font-medium lg:text-xl min-[2500px]:text-4xl min-[2500px]:font-bold">
                        {t('registration.title')}
                    </h1>
                </div>
            </div>

            {/* Content wrapper */}
            <div className="flex-1 w-full overflow-auto px-1 py-3 sm:p-3 lg:p-6 min-[2500px]:px-12 min-[2500px]:py-10">
                <div className="w-full lg:max-w-none lg:mx-0 sm:max-w-[1400px] sm:mx-auto min-[2500px]:max-w-none! min-[2500px]:mx-0!">
                    <form onSubmit={actions.handleSubmit} className="space-y-4 lg:space-y-6 min-[2500px]:space-y-8">
                        <BasicInfoForm
                            formData={state.formData}
                            language={language}
                            t={t}
                            onInputChange={actions.handleInputChange}
                        />

                        <SubmitActions t={t} onReset={actions.resetForm} />
                    </form>
                </div>
            </div>
        </div>
    );
}
