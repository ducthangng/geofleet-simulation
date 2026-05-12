import { useEffect, useRef } from "react";
import L from "leaflet";
import type { Car, Rider } from "../types";

const HCMC_CENTER: [number, number] = [10.7769, 106.7009];

// Expanded Bounds for different load levels
const GET_BOUNDS = (requests: number) => {
  if (requests < 20000)
    return {
      zoom: 14,
      label: "District 1",
      latMin: 10.76,
      latMax: 10.79,
      lngMin: 106.68,
      lngMax: 106.71,
    };
  if (requests < 50000)
    return {
      zoom: 12,
      label: "D1, D3, D7, D4",
      latMin: 10.72,
      latMax: 10.82,
      lngMin: 106.65,
      lngMax: 106.75,
    };
  return {
    zoom: 10,
    label: "Greater HCMC (Thu Duc, Binh Duong)",
    latMin: 10.65,
    latMax: 10.95,
    lngMin: 106.5,
    lngMax: 107.0,
  };
};

interface MapProps {
  concurrentRequests: number;
  simulationKey: number;
}

export default function MapWrapper({
  concurrentRequests,
  simulationKey,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<L.Map | null>(null);
  const carsRef = useRef<{ data: Car[]; markers: L.Marker[] }>({
    data: [],
    markers: [],
  });
  const ridersRef = useRef<{ data: Rider[]; markers: L.Marker[] }>({
    data: [],
    markers: [],
  });
  const animationInterval = useRef<number | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletInstance.current) return;
    const map = L.map(mapRef.current, {
      center: HCMC_CENTER,
      zoom: 13,
      zoomControl: false,
    });
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        attribution: "&copy; CARTO",
      },
    ).addTo(map);
    leafletInstance.current = map;
    return () => {
      map.remove();
      leafletInstance.current = null;
    };
  }, []);

  // Effect to handle dynamic zooming/expansion
  useEffect(() => {
    const map = leafletInstance.current;
    if (!map) return;
    const { zoom } = GET_BOUNDS(concurrentRequests);
    map.setZoom(zoom, { animate: true });
  }, [concurrentRequests]);

  useEffect(() => {
    const map = leafletInstance.current;
    if (!map || simulationKey === 0) return;

    if (animationInterval.current) clearInterval(animationInterval.current);
    carsRef.current.markers.forEach((m) => map.removeLayer(m));
    ridersRef.current.markers.forEach((m) => map.removeLayer(m));

    const bounds = GET_BOUNDS(concurrentRequests);
    const displayCount = Math.min(250, Math.ceil(concurrentRequests / 400));

    const newRiders: Rider[] = Array.from({ length: displayCount }).map(
      (_, i) => ({
        id: i,
        lat: bounds.latMin + Math.random() * (bounds.latMax - bounds.latMin),
        lng: bounds.lngMin + Math.random() * (bounds.lngMax - bounds.lngMin),
      }),
    );

    ridersRef.current = {
      data: newRiders,
      markers: newRiders.map((r) =>
        L.marker([r.lat, r.lng], {
          icon: L.divIcon({
            className: "",
            html: `<div class="rider-marker"></div>`,
            iconSize: [8, 8],
          }),
        }).addTo(map),
      ),
    };

    const newCars: Car[] = Array.from({
      length: Math.ceil(displayCount * 0.4),
    }).map((_, i) => ({
      id: i,
      type: "comfort",
      lat: bounds.latMin + Math.random() * (bounds.latMax - bounds.latMin),
      lng: bounds.lngMin + Math.random() * (bounds.lngMax - bounds.lngMin),
      bearing: Math.random() * 360,
      speed: 0.0005, // Adjusted speed for larger map
      turnRate: (Math.random() - 0.5) * 0.2,
    }));

    carsRef.current = {
      data: newCars,
      markers: newCars.map((c) =>
        L.marker([c.lat, c.lng], {
          icon: L.divIcon({
            className: "",
            html: `<div class="car-marker comfort"></div>`,
            iconSize: [10, 10],
          }),
        }).addTo(map),
      ),
    };

    animationInterval.current = setInterval(() => {
      carsRef.current.data.forEach((car, i) => {
        const rad = (car.bearing * Math.PI) / 180;
        car.lat += Math.cos(rad) * car.speed;
        car.lng += Math.sin(rad) * car.speed;
        if (car.lat < bounds.latMin || car.lat > bounds.latMax)
          car.bearing = 180 - car.bearing;
        if (car.lng < bounds.lngMin || car.lng > bounds.lngMax)
          car.bearing = -car.bearing;
        carsRef.current.markers[i].setLatLng([car.lat, car.lng]);
      });
    }, 150);

    return () => {
      if (animationInterval.current) clearInterval(animationInterval.current);
    };
  }, [simulationKey]);

  return <div ref={mapRef} className="w-full h-full absolute inset-0 z-0" />;
}
