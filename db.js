
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

const dataDirectory = path.join(currentDirectory, "../data");

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

const databasePath = process.env.DB_PATH ||
  path.join(dataDirectory, "medidrone.db");

const db = new Database(databasePath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS hubs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS drones (
    id TEXT PRIMARY KEY,
    hub_id TEXT NOT NULL,
    battery REAL NOT NULL DEFAULT 100,
    kit_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'idle',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    target_latitude REAL,
    target_longitude REAL,
    incident_id TEXT,
    speed_kmh REAL NOT NULL DEFAULT 60,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hub_id) REFERENCES hubs(id)
  );

  CREATE TABLE IF NOT EXISTS no_fly_zones (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    radius_meters REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS volunteers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    available INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    share_token TEXT UNIQUE NOT NULL,
    user_name TEXT NOT NULL,
    user_phone TEXT DEFAULT '',
    triage_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT DEFAULT '',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    location_source TEXT DEFAULT 'gps',
    blood_group TEXT DEFAULT '',
    allergies TEXT DEFAULT '',
    conditions TEXT DEFAULT '',
    caregiver_contacts TEXT DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'reported',
    assigned_responder_id TEXT,
    assigned_drone_id TEXT,
    drone_dispatch_reason TEXT DEFAULT '',
    drone_eta_minutes REAL,
    ambulance_eta_minutes REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id TEXT NOT NULL,
    recipient TEXT NOT NULL,
    channel TEXT NOT NULL,
    message TEXT NOT NULL,
    simulated INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'logged',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id)
  );

  CREATE INDEX IF NOT EXISTS idx_incidents_created
  ON incidents(created_at);

  CREATE INDEX IF NOT EXISTS idx_drones_status
  ON drones(status);

  CREATE INDEX IF NOT EXISTS idx_notifications_incident
  ON notifications(incident_id);
`);

console.log("MEDI-DRONE SQLite database initialized.");

export default db;
