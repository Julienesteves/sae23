// Variable globale pour la carte
let franceMap = null;

// Création de la carte météo principale
function createCard(data, options = {}) {
  const weatherSection = document.getElementById("weatherInformation");
  const requestSection = document.getElementById("cityForm");
  weatherSection.innerHTML = "";

  const weatherContainer = document.createElement("div");
  weatherContainer.classList.add("weather-container");

  // Conteneur pour les cartes météo
  const weatherCards = document.createElement("div");
  weatherCards.classList.add("weather-cards");

  // Génération d'une carte par jour de prévision
  data.forecasts.forEach((forecast, index) => {
    const dayCard = document.createElement("div");
    dayCard.classList.add("weather-card");

    const leftCol = createLeftCol(forecast.weather, forecast.datetime, index);
    const rightCol = createRightCol(forecast, data.city, options);

    dayCard.append(leftCol, rightCol);
    weatherCards.appendChild(dayCard);
  });

  // Création de la carte de France
  const mapContainer = createMapContainer(data.city);

  weatherContainer.appendChild(weatherCards);
  weatherContainer.appendChild(mapContainer);
  weatherSection.appendChild(weatherContainer);
  
  addReloadButton(weatherSection);
  
  requestSection.style.display = "none";
  weatherSection.style.display = "block";

  // Initialiser la carte après un court délai
  setTimeout(() => initializeFranceMap(data.city), 100);
}

// Création du conteneur de carte
function createMapContainer(city) {
  const mapContainer = document.createElement("div");
  mapContainer.classList.add("map-container");

  const mapHeader = document.createElement("div");
  mapHeader.classList.add("map-header");
  mapHeader.innerHTML = '<i class="fas fa-map-marker-alt"></i> Localisation';

  const mapElement = document.createElement("div");
  mapElement.id = "franceMap";

  const mapInfo = document.createElement("div");
  mapInfo.classList.add("map-info");
  
  const title = document.createElement("h4");
  title.textContent = city.name;
  
  const coords = document.createElement("p");
  coords.innerHTML = `<strong>Coordonnées :</strong><br>Lat: ${city.latitude}° | Lon: ${city.longitude}°`;

  mapInfo.appendChild(title);
  mapInfo.appendChild(coords);

  mapContainer.appendChild(mapHeader);
  mapContainer.appendChild(mapElement);
  mapContainer.appendChild(mapInfo);

  return mapContainer;
}

// Initialisation de la carte de France
function initializeFranceMap(city) {
  if (franceMap) {
    franceMap.remove();
  }

  const lat = parseFloat(city.latitude);
  const lon = parseFloat(city.longitude);

  // Créer la carte centrée sur la France
  franceMap = L.map('franceMap').setView([46.603354, 1.888334], 6);

  const currentTheme = document.documentElement.getAttribute('data-theme');
  const tileLayer = currentTheme === 'dark' 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  L.tileLayer(tileLayer, {
    attribution: currentTheme === 'dark' 
      ? '&copy; <a href="https://carto.com/attributions">CARTO</a>' 
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(franceMap);

  // Ajouter le marqueur rouge pour la ville
  const redIcon = L.divIcon({
    className: 'custom-red-marker',
    html: '<div style="background-color: #dc3545; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  L.marker([lat, lon], { icon: redIcon })
    .addTo(franceMap)
    .bindPopup(`<strong>${city.name}</strong><br>Lat: ${lat}°<br>Lon: ${lon}°`);

  // Centrer la vue sur la ville avec un zoom approprié
  franceMap.setView([lat, lon], 8);
}

// Fonction pour obtenir le nom du jour de la semaine
function getDayName(dateString, index) {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  
  if (index === 0) {
    return "Aujourd'hui";
  }
  
  if (dateString) {
    const date = new Date(dateString);
    return days[date.getDay()];
  }
  
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + index);
  
  return days[targetDate.getDay()];
}

// Colonne gauche : icône météo + jour de la semaine
function createLeftCol(weatherCode, datetime, index) {
  const leftCol = document.createElement("div");
  leftCol.classList.add("card-left");

  const icon = document.createElement("img");
  icon.src = getWeatherImage(weatherCode);
  icon.alt = "Météo";
  icon.classList.add("weather-icon");

  const day = document.createElement("p");
  day.classList.add("weather-day");
  day.textContent = getDayName(datetime, index);

  leftCol.append(icon, day);
  return leftCol;
}

// Colonne droite : données météo détaillées
function createRightCol(forecast, city, options) {
  const rightCol = document.createElement("div");
  rightCol.classList.add("card-right");

  // Données de base toujours affichées
  const infoList = [
    { label: "Température min", value: `${forecast.tmin}°C` },
    { label: "Température max", value: `${forecast.tmax}°C` },
    { label: "Pluie (%)", value: `${forecast.probarain}%` },
    { label: "Ensoleillement", value: `${forecast.sun_hours}h` }
  ];

  // Données optionnelles selon les checkboxe
  if (options.rain) infoList.push({ label: "Cumul de pluie", value: `${forecast.rr10} mm` });
  if (options.wind) infoList.push({ label: "Vent moyen", value: `${forecast.wind10m} km/h` });
  if (options.windDirection) infoList.push({ label: "Direction vent", value: `${forecast.dirwind10m}°` });
  if (options.latitude) infoList.push({ label: "Latitude", value: city.latitude });
  if (options.longitude) infoList.push({ label: "Longitude", value: city.longitude });

  infoList.forEach(({ label, value }) => {
    const line = document.createElement("div");
    line.classList.add("weather-info-line");

    const spanLabel = document.createElement("span");
    spanLabel.classList.add("weather-label");
    spanLabel.textContent = `${label} :`;

    const spanValue = document.createElement("span");
    spanValue.classList.add("weather-value");
    spanValue.textContent = value;

    line.append(spanLabel, spanValue);
    rightCol.appendChild(line);
  });

  return rightCol;
}

// Bouton pour relancé une nouvelle recherche
function addReloadButton(container) {
  const reloadButton = document.createElement("button");
  reloadButton.innerHTML = '<i class="fas fa-redo"></i> Nouvelle recherche';
  reloadButton.addEventListener("click", () => location.reload());
  container.appendChild(reloadButton);
}

// Association code météo = image correspondante
function getWeatherImage(code) {
  const weatherTypes = {
    sunny: [0, 1, 2],
    cloudy: [3, 4, 5, 6, 7],
    rain: [10, 11, 12, 13, 14, 15, 16, 40, 41, 42, 43, 44, 45, 46, 47, 48, 210, 211, 212],
    snow: [20, 21, 22, 60, 61, 62, 63, 64, 65, 220, 221, 222],
    storm: [100, 101, 102, 103, 104, 105]
  };

  if (weatherTypes.sunny.includes(code)) return "./images/soleil.png";
  if (weatherTypes.cloudy.includes(code)) return "./images/couvert.png";
  if (weatherTypes.rain.includes(code)) return "./images/pluie.png";
  if (weatherTypes.snow.includes(code)) return "./images/neige.png";
  if (weatherTypes.storm.includes(code)) return "./images/orage.png";

  return "./images/inconnu.png";
}