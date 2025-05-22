// Sélection des éléments
const codePostalInput = document.getElementById("code-postal");
const communeSelect = document.getElementById("communeSelect");
const validationButton = document.getElementById("validationButton");
const daysRange = document.getElementById("daysRange");
const daysValue = document.getElementById("daysValue");

// Fonction pour récupérer les communes par code postal
async function fetchCommunesByCodePostal(codePostal) {
  try {
    const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${codePostal}`);
    if (!response.ok) throw new Error("Erreur réseau");
    return await response.json();
  } catch (error) {
    console.error("Erreur API communes:", error);
    throw error;
  }
}

// Fonction pour récupérer les données météo
async function fetchMeteoByCommune(selectedCommune, numberOfDays = 1) {
  try {
    const response = await fetch(
      `https://api.meteo-concept.com/api/forecast/daily?token=4bba169b3e3365061d39563419ab23e5016c0f838ba282498439c41a00ef1091&insee=${selectedCommune}`
    );
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();

    console.log("Réponse API Météo:", data);

    const forecasts = data.forecasts || data.forecast;

    if (!forecasts) {
      throw new Error("Aucune donnée météo trouvée dans la réponse");
    }
    return {
      ...data,
      forecasts: forecasts.slice(0, numberOfDays)
    };

  } catch (error) {
    console.error("Erreur fetchMeteoByCommune:", error);
    throw error;
  }
}

// Afficher les communes dans le select
function displayCommunes(communes) {
  communeSelect.innerHTML = "";
  
  if (communes.length === 0) {
    showErrorMessage("Aucune commune trouvée pour ce code postal");
    return;
  }

  communes.forEach(commune => {
    const option = document.createElement("option");
    option.value = commune.code;
    option.textContent = commune.nom;
    communeSelect.appendChild(option);
  });

  communeSelect.style.display = "block";
  validationButton.style.display = "block";
}

function showErrorMessage(message) {
  const existingMessage = document.getElementById("error-message");
  if (existingMessage) existingMessage.remove();

  const errorMessage = document.createElement("p");
  errorMessage.id = "error-message";
  errorMessage.textContent = message;
  errorMessage.classList.add('errorMessage');
  codePostalInput.insertAdjacentElement('afterend', errorMessage);

  communeSelect.style.display = "none";
  validationButton.style.display = "none";
}

// Événements
codePostalInput.addEventListener("input", async () => {
  const codePostal = codePostalInput.value.trim();
  
  if (/^\d{5}$/.test(codePostal)) {
    try {
      const communes = await fetchCommunesByCodePostal(codePostal);
      displayCommunes(communes);
    } catch {
      showErrorMessage("Erreur lors de la recherche des communes");
    }
  } else {
    communeSelect.style.display = "none";
    validationButton.style.display = "none";
  }
});

validationButton.addEventListener("click", async () => {
  const selectedCommune = communeSelect.value;
  if (!selectedCommune) return;

  try {
    const numberOfDays = parseInt(daysRange.value) || 1;
    const options = {
      latitude: document.getElementById("Latitude").checked,
      longitude: document.getElementById("Longitude").checked,
      rain: document.getElementById("Cumul de pluie").checked,
      wind: document.getElementById("Vent moyen").checked,
      windDirection: document.getElementById("Direction du vent").checked
    };
    
    const meteoData = await fetchMeteoByCommune(selectedCommune, numberOfDays);
    createCard(meteoData, options);
  } catch (error) {
    showErrorMessage("Erreur lors de la récupération des données météo");
  }
});

daysRange.addEventListener("input", () => {
  daysValue.textContent = daysRange.value;
});