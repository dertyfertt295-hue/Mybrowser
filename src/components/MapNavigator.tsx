import { useEffect, useRef, useState } from 'react';
import type { Feature, LineString } from 'geojson';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  GRAPHHOPPER_API_BASE_URL,
  GRAPHHOPPER_API_KEY,
  OPENFREEMAP_STYLE_URL,
  isGraphHopperConfigured,
} from '../config/navigation';
import { useUserLocation } from '../hooks/useUserLocation';
import type { Coordinates, GeocodingResult, RouteSummary } from '../types/navigation';
import { NavigationPanel } from './NavigationPanel';

interface GraphHopperGeocodingResponse {
  hits?: Array<{
    name?: string;
    country?: string;
    city?: string;
    state?: string;
    street?: string;
    housenumber?: string;
    point?: { lat: number; lng: number };
  }>;
}

interface GraphHopperRouteResponse {
  paths?: Array<{
    distance: number;
    time: number;
    points?: { coordinates?: Coordinates[] };
    instructions?: Array<{
      text: string;
      distance: number;
      time: number;
    }>;
  }>;
  message?: string;
}

const routeSourceId = 'active-route';
const routeLayerId = 'active-route-line';

const buildPlaceLabel = (hit: NonNullable<GraphHopperGeocodingResponse['hits']>[number]) =>
  [hit.name, hit.street, hit.housenumber, hit.city, hit.state, hit.country].filter(Boolean).join(', ');

async function geocode(query: string): Promise<GeocodingResult[]> {
  if (!GRAPHHOPPER_API_KEY) {
    throw new Error('Добавьте VITE_GRAPHHOPPER_API_KEY, чтобы включить поиск и маршруты.');
  }

  const params = new URLSearchParams({
    q: query,
    locale: 'ru',
    limit: '5',
    key: GRAPHHOPPER_API_KEY,
  });

  const response = await fetch(`${GRAPHHOPPER_API_BASE_URL}/geocode?${params.toString()}`);
  const data = (await response.json()) as GraphHopperGeocodingResponse;

  if (!response.ok) {
    throw new Error('GraphHopper не смог выполнить поиск адреса.');
  }

  return (data.hits ?? [])
    .filter((hit) => hit.point)
    .map((hit) => ({
      label: buildPlaceLabel(hit) || 'Найденное место',
      coordinates: [hit.point!.lng, hit.point!.lat],
    }));
}

async function fetchRoute(origin: Coordinates, destination: Coordinates): Promise<RouteSummary> {
  if (!GRAPHHOPPER_API_KEY) {
    throw new Error('Добавьте VITE_GRAPHHOPPER_API_KEY, чтобы включить маршруты.');
  }

  const params = new URLSearchParams({
    vehicle: 'car',
    locale: 'ru',
    points_encoded: 'false',
    instructions: 'true',
    key: GRAPHHOPPER_API_KEY,
  });

  params.append('point', `${origin[1]},${origin[0]}`);
  params.append('point', `${destination[1]},${destination[0]}`);

  const response = await fetch(`${GRAPHHOPPER_API_BASE_URL}/route?${params.toString()}`);
  const data = (await response.json()) as GraphHopperRouteResponse;

  if (!response.ok) {
    throw new Error(data.message || 'GraphHopper не смог построить маршрут.');
  }

  const selectedRoute = data.paths?.[0];

  if (!selectedRoute?.points?.coordinates?.length) {
    throw new Error('GraphHopper не вернул геометрию маршрута.');
  }

  return {
    distance: selectedRoute.distance,
    duration: selectedRoute.time / 1000,
    geometry: selectedRoute.points.coordinates,
    steps:
      selectedRoute.instructions?.map((instruction) => ({
        instruction: instruction.text,
        distance: instruction.distance,
        duration: instruction.time / 1000,
      })) ?? [],
  };
}

