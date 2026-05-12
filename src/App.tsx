import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, MapPin, MapPinOff, Route, Crosshair, X, Car as CarIcon, Diamond, Zap, Clock, Send, Info } from 'lucide-react';
import MapWrapper from './components/MapWrapper';
import type { Coordinate, Benchmarks, Activity, RideStatus } from './types';

// Utility helper for random walks
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mapMode, setMapMode] = useState<'navigate' | 'set-pickup' | 'set-dropoff'>('navigate');
  
  // Booking State
  // const [passengers, setPassengers] = useState(1);
  const [vehicleType, setVehicleType] = useState<'economy' | 'comfort' | 'premium'>('economy');
  const [pickup, setPickup] = useState<Coordinate | null>(null);
  const [dropoff, setDropoff] = useState<Coordinate | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // System State
  const [activityFeed, setActivityFeed] = useState<Activity[]>([]);
  const [benchmarks, setBenchmarks] = useState<Benchmarks>({
    activeRides: 142, availableDrivers: 67, avgResponseTime: 287,
    throughput: 18.4, p99Latency: 1247, errorRate: 0.23, cpuLoad: 54, memoryUsage: 68
  });

  // Simulator Effect (Benchmarks)
  useEffect(() => {
    const interval = setInterval(() => {
      setBenchmarks(prev => ({
        activeRides: clamp(prev.activeRides + (Math.random() - 0.48) * 8, 80, 250),
        availableDrivers: clamp(prev.availableDrivers + (Math.random() - 0.5) * 5, 25, 120),
        avgResponseTime: clamp(prev.avgResponseTime + (Math.random() - 0.5) * 30, 120, 600),
        throughput: clamp(prev.throughput + (Math.random() - 0.5) * 2, 5, 35),
        p99Latency: clamp(prev.p99Latency + (Math.random() - 0.5) * 80, 500, 2500),
        errorRate: clamp(prev.errorRate + (Math.random() - 0.5) * 0.1, 0.01, 2.0),
        cpuLoad: clamp(prev.cpuLoad + (Math.random() - 0.48) * 4, 20, 95),
        memoryUsage: clamp(prev.memoryUsage + (Math.random() - 0.5) * 2, 40, 95)
      }));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const handleLocationSelect = (loc: Coordinate) => {
    if (mapMode === 'set-pickup') setPickup(loc);
    if (mapMode === 'set-dropoff') setDropoff(loc);
    setMapMode('navigate');
  };

  const handleBook = () => {
    if (!pickup || !dropoff) return alert('Please set pickup and dropoff');
    setIsBooking(true);
    setActivityFeed(prev => [{
      id: Date.now().toString(), type: "ride-requested" as RideStatus, 
      message: 'Ride requested processing...', time: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 8));

    setTimeout(() => {
      setActivityFeed(prev => [{
        id: Date.now().toString(), type: 'driver-assigned' as RideStatus, 
        message: 'Driver found and en route', time: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 8));
      setIsBooking(false);
      setPickup(null);
      setDropoff(null);
    }, 2000);
  };

  return (
    <div className="w-full h-screen relative flex overflow-hidden">
      <MapWrapper mapMode={mapMode} onLocationSelect={handleLocationSelect} pickup={pickup} dropoff={dropoff} />

      {/* Top Left Badge */}
      <div className="fixed top-4 left-4 z-[900] flex items-center gap-3">
        <div className="bg-surface/85 backdrop-blur-md border border-border rounded-xl px-4 py-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
            <Route className="text-accent w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">RideFlow</div>
            <div className="text-[10px] text-muted font-mono tracking-wider uppercase">Darmstadt</div>
          </div>
        </div>
      </div>

      {/* Map Mode Banner */}
      {mapMode !== 'navigate' && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[900]">
          <div className="bg-surface/90 backdrop-blur-md border border-accent/30 rounded-xl px-5 py-3 flex items-center gap-3">
            <Crosshair className="text-accent w-4 h-4 animate-pulse" />
            <span className="text-sm text-text">Click on the map to set location</span>
            <button onClick={() => setMapMode('navigate')} className="ml-2 text-muted hover:text-danger text-xs flex items-center">
               <X className="w-3 h-3 mr-1"/> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 z-[1001] transition-all duration-300"
        style={{ right: sidebarOpen ? '396px' : '16px' }}
      >
        <div className="w-9 h-9 bg-surface/85 backdrop-blur-md border border-border rounded-lg flex items-center justify-center hover:bg-surface-light transition-colors">
          {sidebarOpen ? <ChevronRight className="w-4 h-4 text-muted" /> : <ChevronLeft className="w-4 h-4 text-muted" />}
        </div>
      </button>

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 right-0 h-full z-[1000] w-[380px] bg-surface/92 backdrop-blur-xl border-l border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <h2 className="text-base font-semibold">Book a Ride</h2>
          <p className="text-xs text-muted mt-1">Configure your ride and track the system</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Controls Segment */}
          <section>
            <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-3">Vehicle Type</div>
            <div className="flex gap-1 bg-surface-light rounded-lg p-1">
              {(['economy', 'comfort', 'premium'] as const).map(type => (
                <button 
                  key={type}
                  onClick={() => setVehicleType(type)}
                  className={`flex-1 py-2 text-xs font-medium rounded-md capitalize flex items-center justify-center transition-all ${vehicleType === type ? 'bg-accent/15 text-accent' : 'text-muted hover:text-text'}`}
                >
                  <CarIcon className="w-3 h-3 mr-1" /> {type}
                </button>
              ))}
            </div>
          </section>

          <section>
             <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-3">Route</div>
             {/* Pickup Input */}
             <div className="flex gap-2 mb-3">
               <input readOnly value={pickup ? `${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)}` : ''} placeholder="Pickup Location" className="flex-1 bg-surface-light border border-border rounded-lg px-3 py-2 text-sm" />
               <button onClick={() => setMapMode('set-pickup')} className="w-9 h-9 bg-surface-light border border-border rounded-lg flex items-center justify-center hover:text-accent text-muted"><MapPin className="w-4 h-4" /></button>
             </div>
             {/* Dropoff Input */}
             <div className="flex gap-2">
               <input readOnly value={dropoff ? `${dropoff.lat.toFixed(4)}, ${dropoff.lng.toFixed(4)}` : ''} placeholder="Dropoff Location" className="flex-1 bg-surface-light border border-border rounded-lg px-3 py-2 text-sm" />
               <button onClick={() => setMapMode('set-dropoff')} className="w-9 h-9 bg-surface-light border border-border rounded-lg flex items-center justify-center hover:text-coral text-muted"><MapPinOff className="w-4 h-4" /></button>
             </div>
          </section>

          <section>
            <div className="text-[10px] font-mono text-muted uppercase tracking-wider mb-3">Activity Feed</div>
            <div className="space-y-2">
              {activityFeed.map((act, i) => (
                <div key={act.id} className={`flex items-start gap-2 text-sm ${i > 0 ? 'opacity-60' : ''}`}>
                  <Info className="w-3 h-3 mt-1 text-accent shrink-0" />
                  <div>
                    <div className="text-text">{act.message}</div>
                    <div className="text-[10px] text-muted font-mono">{act.time}</div>
                  </div>
                </div>
              ))}
              {activityFeed.length === 0 && <div className="text-xs text-muted">Awaiting system events...</div>}
            </div>
          </section>
        </div>

        <div className="p-5 border-t border-border">
          <button 
            onClick={handleBook}
            disabled={isBooking || !pickup || !dropoff}
            className="w-full bg-accent hover:bg-accent-dim disabled:opacity-50 disabled:cursor-not-allowed text-base font-semibold py-3 rounded-xl text-surface flex items-center justify-center gap-2 transition-all"
          >
            {isBooking ? <Zap className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
            {isBooking ? 'Processing...' : 'Book Ride'}
          </button>
        </div>
      </aside>

      {/* Benchmark Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-[900] bg-surface/90 backdrop-blur-md border-t border-border h-16 flex items-stretch">
        {[
          { label: 'Active Rides', val: benchmarks.activeRides.toFixed(0) },
          { label: 'Drivers', val: benchmarks.availableDrivers.toFixed(0) },
          { label: 'Avg Latency (ms)', val: benchmarks.avgResponseTime.toFixed(0) },
          { label: 'P99 (ms)', val: benchmarks.p99Latency.toFixed(0) },
          { label: 'CPU Load', val: `${benchmarks.cpuLoad.toFixed(0)}%` },
        ].map(stat => (
          <div key={stat.label} className="flex-1 flex flex-col items-center justify-center border-r border-border/50 last:border-0">
            <div className="text-[9px] font-mono text-muted uppercase tracking-wider">{stat.label}</div>
            <div className="text-sm font-mono font-semibold text-text mt-0.5">{stat.val}</div>
          </div>
        ))}
      </footer>
    </div>
  );
}