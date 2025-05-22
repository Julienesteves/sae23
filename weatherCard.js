function createCard(data, options = {}) {
  // Nettoyer la section avant d'ajouter de nouveaux éléments
  let weatherSection = document.getElementById("weatherInformation");
  let requestSection = document.getElementById("cityForm");
  weatherSection.innerHTML = "";

  // Créer un conteneur principal
  const weatherContainer = document.createElement("div");
  weatherContainer.classList.add("weather-container");

  // Parcourir tous les jours de prévision
  data.forecasts.forEach((forecast, index) => {
    // Créer une carte pour chaque jour
    const dayCard = document.createElement("div");
    dayCard.classList.add("day-card");

    // Ajouter le titre du jour
    const dayTitle = document.createElement("h3");
    dayTitle.textContent = `Jour ${index + 1}`;
    dayCard.appendChild(dayTitle);

    // Créer les éléments de données météo (comme dans votre version originale)
    let weatherTmin = document.createElement("p");
    let weatherTmax = document.createElement("p");
    let weatherPrain = document.createElement("p");
    let weatherSunHours = document.createElement("p");

    weatherTmin.textContent = `Température minimale : ${forecast.tmin}°C`;
    weatherTmax.textContent = `Température maximale : ${forecast.tmax}°C`;
    weatherPrain.textContent = `Probabilité de pluie : ${forecast.probarain}%`;
    weatherSunHours.textContent = `Ensoleillement : ${displayHours(forecast.sun_hours)}`;

    // Ajouter les éléments à la carte du jour
    dayCard.appendChild(weatherTmin);
    dayCard.appendChild(weatherTmax);
    dayCard.appendChild(weatherPrain);
    dayCard.appendChild(weatherSunHours);

    // Ajouter les options supplémentaires si cochées
    if (options.rain) {
      let weatherRain = document.createElement("p");
      weatherRain.textContent = `Cumul de pluie : ${forecast.rr10} mm`;
      dayCard.appendChild(weatherRain);
    }

    if (options.wind) {
      let weatherWind = document.createElement("p");
      weatherWind.textContent = `Vent moyen : ${forecast.wind10m} km/h`;
      dayCard.appendChild(weatherWind);
    }

    if (options.windDirection) {
      let weatherWindDir = document.createElement("p");
      weatherWindDir.textContent = `Direction du vent : ${forecast.dirwind10m}°`;
      dayCard.appendChild(weatherWindDir);
    }

    // Ajouter la carte du jour au conteneur principal
    weatherContainer.appendChild(dayCard);
  });

  // Ajouter les coordonnées si demandées
  if (options.latitude || options.longitude) {
    const coordsDiv = document.createElement("div");
    coordsDiv.classList.add("coordinates");
    
    if (options.latitude) {
      let lat = document.createElement("p");
      lat.textContent = `Latitude : ${data.city.latitude}`;
      coordsDiv.appendChild(lat);
    }
    
    if (options.longitude) {
      let lon = document.createElement("p");
      lon.textContent = `Longitude : ${data.city.longitude}`;
      coordsDiv.appendChild(lon);
    }
    
    weatherContainer.appendChild(coordsDiv);
  }

  // Ajouter le conteneur principal à la section
  weatherSection.appendChild(weatherContainer);

  // Bouton de nouvelle recherche (comme dans votre version originale)
  let reloadButton = document.createElement("button");
  reloadButton.textContent = "Nouvelle recherche";
  reloadButton.classList.add("reloadButton");
  weatherSection.appendChild(reloadButton);
  
  reloadButton.addEventListener("click", function() {
    location.reload();
  });

  // Gérer la visibilité des sections
  requestSection.style.display = "none";
  weatherSection.style.display = "flex";
}

function displayHours(sunHours) {
  return sunHours + (sunHours > 1 ? " heures" : " heure");
} 