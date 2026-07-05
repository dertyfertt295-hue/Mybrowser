import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  errorMessage: string | null;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    errorMessage: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      errorMessage: error.message || 'Неизвестная ошибка приложения.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Navigator crashed:', error, errorInfo);
  }

  render() {
    if (this.state.errorMessage) {
      return (
        <main className="setup-shell">
          <section className="setup-card" role="alert">
            <p className="eyebrow">Ошибка приложения</p>
            <h1>Навигатор не смог запуститься</h1>
            <p className="description">
              Вместо белого экрана показываем причину сбоя. Попробуйте обновить страницу или откройте сайт в
              современном браузере с поддержкой WebGL.
            </p>
            <p className="status-message error">{this.state.errorMessage}</p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
