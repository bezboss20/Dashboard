import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onCatch?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        if (this.props.onCatch) {
            this.props.onCatch(error, errorInfo);
        }
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <h2 className="text-sm font-bold uppercase mb-1">Component Error</h2>
                    <p className="text-xs">An error occurred in this section of the UI. Try refreshing the page.</p>
                </div>
            );
        }

        return this.props.children;
    }
}
