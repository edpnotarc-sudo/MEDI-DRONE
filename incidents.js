
import { Router } from "express";
import { randomUUID, randomBytes } from "node:crypto";
import db from "../db.js";

const router = Router();

const allowedTriageTypes = [
  "chest_pain",
  "breathing_difficulty",
  "severe_bleeding",
  "allergic_reaction",
  "overdose",
  "other"
];

router.post("/", (req, res) => {
  try {
    const {
      userName,
      userPhone = "",
      triageType,
      description = "",
      latitude,
      longitude,
      locationSource = "gps",
      bloodGroup = "",
      allergies = "",
      conditions = "",
      caregiverContacts = []
    } = req.body;

    // Validate required information.
    if (
      typeof userName !== "string" ||
      !userName.trim() ||
      !allowedTriageTypes.includes(triageType)
    ) {
      return res.status(400).json({
        error: "Please provide a user name and valid emergency type."
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 || lat > 90 ||
      lng < -180 || lng > 180
    ) {
      return res.status(400).json({
        error: "A valid GPS or manually selected location is required."
      });
    }

    if (
      !Array.isArray(caregiverContacts) ||
      caregiverContacts.length > 5 ||
      caregiverContacts.some(
        (contact) =>
          typeof contact !== "string" ||
          contact.length > 30
      )
    ) {
      return res.status(400).json({
        error: "Caregiver contacts must be an array of up to 5 phone numbers."
      });
    }

    const incidentId = randomUUID();
    const shareToken = randomBytes(18).toString("hex");

    const severity =
      ["chest_pain", "breathing_difficulty", "severe_bleeding",
       "overdose"].includes(triageType)
        ? "high"
        : "moderate";

    const createIncident = db.prepare(`
      INSERT INTO incidents (
        id, share_token, user_name, user_phone,
        triage_type, severity, description,
        latitude, longitude, location_source,
        blood_group, allergies, conditions,
        caregiver_contacts, status
      )
      VALUES (
        @id, @shareToken, @userName, @userPhone,
        @triageType, @severity, @description,
        @latitude, @longitude, @locationSource,
        @bloodGroup, @allergies, @conditions,
        @caregiverContacts, 'reported'
      )
    `);

    const createNotification = db.prepare(`
      INSERT INTO notifications (
        incident_id, recipient, channel, message, simulated
      )
      VALUES (?, ?, ?, ?, 1)
    `);

    const saveIncident = db.transaction(() => {
      createIncident.run({
        id: incidentId,
        shareToken,
        userName: userName.trim(),
        userPhone: String(userPhone).slice(0, 30),
        triageType,
        severity,
        description: String(description).slice(0, 1000),
        latitude: lat,
        longitude: lng,
        locationSource:
          locationSource === "manual" ? "manual" : "gps",
        bloodGroup: String(bloodGroup).slice(0, 20),
        allergies: String(allergies).slice(0, 500),
        conditions: String(conditions).slice(0, 500),
        caregiverContacts: JSON.stringify(caregiverContacts),
      });

      // This is a log only. No real 112 call is made.
      createNotification.run(
        incidentId,
        "112",
        "simulated_emergency_alert",
        "SIMULATION ONLY: Emergency alert recorded. Contact official 112 services separately."
      );

      // Simulated caregiver SMS notifications.
      caregiverContacts.forEach((phone) => {
        createNotification.run(
          incidentId,
          phone,
          "simulated_sms",
          `SIMULATION ONLY: Emergency assistance requested for ${userName.trim()}.`
        );
      });
    });

    saveIncident();

    res.status(201).json({
      success: true,
      message: "Emergency incident recorded successfully.",
      incident: {
        id: incidentId,
        shareToken,
        status: "reported",
        severity,
        triageType,
        latitude: lat,
        longitude: lng
      },
      notifications: {
        official112: "SIMULATED — no real call or notification was sent.",
        caregivers: "SIMULATED — notification records were logged only."
      }
    });

  } catch (error) {
    console.error("Incident creation failed:", error);

    res.status(500).json({
      error: "Unable to record the emergency incident."
    });
  }
});

export default router;
