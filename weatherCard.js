// Création de la carte météo principale
function createCard(data, options = {}) {
  const weatherSection = document.getElementById("weatherInformation");
  const requestSection = document.getElementById("cityForm");
  weatherSection.innerHTML = "";

  const weatherContainer = document.createElement("div");
  weatherContainer.classList.add("weather-container");

  // Génération d'une carte par jour de prévision
  data.forecasts.forEach((forecast, index) => {
    const dayCard = document.createElement("div");
    dayCard.classList.add("weather-card");

    const leftCol = createLeftCol(forecast.weather, index);
    const rightCol = createRightCol(forecast, data.city, options);

    dayCard.append(leftCol, rightCol);
    weatherContainer.appendChild(dayCard);
  });

  weatherSection.appendChild(weatherContainer);
  addReloadButton(weatherSection);
  
  requestSection.style.display = "none";
  weatherSection.style.display = "block";
}

// Colonne gauche : icône météo + numéro du jour
function createLeftCol(weatherCode, index) {
  const leftCol = document.createElement("div");
  leftCol.classList.add("card-left");

  const icon = document.createElement("img");
  icon.src = getWeatherImage(weatherCode);
  icon.alt = "Météo";
  icon.classList.add("weather-icon");

  const day = document.createElement("p");
  day.classList.add("weather-day");
  day.textContent = `Jour ${index + 1}`;

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

  // Données optionnelles selon les checkboxes
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

// Bouton pour relancer une nouvelle recherche
function addReloadButton(container) {
  const reloadButton = document.createElement("button");
  reloadButton.textContent = "Nouvelle recherche";
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