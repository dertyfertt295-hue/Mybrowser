export const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;

export const DEFAULT_CENTER: [number, number] = [37.6173, 55.7558];
export const DEFAULT_ZOOM = 11;

export const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12';

export const isMapboxConfigured = Boolean(MAPBOX_ACCESS_TOKEN?.trim());
