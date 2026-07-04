import type { RouteSummary } from '../types/navigation';

interface NavigationPanelProps {
  route: RouteSummary | null;
  locationError: string | null;
  isLocating: boolean;
  onLocate: () => void;
}

const formatDistance = (meters: number) => {
  if (meters < 1000) {
    return `${Math.round(meters)} м`;
  }

  return `${(meters / 1000).toFixed(1)} км`;
};

const formatDuration = (seconds: number) => {
  const minutes = Math.round(seconds / 60);

  if (minutes < 60) {
    return `${minutes} мин`;
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  return `${hours} ч ${restMinutes} мин`;
};

export function NavigationPanel({ route, locationError, isLocating, onLocate }: NavigationPanelProps) {
  return (
    <aside className="navigation-panel" aria-label="Панель навигации">
      <div>
        <p className="eyebrow">Mapbox Navigator</p>
        <h1>Кастомный навигатор</h1>
        <p className="description">
          Поиск адресов, построение маршрута и базовые подсказки работают через официальные сервисы Mapbox.
        </p>
      </div>

      <button className="secondary-button" type="button" onClick={onLocate} disabled={isLocating}>
        {isLocating ? 'Определяем...' : 'Моё местоположение'}
      </button>

      {locationError ? <p className="status-message error">{locationError}</p> : null}

      <section className="route-card" aria-live="polite">
        <h2>Маршрут</h2>
        {route ? (
          <>
            <div className="route-stats">
              <span>{formatDistance(route.distance)}</span>
              <span>{formatDuration(route.duration)}</span>
            </div>
            <ol className="route-steps">
              {route.steps.slice(0, 6).map((step, index) => (
                <li key={`${step.instruction}-${index}`}>
                  <span>{step.instruction}</span>
                  <small>{formatDistance(step.distance)}</small>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p className="status-message">Введите адрес в поиске или задайте точки маршрута на карте.</p>
        )}
      </section>
    </aside>
  );
}
