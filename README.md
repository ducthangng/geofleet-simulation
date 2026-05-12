# Geofleet Simulator: Visualizing Distributed System
This app is built to visualized the underlying mechanism of Geofleet (just exactly like UBER, nothing new here). I done it to prove I can do it, that's all.

## 🧠 The Concept
This is a System Design Playground. It simulates a high-concurrency ride-hailing backend (just exactly like UBER, nonetheless). You will the some dots on the screen, as "blue" for cars, "green" for users, and "yellow" for happening-ride.

## 🛠️ Tech Stack
- Frontend: React 18 + TypeScript (Strict Mode)

- Build Tool: Vite (Lightning fast HMR)

- Styling: Tailwind CSS v4 (Modern utility-first CSS)

- Mapping: Leaflet.js (Custom dark-mode tiles)

- Icons: Lucide-React

## 🕹️ What to do?
Play the games, scroll the bar, enjoy the ride. P/s: if you find any bugs, love love love to received feedback from you by opening any pull request here. Thanks in advance.

1. The 100k Challenge: Slide the concurrent requests to 100,000. Watch the map dynamically expand from District 1 to the Greater HCMC area (Thu Duc & Binh Duong) to handle the simulated load.

2. The "Panic" Button: Hit Trigger Surge. I’ve implemented a ramp-up algorithm that simulates a sudden spike in demand.

3. Infrastructure Toggles: Turn off backend nodes one by one. In a real environment, this would increase P99 latency—here, you can track the status in the live System Log.

4. Network Simulation: Use the sliders to inject artificial latency into the Kafka bus or Database replication. The taskbar at the bottom reflects these "bottlenecks" instantly.

## Note
You would need Geofleet backend for this to work. Find more here.

Vielen Dank!
