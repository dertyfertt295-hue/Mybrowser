import { useCallback, useEffect, useState } from 'react';
import type { Coordinates } from '../types/navigation';

interface LocationState {
  coordinates: Coordinates | null;
  error: string | null;
  isLocating: boolean;
}

const toCoordinates = (position: GeolocationPosition): Coordinates => [
  position.coords.longitude,
  position.coords.latitude,
];

export function useUserLocation() {
  const [state, setState] = useState<LocationState>({
    coordinates: null,
    error: null,
    isLocating: false,
  });

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState((current) => ({
        ...current,
        error: 'Геолокация не поддерживается этим браузером.',
      }));
      return;
    }

    setState((current) => ({ ...current, isLocating: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: toCoordinates(position),
          error: null,
          isLocating: false,
        });
      },
      (error) => {
        setState((current) => ({
          ...current,
          error: error.message || 'Не удалось определить местоположение.',
          isLocating: false,
        }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30_000,
        timeout: 12_000,
      },
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    ...state,
    requestLocation,
  };
}
