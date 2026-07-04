export type Coordinates = [longitude: number, latitude: number];

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
}

export interface RouteSummary {
  distance: number;
  duration: number;
  steps: RouteStep[];
}
