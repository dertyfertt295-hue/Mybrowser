export type Coordinates = [longitude: number, latitude: number];

export interface GeocodingResult {
  label: string;
  coordinates: Coordinates;
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
}

export interface RouteSummary {
  distance: number;
  duration: number;
  geometry: Coordinates[];
  steps: RouteStep[];
}
