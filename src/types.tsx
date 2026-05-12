export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Landmark extends Coordinate {
  name: string;
}

export interface Car {
  id: number;
  type: 'economy' | 'comfort' | 'premium';
  lat: number;
  lng: number;
  bearing: number;
  speed: number;
  turnRate: number;
}

export interface Benchmarks {
  activeRides: number;
  availableDrivers: number;
  avgResponseTime: number;
  throughput: number;
  p99Latency: number;
  errorRate: number;
  cpuLoad: number;
  memoryUsage: number;
}

export type RideStatus = 'ride-requested' | 'driver-assigned' | 'ride-completed' | 'ride-cancelled';

export interface Activity {
  id: string;
  type: RideStatus;
  message: string;
  time: string;
}

// NEW: Rider interface
export interface Rider {
  id: number;
  lat: number;
  lng: number;
}

export interface SimulationState {
  concurrentRequests: number;
  isSurging: boolean;
  nodes: { id: number; active: boolean }[];
  latencyKafka: number;
  latencyDB: number;
}