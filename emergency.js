
const emergencyForm = document.getElementById("emergencyForm");
const getLocationButton = document.getElementById("getLocationButton");
const locationStatus = document.getElementById("locationStatus");
const formMessage = document.getElementById("formMessage");

let userLatitude = null;
let userLongitude = null;

// Get the user's GPS location
if (getLocationButton) {
  getLocationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
      locationStatus.textContent = "GPS is not supported by this browser.";
      return;
    }

    locationStatus.textContent = "Getting your location...";
    getLocationButton.disabled = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLatitude = position.coords.latitude;
        userLongitude = position.coords.longitude;

        locationStatus.textContent =
          `Location captured: ${userLatitude.toFixed(5)}, ${userLongitude.toFixed(5)}`;

        getLocationButton.disabled = false;
      },
      (error) => {
        locationStatus.textContent =
          "Unable to get location. Allow location permission and try again.";

        console.error("GPS error:", error);
        getLocationButton.disabled = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  });
}

// Submit emergency request to backend
if (emergencyForm) {
  emergencyForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (userLatitude === null || userLongitude === null) {
      formMessage.textContent = "Please capture your GPS location first.";
      formMessage.style.color = "#ff5364";
      return;
    }

    const formData = new FormData(emergencyForm);

    const emergencyData = {
      userName: formData.get("userName"),
      userPhone: formData.get("userPhone") || "",
      triageType: formData.get("triageType"),
      description: formData.get("description") || "",
      latitude: userLatitude,
      longitude: userLongitude,
      locationSource: "gps",
      bloodGroup: formData.get("bloodGroup") || "",
      allergies: formData.get("allergies") || "",
      conditions: formData.get("conditions") || "",
      caregiverContacts: []
    };

    const submitButton = emergencyForm.querySelector(
      'button[type="submit"]'
    );

    submitButton.disabled = true;
    submitButton.textContent = "SUBMITTING REQUEST...";
    formMessage.textContent = "Sending emergency request...";
    formMessage.style.color = "#00d4aa";

    try {
      const response = await fetch(
        "http://localhost:5000/api/incidents",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(emergencyData)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Request could not be submitted.");
      }

      formMessage.textContent =
        "Emergency request recorded successfully. This is a simulated prototype; no real ambulance, emergency service, or drone has been contacted.";

      formMessage.style.color = "#00d4aa";

      console.log("Emergency response:", result);

      emergencyForm.reset();
      userLatitude = null;
      userLongitude = null;
      locationStatus.textContent = "Location has not been selected.";

    } catch (error) {
      console.error("Emergency submission error:", error);

      formMessage.textContent =
        error.message || "Unable to connect to the backend.";

      formMessage.style.color = "#ff5364";

    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "REQUEST EMERGENCY ASSISTANCE";
    }
  });
}
