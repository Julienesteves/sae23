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
      `https://api.meteo-concept.com/api/forecast/daily?token=40cb912aff2f7792bb9ecd409d50ed4e2dca5e462e8e7ae2643237298e6198be&insee=${selectedCommune}`
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

  const defaultOption = document.createElement('option');
  defaultOption.value = "";
  defaultOption.textContent = "-- Sélectionnez une commune --";
  defaultOption.selected = true;
  defaultOption.disabled = true;
  communeSelect.appendChild(defaultOption);

  if (communes.length === 0) {
    showErrorMessage("Aucune commune trouvée pour ce code postal");
    validationButton.disabled = true;
    validationButton.classList.add('disabled');
    return;
  }

  communes.forEach(commune => {
    const option = document.createElement("option");
    option.value = commune.code;
    option.textContent = commune.nom;
    communeSelect.appendChild(option);
  });

  // Activer le bouton de validation
  validationButton.disabled = false;
  validationButton.classList.remove('disabled');
}

// Affichage du message d'erreur
function showErrorMessage(message) {
  const existingMessage = document.getElementById("error-message");
  if (existingMessage) existingMessage.remove();

  const errorMessage = document.createElement("p");
  errorMessage.id = "error-message";
  errorMessage.textContent = message;
  errorMessage.classList.add('errorMessage');
  codePostalInput.insertAdjacentElement('afterend', errorMessage);
}

// Événement : saisie du code postal
codePostalInput.addEventListener("input", async () => {
  const codePostal = codePostalInput.value.trim();

  communeSelect.innerHTML = '<option value="" selected disabled>-- Sélectionnez une commune --</option>';
  validationButton.disabled = true;
  validationButton.classList.add('disabled');

  const existingMessage = document.getElementById("error-message");
  if (existingMessage) existingMessage.remove();

  if (/^\d{5}$/.test(codePostal)) {
    try {
      const communes = await fetchCommunesByCodePostal(codePostal);
      displayCommunes(communes);
    } catch {
      showErrorMessage("Erreur lors de la recherche des communes");
    }
  } else if (codePostal.length > 0) {
    showErrorMessage("Veuillez entrer un code postal valide (5 chiffres)");
  }
});

// Événement : clic sur le bouton de validation
validationButton.addEventListener("click", async () => {
  const selectedCommune = communeSelect.value;
  if (!selectedCommune || selectedCommune === "") {
    showErrorMessage("Veuillez sélectionner une commune");
    return;
  }

  try {
    const numberOfDays = parseInt(daysRange.value) || 1;
    const options = {
      latitude: document.getElementById("Latitude").checked,
      longitude: document.getElementById("Longitude").checked,
      rain: document.getElementById("Cumul de Pluie").checked,
      wind: document.getElementById("Vent Moyen").checked,
      windDirection: document.getElementById("Direction du Vent").checked
    };

    const meteoData = await fetchMeteoByCommune(selectedCommune, numberOfDays);
    createCard(meteoData, options);
  } catch (error) {
    showErrorMessage("Erreur lors de la récupération des données météo");
  }
});

// Événement : modification du nombre de jours
daysRange.addEventListener("input", () => {
  daysValue.textContent = daysRange.value;
  daysRange.setAttribute('aria-valuetext', `${daysRange.value} jour(s)`);
});
