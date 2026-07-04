import type { RouteSummary } from '../types/navigation';

interface NavigationPanelProps {
  route: RouteSummary | null;
  locationError: string | null;
  routeError: string | null;
  isLocating: boolean;
  isRouting: boolean;
  isRoutingConfigured: boolean;
  originQuery: string;
  destinationQuery: string;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onBuildRoute: () => void;
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

export function NavigationPanel({
  route,
  locationError,
  routeError,
  isLocating,
  isRouting,
  isRoutingConfigured,
  originQuery,
  destinationQuery,
  onOriginChange,
  onDestinationChange,
  onBuildRoute,
  onLocate,
}: NavigationPanelProps) {
  const canBuildRoute = Boolean(originQuery.trim() && destinationQuery.trim() && !isRouting && isRoutingConfigured);

  return (
    <aside className="navigation-panel" aria-label="Панель навигации">
      <div>
        <p className="eyebrow">MapLibre / OpenFreeMap / GraphHopper</p>
        <h1>Кастомный навигатор</h1>
        <p className="description">
          Карта работает на MapLibre и OpenFreeMap, а поиск адресов и маршруты строятся через GraphHopper.
        </p>
      </div>

      {!isRoutingConfigured ? (
        <p className="status-message error">
          Добавьте VITE_GRAPHHOPPER_API_KEY в env-переменные, чтобы включить поиск и построение маршрутов.
        </p>
      ) : null}

      <div className="route-form">
        <label>
          <span>Откуда</span>
          <input
            value={originQuery}
            onChange={(event) => onOriginChange(event.target.value)}
            placeholder="Моё местоположение или адрес"
          />
        </label>
        <label>
          <span>Куда</span>
          <input
            value={destinationQuery}
            onChange={(event) => onDestinationChange(event.target.value)}
            placeholder="Адрес назначения"
          />
        </label>
        <button className="primary-button" type="button" onClick={onBuildRoute} disabled={!canBuildRoute}>
          {isRouting ? 'Строим маршрут...' : 'Построить маршрут'}
        </button>
      </div>

      <button className="secondary-button" type="button" onClick={onLocate} disabled={isLocating}>
        {isLocating ? 'Определяем...' : 'Моё местоположение'}
      </button>

      {locationError ? <p className="status-message error">{locationError}</p> : null}
      {routeError ? <p className="status-message error">{routeError}</p> : null}

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
          <p className="status-message">Введите адреса или кликните по карте, чтобы выбрать точку назначения.</p>
        )}
      </section>
    </aside>
  );
}
