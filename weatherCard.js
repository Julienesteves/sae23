function createCard(data, options = {}) {
  const weatherSection = document.getElementById("weatherInformation");
  const requestSection = document.getElementById("cityForm");
  weatherSection.innerHTML = "";

  const weatherContainer = document.createElement("div");
  weatherContainer.classList.add("force-white", "weather-container");

  data.forecasts.forEach((forecast, index) => {
    const code = forecast.weather;

    const dayCard = document.createElement("div");
    dayCard.classList.add("weather-card");

    // Colonne gauche : icône météo + jour
    const leftCol = createLeftCol(code, index);

    // Colonne droite : données météo
    const rightCol = createRightCol(forecast, data.city, options);

    dayCard.append(leftCol, rightCol);
    weatherContainer.appendChild(dayCard);
  });

  weatherSection.appendChild(weatherContainer);
  addReloadButton(weatherSection);
  
  requestSection.style.display = "none";
  weatherSection.style.display = "block";
}

function createLeftCol(code, index) {
  const leftCol = document.createElement("div");
  leftCol.classList.add("card-left");

  const icon = document.createElement("img");
  icon.src = getWeatherImage(code);
  icon.alt = "Météo";
  icon.classList.add("weather-icon");

  const day = document.createElement("p");
  day.classList.add("weather-day");
  day.textContent = `Jour ${index + 1}`;

  leftCol.append(icon, day);
  return leftCol;
}

function createRightCol(forecast, city, options) {
  const rightCol = document.createElement("div");
  rightCol.classList.add("card-right");

  const infoList = [
    { label: "Température min", value: `${forecast.tmin}°C` },
    { label: "Température max", value: `${forecast.tmax}°C` },
    { label: "Pluie (%)", value: `${forecast.probarain}%` },
    { label: "Ensoleillement", value: displayHours(forecast.sun_hours) },
  ];

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

function addReloadButton(container) {
  const reloadButton = document.createElement("button");
  reloadButton.textContent = "Nouvelle recherche";
  reloadButton.classList.add("reloadButton");
  reloadButton.addEventListener("click", () => location.reload());
  container.appendChild(reloadButton);
}

function displayHours(hours) {
  return `${hours} ${hours > 1 ? "heures" : "heure"}`;
}

function getWeatherImage(code) {
  const sunny = [0, 1, 2];
  const cloudy = [3, 4, 5, 6, 7];
  const rain = [10, 11, 12, 13, 14, 15, 16, 40, 41, 42, 43, 44, 45, 46, 47, 48, 210, 211, 212];
  const snow = [20, 21, 22, 60, 61, 62, 63, 64, 65, 220, 221, 222];
  const storm = [100, 101, 102, 103, 104, 105];

  if (sunny.includes(code)) return "./images/soleil.png";
  if (cloudy.includes(code)) return "./images/couvert.png";
  if (rain.includes(code)) return "./images/pluie.png";
  if (snow.includes(code)) return "./images/neige.png";
  if (storm.includes(code)) return "./images/orage.png";

  return "./images/inconnu.png";
}
