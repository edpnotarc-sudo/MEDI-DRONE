
const API_BASE_URL = "http://localhost:5000";

// Initialize the map
const mapElement = document.getElementById("map");

if (mapElement && typeof L !== "undefined") {
  const map = L.map("map").setView([12.9716, 77.5946], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  // Load medical hubs from the backend
  async function loadMedicalHubs() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hubs`);

      if (!response.ok) {
        throw new Error("Unable to load medical hubs");
      }

      const hubs = await response.json();
      const locations = [];

      hubs.forEach((hub) => {
        const latitude = Number(hub.latitude);
        const longitude = Number(hub.longitude);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return;
        }

        const position = [latitude, longitude];
        locations.push(position);

        L.marker(position)
          .addTo(map)
          .bindPopup(`<strong>${hub.name}</strong><br>Medical Hub`);
      });

      if (locations.length > 0) {
        map.fitBounds(locations, { padding: [40, 40] });
      }
    } catch (error) {
      console.error("Medical hub loading error:", error);
    }
  }

  loadMedicalHubs();
}
