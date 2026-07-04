import type { Coordinates } from '../types/navigation';

export const GRAPHHOPPER_API_KEY = import.meta.env.VITE_GRAPHHOPPER_API_KEY as string | undefined;

export const DEFAULT_CENTER: Coordinates = [37.6173, 55.7558];
export const DEFAULT_ZOOM = 11;

export const OPENFREEMAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
export const GRAPHHOPPER_API_BASE_URL = 'https://graphhopper.com/api/1';
export const MAP_STYLE_FALLBACK_NOTICE =
  'Основной стиль OpenFreeMap не загрузился, поэтому карта переключена на резервный слой OpenStreetMap.';

export const isGraphHopperConfigured = Boolean(GRAPHHOPPER_API_KEY?.trim());
