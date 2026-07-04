declare module '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions' {
  import type { IControl, Map } from 'mapbox-gl';

  interface MapboxDirectionsOptions {
    accessToken: string;
    unit?: 'imperial' | 'metric';
    profile?: string;
    alternatives?: boolean;
    geometries?: 'geojson' | 'polyline' | 'polyline6';
    controls?: {
      inputs?: boolean;
      instructions?: boolean;
      profileSwitcher?: boolean;
    };
    language?: string;
    placeholderOrigin?: string;
    placeholderDestination?: string;
    [key: string]: unknown;
  }

  export default class MapboxDirections implements IControl {
    constructor(options?: MapboxDirectionsOptions);
    on(type: string, listener: (event: any) => void): this;
    off(type: string, listener: (event: any) => void): this;
    onAdd(map: Map): HTMLElement;
    onRemove(map: Map): void;
  }
}
