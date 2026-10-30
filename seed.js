
import db from "./db.js";

// Sample locations are for hackathon simulation only.
const hubs = [
  {
    id: "HUB001",
    name: "Central Medical Hub",
    latitude: 12.9716,
    longitude: 77.5946
  },
  {
    id: "HUB002",
    name: "North Medical Hub",
    latitude: 13.0358,
    longitude: 77.5970
  },
  {
    id: "HUB003",
    name: "South Medical Hub",
    latitude: 12.9165,
    longitude: 77.6101
  }
];

const drones = [
  {
    id: "DRONE001",
    hub_id: "HUB001",
    battery: 95,
    kit_type: "general",
    latitude: 12.9716,
    longitude: 77.5946
  },
  {
    id: "DRONE002",
    hub_id: "HUB001",
    battery: 88,
    kit_type: "bleeding",
    latitude: 12.9720,
    longitude: 77.5950
  },
  {
    id: "DRONE003",
    hub_id: "HUB002",
    battery: 91,
    kit_type: "breathing",
    latitude: 13.0358,
    longitude: 77.5970
  },
  {
    id: "DRONE004",
    hub_id: "HUB002",
    battery: 72,
    kit_type: "allergy",
    latitude: 13.0360,
    longitude: 77.5975
  },
  {
    id: "DRONE005",
    hub_id: "HUB003",
    battery: 100,
    kit_type: "general",
    latitude: 12.9165,
    longitude: 77.6101
  }
];

const volunteers = [
  {
    id: "VOL001",
    name: "Volunteer A",
    phone: "9000000001",
    latitude: 12.9720,
    longitude: 77.5950
  },
  {
    id: "VOL002",
    name: "Volunteer B",
    phone: "9000000002",
    latitude: 13.0360,
    longitude: 77.5975
  },
  {
    id: "VOL003",
    name: "Volunteer C",
    phone: "9000000003",
    latitude: 12.9170,
    longitude: 77.6110
  }
];

const noFlyZones = [
  {
    id: "NFZ001",
    name: "Demo Restricted Zone",
    latitude: 12.9800,
    longitude: 77.6000,
    radius_meters: 300
  }
];

const insertHub = db.prepare(`
  INSERT OR IGNORE INTO hubs
  (id, name, latitude, longitude)
  VALUES (@id, @name, @latitude, @longitude)
`);

const insertDrone = db.prepare(`
  INSERT OR IGNORE INTO drones
  (id, hub_id, battery, kit_type, latitude, longitude)
  VALUES (@id, @hub_id, @battery, @kit_type, @latitude, @longitude)
`);

const insertVolunteer = db.prepare(`
  INSERT OR IGNORE INTO volunteers
  (id, name, phone, latitude, longitude)
  VALUES (@id, @name, @phone, @latitude, @longitude)
`);

const insertNoFlyZone = db.prepare(`
  INSERT OR IGNORE INTO no_fly_zones
  (id, name, latitude, longitude, radius_meters)
  VALUES (@id, @name, @latitude, @longitude, @radius_meters)
`);

const seed = db.transaction(() => {
  hubs.forEach((hub) => insertHub.run(hub));
  drones.forEach((drone) => insertDrone.run(drone));
  volunteers.forEach((volunteer) => insertVolunteer.run(volunteer));
  noFlyZones.forEach((zone) => insertNoFlyZone.run(zone));
});

seed();

console.log("==================================");
console.log("MEDI-DRONE DATABASE SEEDED");
console.log("==================================");
console.log(`Hubs: ${hubs.length}`);
console.log(`Drones: ${drones.length}`);
console.log(`Volunteers: ${volunteers.length}`);
console.log(`No-fly zones: ${noFlyZones.length}`);
console.log("==================================");

db.close();
