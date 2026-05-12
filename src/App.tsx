import { useState, useEffect, useRef } from "react";
import {
  Zap,
  Server,
  Wifi,
  Play,
  Flame,
  StopCircle,
  HardDrive,
  Terminal,
} from "lucide-react";
import MapWrapper from "./components/MapWrapper";
import type { Activity as LogActivity } from "./types";

export default function App() {
  const [requests, setRequests] = useState(5000);
  const [isSurging, setIsSurging] = useState(false);
  const [nodes, setNodes] = useState(
    [1, 2, 3, 4, 5].map((id) => ({ id, active: true })),
  );
  const [latencyKafka, setLatencyKafka] = useState(20);
  const [latencyDB, setLatencyDB] = useState(15);
  const [simulationKey, setSimulationKey] = useState(0);
  const [logs, setLogs] = useState<LogActivity[]>([]);

  const logEndRef = useRef<HTMLDivElement>(null);
  const surgeInterval = useRef<number | null>(null);

  const addLog = (message: string) => {
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      type: "ride-requested" as any,
      message,
      time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
    };
    setLogs((prev) => [...prev, newLog].slice(-50)); // Keep last 50 logs
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (isSurging) {
      surgeInterval.current = setInterval(() => {
        setRequests((prev) => {
          const next = Math.min(
            100000,
            prev + Math.floor(Math.random() * 4000),
          );
          if (next % 10000 < 4000)
            addLog(
              `Surge in progress: ${next.toLocaleString()} concurrent requests.`,
            );
          return next;
        });
      }, 500);
    } else if (surgeInterval.current) clearInterval(surgeInterval.current);
    return () => clearInterval(surgeInterval.current!);
  }, [isSurging]);

  return (
    <div className="w-full h-screen bg-base text-text overflow-hidden">
      <MapWrapper concurrentRequests={requests} simulationKey={simulationKey} />

      <aside className="fixed right-0 top-0 h-full w-[400px] bg-surface/90 backdrop-blur-xl border-l border-border z-[1000] flex flex-col transition-transform">
        <div className="p-6 flex-shrink-0">
          <h2 className="text-xl font-bold text-accent flex items-center gap-2">
            <Zap className="w-5 h-5 fill-accent" /> RideFlow HCMC
          </h2>
          <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-1">
            Distributed Traffic Engine
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-6">
          {/* Controls */}
          <section className="space-y-3">
            <div className="flex justify-between items-end font-mono">
              <span className="text-[10px] text-muted uppercase">
                Global Load
              </span>
              <span className="text-lg font-bold">
                {requests.toLocaleString()} RPS
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={requests}
              onChange={(e) => setRequests(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <button
              onClick={() => {
                setIsSurging(!isSurging);
                addLog(
                  isSurging
                    ? "Surge manually terminated."
                    : "WARNING: Surge detected in SGN region!",
                );
              }}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isSurging ? "bg-danger/20 border border-danger text-danger" : "bg-orange-500 text-white"}`}
            >
              {isSurging ? (
                <StopCircle className="w-4 h-4" />
              ) : (
                <Flame className="w-4 h-4" />
              )}
              {isSurging ? "STOP SURGE" : "TRIGGER SURGE"}
            </button>
          </section>

          {/* Infrastructure */}
          <section className="space-y-3">
            <label className="text-[10px] font-mono uppercase text-muted flex items-center gap-2">
              <Server className="w-3 h-3" /> Active Nodes
            </label>
            <div className="grid grid-cols-5 gap-2">
              {nodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => {
                    setNodes((prev) =>
                      prev.map((n) =>
                        n.id === node.id ? { ...n, active: !n.active } : n,
                      ),
                    );
                    addLog(
                      `Node ${node.id} ${node.active ? "shutdown" : "started"}.`,
                    );
                  }}
                  className={`h-10 rounded border transition-all ${node.active ? "bg-accent/10 border-accent text-accent" : "bg-surface-light border-border text-muted"}`}
                >
                  <span className="text-[10px] font-bold">{node.id}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Network */}
          <section className="space-y-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-muted">
                <span>KAFKA BUS DELAY</span>
                <span>{latencyKafka}ms</span>
              </div>
              <input
                type="range"
                min="5"
                max="500"
                value={latencyKafka}
                onChange={(e) => setLatencyKafka(Number(e.target.value))}
                className="w-full accent-sky"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-muted">
                <span>DB REPLICATION LAG</span>
                <span>{latencyDB}ms</span>
              </div>
              <input
                type="range"
                min="5"
                max="1000"
                value={latencyDB}
                onChange={(e) => setLatencyDB(Number(e.target.value))}
                className="w-full accent-gold"
              />
            </div>
          </section>

          {/* Log Box */}
          <section className="flex flex-col h-48 bg-black/40 border border-border rounded-lg overflow-hidden">
            <div className="bg-surface-light px-3 py-1.5 border-b border-border flex items-center justify-between">
              <span className="text-[9px] font-mono text-muted flex items-center gap-1.5">
                <Terminal className="w-3 h-3" /> SYSTEM_LOGS
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            </div>
            <div className="flex-1 p-3 font-mono text-[10px] space-y-1 overflow-y-auto overflow-x-hidden">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-2">
                  <span className="text-muted shrink-0">[{log.time}]</span>
                  <span className="text-text break-words">{log.message}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-border bg-surface/50">
          <button
            onClick={() => {
              setSimulationKey(Date.now());
              addLog("Re-deploying clusters to HCMC neighborhoods.");
            }}
            className="w-full bg-accent hover:bg-accent-dim text-surface py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 fill-current" /> DEPLOY SYSTEM
          </button>
        </div>
      </aside>

      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-md border-t border-border z-[900] flex items-center px-6 gap-8">
        <div className="flex items-center gap-4 border-r border-border pr-8">
          <div className="text-[10px] font-mono text-muted">REGION</div>
          <div className="text-xs font-bold text-accent">VN-SGN-D1</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-sky" />
            <span className="text-xs font-mono">{latencyKafka}ms</span>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-gold" />
            <span className="text-xs font-mono">{latencyDB}ms</span>
          </div>
        </div>
        <div className="ml-auto text-[10px] font-mono text-muted uppercase">
          Status: <span className="text-accent">Optimized</span> | Nodes:{" "}
          <span className="text-text">
            {nodes.filter((n) => n.active).length}/5
          </span>
        </div>
      </footer>
    </div>
  );
}
