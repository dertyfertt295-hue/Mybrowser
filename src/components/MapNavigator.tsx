import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_STYLE, MAPBOX_ACCESS_TOKEN, isMapboxConfigured } from '../config/mapbox';
import { useUserLocation } from '../hooks/useUserLocation';
import type { RouteSummary } from '../types/navigation';
import { NavigationPanel } from './NavigationPanel';

type GeocoderMapboxGl = ConstructorParameters<typeof MapboxGeocoder>[0] extends { mapboxgl?: infer T } ? T : never;

interface DirectionsRouteEvent {
  route: Array<{
    distance: number;
    duration: number;
    legs?: Array<{
      steps?: Array<{
        distance: number;
        duration: number;
        maneuver?: { instruction?: string };
      }>;
    }>;
  }>;
}

export function MapNavigator() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [route, setRoute] = useState<RouteSummary | null>(null);
  const { coordinates, error, isLocating, requestLocation } = useUserLocation();

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !isMapboxConfigured || !MAPBOX_ACCESS_TOKEN) {
      return;
    }

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: coordinates ?? DEFAULT_CENTER,
      zoom: coordinates ? 14 : DEFAULT_ZOOM,
      pitchWithRotate: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      'bottom-right',
    );

    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_ACCESS_TOKEN,
      mapboxgl: mapboxgl as unknown as GeocoderMapboxGl,
      marker: false,
      placeholder: 'Поиск адреса или места',
      language: 'ru',
    });

    const directions = new MapboxDirections({
      accessToken: MAPBOX_ACCESS_TOKEN,
      unit: 'metric',
      profile: 'mapbox/driving-traffic',
      alternatives: true,
      geometries: 'geojson',
      controls: {
        instructions: false,
        profileSwitcher: true,
      },
      language: 'ru',
      placeholderOrigin: 'Откуда',
      placeholderDestination: 'Куда',
    });

    map.addControl(geocoder, 'top-left');
    map.addControl(directions, 'top-left');

    directions.on('route', (event: DirectionsRouteEvent) => {
      const selectedRoute = event.route[0];
      const steps = selectedRoute.legs?.flatMap((leg) => leg.steps ?? []) ?? [];

      setRoute({
        distance: selectedRoute.distance,
        duration: selectedRoute.duration,
        steps: steps.map((step) => ({
          instruction: step.maneuver?.instruction ?? 'Продолжайте движение',
          distance: step.distance,
          duration: step.duration,
        })),
      });
    });

    directions.on('clear', () => setRoute(null));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [coordinates]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !coordinates) {
      return;
    }

    if (!userMarkerRef.current) {
      userMarkerRef.current = new mapboxgl.Marker({ color: '#2563eb' })
        .setLngLat(coordinates)
        .setPopup(new mapboxgl.Popup().setText('Вы здесь'))
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat(coordinates);
    }

    map.easeTo({ center: coordinates, zoom: Math.max(map.getZoom(), 14), duration: 900 });
  }, [coordinates]);

  if (!isMapboxConfigured) {
    return (
      <main className="app-shell setup-shell">
        <section className="setup-card">
          <p className="eyebrow">Требуется настройка</p>
          <h1>Добавьте токен Mapbox</h1>
          <p>
            Создайте файл <code>.env.local</code> и укажите <code>VITE_MAPBOX_ACCESS_TOKEN=ваш_токен</code>,
            чтобы включить карту, поиск, маршруты и навигацию.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <NavigationPanel route={route} locationError={error} isLocating={isLocating} onLocate={requestLocation} />
      <div ref={mapContainerRef} className="map-container" aria-label="Интерактивная карта Mapbox" />
    </main>
  );
}
