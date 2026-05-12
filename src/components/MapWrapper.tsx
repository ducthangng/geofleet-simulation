import { useEffect, useRef } from "react";
import L from "leaflet";
import type { Coordinate, Car } from "../types";

const DARMSTADT_CENTER: [number, number] = [49.8874, 8.6462];
const BOUNDS = { latMin: 49.845, latMax: 49.925, lngMin: 8.59, lngMax: 8.72 };

interface MapProps {
  mapMode: "navigate" | "set-pickup" | "set-dropoff";
  onLocationSelect: (loc: Coordinate) => void;
  pickup: Coordinate | null;
  dropoff: Coordinate | null;
}

export default function MapWrapper({
  mapMode,
  onLocationSelect,
  pickup,
  dropoff,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<{
    pickup?: L.Marker;
    dropoff?: L.Marker;
    route?: L.Polyline;
  }>({});
  const carsRef = useRef<{ data: Car[]; markers: L.Marker[] }>({
    data: [],
    markers: [],
  });

  useEffect(() => {
    if (!mapRef.current || leafletInstance.current) return;

    // 1. Initialize Map
    const map = L.map(mapRef.current, {
      center: DARMSTADT_CENTER,
      zoom: 14,
      zoomControl: false, // Move to bottom right later if needed
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        subdomains: "abcd",
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      },
    ).addTo(map);

    leafletInstance.current = map;

    // 2. Initialize Car Simulation
    const types = ["economy", "comfort", "premium"] as const;
    const initialCars: Car[] = Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      type: types[i % 3], // Simplified distribution
      lat: BOUNDS.latMin + Math.random() * (BOUNDS.latMax - BOUNDS.latMin),
      lng: BOUNDS.lngMin + Math.random() * (BOUNDS.lngMax - BOUNDS.lngMin),
      bearing: Math.random() * 360,
      speed: 0.00003 + Math.random() * 0.00005,
      turnRate: (Math.random() - 0.5) * 0.3,
    }));

    const carMarkers = initialCars.map((car) =>
      L.marker([car.lat, car.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div class="car-marker ${car.type}"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        }),
        interactive: false,
      }).addTo(map),
    );

    carsRef.current = { data: initialCars, markers: carMarkers };

    const interval = setInterval(() => {
      carsRef.current.data.forEach((car, i) => {
        if (Math.random() < 0.02) car.bearing += (Math.random() - 0.5) * 90;
        car.bearing += car.turnRate * (Math.random() - 0.5);
        const rad = (car.bearing * Math.PI) / 180;
        car.lat += Math.cos(rad) * car.speed;
        car.lng += Math.sin(rad) * car.speed;

        if (car.lat < BOUNDS.latMin || car.lat > BOUNDS.latMax) {
          car.bearing = 180 - car.bearing;
          car.lat = Math.max(BOUNDS.latMin, Math.min(BOUNDS.latMax, car.lat));
        }
        if (car.lng < BOUNDS.lngMin || car.lng > BOUNDS.lngMax) {
          car.bearing = -car.bearing;
          car.lng = Math.max(BOUNDS.lngMin, Math.min(BOUNDS.lngMax, car.lng));
        }

        carsRef.current.markers[i].setLatLng([car.lat, car.lng]);
      });
    }, 150);

    return () => {
      clearInterval(interval);
      map.remove();
      leafletInstance.current = null;
    };
  }, []);

  // Handle Map Mode Clicks
  useEffect(() => {
    const map = leafletInstance.current;
    if (!map) return;

    const clickHandler = (e: L.LeafletMouseEvent) => {
      if (mapMode !== "navigate") {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    };

    map.getContainer().style.cursor = mapMode !== "navigate" ? "crosshair" : "";
    map.on("click", clickHandler);
    return () => {
      map.off("click", clickHandler);
    };
  }, [mapMode, onLocationSelect]);

  // Sync Pickup/Dropoff/Route markers when props change
  useEffect(() => {
    const map = leafletInstance.current;
    const mRef = markersRef.current;
    if (!map) return;

    if (pickup) {
      if (!mRef.pickup) {
        mRef.pickup = L.marker([pickup.lat, pickup.lng], {
          icon: L.divIcon({
            className: "",
            html: '<div class="pickup-marker"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }),
        }).addTo(map);
      } else {
        mRef.pickup.setLatLng([pickup.lat, pickup.lng]);
      }
    } else if (mRef.pickup) {
      map.removeLayer(mRef.pickup);
      delete mRef.pickup;
    }

    if (dropoff) {
      if (!mRef.dropoff) {
        mRef.dropoff = L.marker([dropoff.lat, dropoff.lng], {
          icon: L.divIcon({
            className: "",
            html: '<div class="dropoff-marker"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }),
        }).addTo(map);
      } else {
        mRef.dropoff.setLatLng([dropoff.lat, dropoff.lng]);
      }
    } else if (mRef.dropoff) {
      map.removeLayer(mRef.dropoff);
      delete mRef.dropoff;
    }

    if (pickup && dropoff) {
      if (mRef.route) map.removeLayer(mRef.route);
      const curvedLat = (pickup.lat + dropoff.lat) / 2 + 0.003;
      mRef.route = L.polyline(
        [
          [pickup.lat, pickup.lng],
          [curvedLat, (pickup.lng + dropoff.lng) / 2],
          [dropoff.lat, dropoff.lng],
        ],
        {
          color: "#00d4aa",
          weight: 3,
          opacity: 0.6,
          dashArray: "8, 8",
        },
      ).addTo(map);
    } else if (mRef.route) {
      map.removeLayer(mRef.route);
      delete mRef.route;
    }
  }, [pickup, dropoff]);

  return <div ref={mapRef} className="w-full h-full absolute inset-0 z-0" />;
}
