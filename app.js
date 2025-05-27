// Sélection des éléments essentiels
const codePostalInput = document.getElementById("code-postal");
const communeSelect = document.getElementById("communeSelect");
const validationButton = document.getElementById("validationButton");
const daysRange = document.getElementById("daysRange");
const daysValue = document.getElementById("daysValue");
const darkModeToggle = document.getElementById("darkModeToggle");

// Gestion du dark mode
function toggleDarkMode() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  const icon = darkModeToggle.querySelector('i');
  icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Initialisation du thème au chargement
function checkTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const icon = darkModeToggle.querySelector('i');
  icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

darkModeToggle.addEventListener('click', toggleDarkMode);
document.addEventListener('DOMContentLoaded', checkTheme);

// API communes
async function fetchCommunesByCodePostal(codePostal) {
  const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${codePostal}`);
  if (!response.ok) throw new Error("Erreur réseau");
  return await response.json();
}

// API météo
async function fetchMeteoByCommune(selectedCommune, numberOfDays = 1) {
  const response = await fetch(
    `https://api.meteo-concept.com/api/forecast/daily?token=40cb912aff2f7792bb9ecd409d50ed4e2dca5e462e8e7ae2643237298e6198be&insee=${selectedCommune}`
  );
  if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

  const data = await response.json();
  const forecasts = data.forecasts || data.forecast;
  
  if (!forecasts) throw new Error("Aucune donnée météo trouvée");

  return {
    ...data,
    forecasts: forecasts.slice(0, numberOfDays)
  };
}

// Affichage des communes
function displayCommunes(communes) {
  communeSelect.innerHTML = '<option value="" selected disabled>-- Sélectionnez une commune --</option>';

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

  validationButton.disabled = false;
  validationButton.classList.remove('disabled');
}

// Gestion des erreurs
function showErrorMessage(message) {
  const existingMessage = document.getElementById("error-message");
  if (existingMessage) existingMessage.remove();

  const errorMessage = document.createElement("p");
  errorMessage.id = "error-message";
  errorMessage.textContent = message;
  errorMessage.classList.add('errorMessage');
  codePostalInput.insertAdjacentElement('afterend', errorMessage);
}

// Validation du code postal et recherche des communes
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

// Validation finale et récupération météo
validationButton.addEventListener("click", async () => {
  const selectedCommune = communeSelect.value;
  if (!selectedCommune) {
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

// Mise à jour de l'affichage du nombre de jours
daysRange.addEventListener("input", () => {
  daysValue.textContent = daysRange.value;
});