export function MapNavigator() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const originMarkerRef = useRef<maplibregl.Marker | null>(null);
  const destinationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [route, setRoute] = useState<RouteSummary | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const { coordinates, error, isLocating, requestLocation } = useUserLocation();
  const coordinatesRef = useRef<Coordinates | null>(null);

  useEffect(() => {
    coordinatesRef.current = coordinates;
  }, [coordinates]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OPENFREEMAP_STYLE_URL,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      pitchWithRotate: false,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.addControl(new maplibregl.FullscreenControl(), 'bottom-right');
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'bottom-right',
    );

    map.on('click', (event) => {
      const clickedPoint: Coordinates = [event.lngLat.lng, event.lngLat.lat];
      setDestination(clickedPoint);
      setDestinationQuery('Точка на карте');

      if (coordinatesRef.current) {
        setOrigin(coordinatesRef.current);
        setOriginQuery('Моё местоположение');
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (coordinates && !origin) {
      setOrigin(coordinates);
      setOriginQuery('Моё местоположение');
    }
  }, [coordinates, origin]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !coordinates) {
      return;
    }

    if (!userMarkerRef.current) {
      userMarkerRef.current = new maplibregl.Marker({ color: '#2563eb' })
        .setLngLat(coordinates)
        .setPopup(new maplibregl.Popup().setText('Вы здесь'))
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat(coordinates);
    }

    map.easeTo({ center: coordinates, zoom: Math.max(map.getZoom(), 14), duration: 900 });
  }, [coordinates]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    if (origin) {
      if (!originMarkerRef.current) {
        originMarkerRef.current = new maplibregl.Marker({ color: '#16a34a' }).addTo(map);
      }

      originMarkerRef.current.setLngLat(origin);
    }

    if (destination) {
      if (!destinationMarkerRef.current) {
        destinationMarkerRef.current = new maplibregl.Marker({ color: '#dc2626' }).addTo(map);
      }

      destinationMarkerRef.current.setLngLat(destination);
    }
  }, [origin, destination]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !route) {
      return;
    }

    const routeData: Feature<LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route.geometry,
      },
    };

    const drawRoute = () => {
      const source = map.getSource(routeSourceId) as maplibregl.GeoJSONSource | undefined;

      if (source) {
        source.setData(routeData);
      } else {
        map.addSource(routeSourceId, { type: 'geojson', data: routeData });
        map.addLayer({
          id: routeLayerId,
          type: 'line',
          source: routeSourceId,
          paint: {
            'line-color': '#2563eb',
            'line-width': 5,
            'line-opacity': 0.9,
          },
        });
      }
    };

    if (map.isStyleLoaded()) {
      drawRoute();
    } else {
      map.once('load', drawRoute);
    }

    if (route.geometry.length > 1) {
      const bounds = route.geometry.reduce(
        (currentBounds, point) => currentBounds.extend(point),
        new maplibregl.LngLatBounds(route.geometry[0], route.geometry[0]),
      );

      map.fitBounds(bounds, { padding: 80, duration: 900 });
    }
  }, [route]);

  const handleBuildRoute = async () => {
    setRouteError(null);
    setIsRouting(true);

    try {
      const originResults = origin ? [{ label: originQuery, coordinates: origin }] : await geocode(originQuery);
      const destinationResults = destination
        ? [{ label: destinationQuery, coordinates: destination }]
        : await geocode(destinationQuery);
      const originCoordinates = originResults[0]?.coordinates;
      const destinationCoordinates = destinationResults[0]?.coordinates;

      if (!originCoordinates || !destinationCoordinates) {
        throw new Error('Не удалось найти одну из точек маршрута. Уточните адреса.');
      }

      setOrigin(originCoordinates);
      setDestination(destinationCoordinates);
      const nextRoute = await fetchRoute(originCoordinates, destinationCoordinates);
      setRoute(nextRoute);
    } catch (error) {
      setRouteError(error instanceof Error ? error.message : 'Не удалось построить маршрут.');
    } finally {
      setIsRouting(false);
    }
  };

  return (
    <main className="app-shell">
      <NavigationPanel
        route={route}
        locationError={error}
        routeError={routeError}
        isLocating={isLocating}
        isRouting={isRouting}
        isRoutingConfigured={isGraphHopperConfigured}
        originQuery={originQuery}
        destinationQuery={destinationQuery}
        onOriginChange={(value) => {
          setOriginQuery(value);
          setOrigin(null);
        }}
        onDestinationChange={(value) => {
          setDestinationQuery(value);
          setDestination(null);
        }}
        onBuildRoute={handleBuildRoute}
        onLocate={requestLocation}
      />
      <div ref={mapContainerRef} className="map-container" aria-label="Интерактивная карта MapLibre" />
    </main>
  );
}
