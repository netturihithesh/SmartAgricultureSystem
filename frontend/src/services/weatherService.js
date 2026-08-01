const generateMockWeather = (locationOrCoords) => {
  let district = 'Nizamabad';
  let state = 'Telangana';

  if (locationOrCoords && typeof locationOrCoords === 'object') {
    district = 'Hyderabad (GPS)';
    state = 'Telangana';
  } else if (typeof locationOrCoords === 'string') {
    const parts = locationOrCoords.split(',');
    district = parts[0]?.trim() || 'Nizamabad';
    state = parts[1]?.trim() || 'Telangana';
  }

  const normalized = district.toLowerCase();
  
  let temp = 31;
  let humidity = 62;
  let windSpeed = 3.3; // m/s (~12 km/h)
  let main = 'Clear';
  let description = 'clear sky';
  let pop = 0.15;
  let alertTitle = '✅ Optimal Farming Conditions (Simulated)';
  let alertMessage = `Weather in ${district}, ${state} is optimal: 31°C with 12 km/h winds. Clear to proceed.`;
  let alertSeverity = 'success';
  let alertBg = '#F1F8E9';
  let alertIcon = '#388E3C';

  if (normalized.includes('heavy rain') || normalized.includes('cherrapunji') || normalized.includes('storm') || normalized.includes('warangal')) {
    temp = 22;
    humidity = 95;
    windSpeed = 5.5; // ~20 km/h
    main = 'Rain';
    description = 'heavy intensity rain';
    pop = 0.95;
    alertTitle = '⚠️ Heavy Rain Warning (Simulated)';
    alertMessage = `Extreme rainfall warning in ${district}. Risk of waterlogging. Check drainage systems.`;
    alertSeverity = 'warning';
    alertBg = '#FFF8E1';
    alertIcon = '#F57F17';
  } else if (normalized.includes('moderate rain') || normalized.includes('hyderabad')) {
    temp = 24;
    humidity = 88;
    windSpeed = 4.0;
    main = 'Rain';
    description = 'moderate rain';
    pop = 0.70;
    alertTitle = '🌧 Rainfall Detected (Simulated)';
    alertMessage = `Moderate rain in ${district}. Delay fertilizer application to prevent chemical runoff.`;
    alertSeverity = 'warning';
    alertBg = '#FFF8E1';
    alertIcon = '#F57F17';
  } else if (normalized.includes('light rain') || normalized.includes('mumbai') || normalized.includes('drizzle')) {
    temp = 26;
    humidity = 80;
    windSpeed = 2.5;
    main = 'Rain';
    description = 'light intensity drizzle';
    pop = 0.45;
    alertTitle = '🌦 Light Drizzle (Simulated)';
    alertMessage = `Light rain in ${district}. Soil moisture is rising. Monitor spraying conditions.`;
    alertSeverity = 'success';
    alertBg = '#F1F8E9';
    alertIcon = '#388E3C';
  } else if (normalized.includes('hot') || normalized.includes('adilabad') || normalized.includes('ramagundam')) {
    temp = 39;
    humidity = 35;
    windSpeed = 3.0;
    main = 'Clear';
    description = 'clear sky';
    pop = 0.0;
    alertTitle = '🔥 High Temperature Alert (Simulated)';
    alertMessage = `Extreme heat in ${district} (${temp}°C). Boost irrigation by 10% to prevent crop stress.`;
    alertSeverity = 'warning';
    alertBg = '#FFEBEE';
    alertIcon = '#D32F2F';
  } else if (normalized.includes('cool') || normalized.includes('shimla') || normalized.includes('ooty')) {
    temp = 18;
    humidity = 55;
    windSpeed = 2.0;
    main = 'Clear';
    description = 'clear sky';
    pop = 0.0;
    alertTitle = '❄️ Cool Weather Alert (Simulated)';
    alertMessage = `Crisp morning temperatures in ${district} (${temp}°C). Growth conditions are stable.`;
    alertSeverity = 'success';
    alertBg = '#F1F8E9';
    alertIcon = '#388E3C';
  } else if (normalized.includes('windy') || normalized.includes('karimnagar')) {
    temp = 27;
    humidity = 50;
    windSpeed = 7.5; // ~27 km/h
    main = 'Clear';
    description = 'clear sky';
    pop = 0.0;
    alertTitle = '🌬 Strong Winds Detected (Simulated)';
    alertMessage = `High wind speeds in ${district} (${Math.round(windSpeed * 3.6)} km/h). Avoid chemical spraying.`;
    alertSeverity = 'warning';
    alertBg = '#F3E5F5';
    alertIcon = '#8E24AA';
  } else if (normalized.includes('clouds') || normalized.includes('nizamabad') || normalized.includes('overcast')) {
    temp = 28;
    humidity = 70;
    windSpeed = 3.0;
    main = 'Clouds';
    description = 'overcast clouds';
    pop = 0.20;
    alertTitle = '☁️ Overcast Conditions (Simulated)';
    alertMessage = `Cloudy skies in ${district}. Photosynthesis rates might be slightly lower.`;
    alertSeverity = 'success';
    alertBg = '#F1F8E9';
    alertIcon = '#388E3C';
  }

  const currentForecast = {
    dt: Math.floor(Date.now() / 1000),
    main: { temp, humidity },
    wind: { speed: windSpeed },
    pop,
    weather: [{ main, description }]
  };

  const alert = {
    title: alertTitle,
    message: alertMessage,
    severity: alertSeverity,
    bgColor: alertBg,
    iconColor: alertIcon
  };

  const forecastList = [];
  const baseTime = Math.floor(Date.now() / 1000);
  
  for (let i = 0; i < 40; i++) {
    const timeOffset = i * 3 * 60 * 60;
    const tempVariance = Math.sin(i / 2) * 3;
    let fMain = main;
    let fDesc = description;
    let fPop = pop;

    if (main === 'Rain') {
      fMain = Math.random() > 0.3 ? 'Rain' : 'Clouds';
      fDesc = fMain === 'Rain' ? description : 'broken clouds';
      fPop = fMain === 'Rain' ? pop : 0.4;
    }

    forecastList.push({
      dt: baseTime + timeOffset,
      main: {
        temp: temp + tempVariance,
        humidity: Math.min(100, Math.max(0, humidity + Math.sin(i) * 5)),
      },
      wind: {
        speed: windSpeed + Math.cos(i) * 0.8,
      },
      pop: fPop,
      weather: [{ main: fMain, description: fDesc }]
    });
  }

  return {
    weather: currentForecast,
    alert,
    forecastList,
    locationName: state ? `${district}, ${state}` : district,
    isGps: locationOrCoords && typeof locationOrCoords === 'object',
    coords: (locationOrCoords && typeof locationOrCoords === 'object') ? {
      lat: locationOrCoords.latitude || locationOrCoords.lat || 17.3850,
      lon: locationOrCoords.longitude || locationOrCoords.lon || 78.4867
    } : null
  };
};

export const fetchWeatherAndAlerts = async (locationOrCoords, apiKey, forceRefresh = false) => {
  const isCoords = locationOrCoords && typeof locationOrCoords === 'object' && 
                   ('latitude' in locationOrCoords || 'lat' in locationOrCoords) &&
                   ('longitude' in locationOrCoords || 'lon' in locationOrCoords);

  if (!apiKey) {
    console.warn("OpenWeather API key is missing. Attempting Nominatim reverse geocoding fallback.");
    let resolvedLocation = null;
    if (isCoords) {
      try {
        const lat = locationOrCoords.latitude || locationOrCoords.lat;
        const lon = locationOrCoords.longitude || locationOrCoords.lon;
        const reverseResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
        const reverseData = await reverseResponse.json();
        if (reverseData && reverseData.address) {
          const addr = reverseData.address;
          const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || 'GPS Location';
          const stateName = addr.state || '';
          resolvedLocation = { city, state: stateName };
        }
      } catch (err) {
        console.warn("Nominatim geocoding failed, falling back to mock defaults", err);
      }
    }
    const mockRes = generateMockWeather(locationOrCoords);
    if (resolvedLocation) {
      mockRes.locationName = resolvedLocation.state ? `${resolvedLocation.city}, ${resolvedLocation.state}` : resolvedLocation.city;
    }
    return mockRes;
  }

  // CACHING LOGIC: Prevent hitting the API on every page reload
  let cacheKey;
  if (isCoords) {
    const lat = locationOrCoords.latitude || locationOrCoords.lat;
    const lon = locationOrCoords.longitude || locationOrCoords.lon;
    cacheKey = `weather_coords_${lat.toFixed(2)}_${lon.toFixed(2)}`;
  } else if (typeof locationOrCoords === 'string') {
    cacheKey = `weather_${locationOrCoords.replace(/\s+/g, '')}`;
  } else {
    cacheKey = 'weather_default';
  }

  const CACHE_HOURS = 1; // Store data for 1 hour

  try {
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        const isFresh = (Date.now() - parsedCache.timestamp) < (CACHE_HOURS * 60 * 60 * 1000);
        
        if (isFresh && parsedCache.data) {
          return parsedCache.data;
        }
      }
    }
  } catch (e) {
    console.warn("Failed to read from localStorage cache", e);
  }

  try {
    let lat, lon, city = '', state = '';

    if (isCoords) {
      lat = locationOrCoords.latitude || locationOrCoords.lat;
      lon = locationOrCoords.longitude || locationOrCoords.lon;
      
      // Reverse geocode to get city name
      try {
        const reverseResponse = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`);
        const reverseData = await reverseResponse.json();
        if (Array.isArray(reverseData) && reverseData.length > 0) {
          city = reverseData[0].name || '';
          state = reverseData[0].state || '';
        }
      } catch (err) {
        console.warn("Failed to reverse geocode coordinates", err);
      }
    } else {
      // Convert State & District to Lat/Lon via Geo API
      const parts = locationOrCoords.split(',');
      const district = parts[0]?.trim() || '';
      const statePart = parts[1]?.trim() || '';
      
      // We append ",IN" to restrict searches to India
      const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${district},${statePart},IN&limit=1&appid=${apiKey}`);
      const geoData = await geoResponse.json();

      // Check if OpenWeather returned an error object instead of an array (like 401 Unauthorized)
      if (geoData.cod === '401' || geoData.cod === 401 || geoData.message) {
        throw new Error(`OpenWeather API Error: ${geoData.message}`);
      }

      if (!Array.isArray(geoData) || geoData.length === 0) {
        throw new Error("Could not find coordinates for this district.");
      }

      lat = geoData[0].lat;
      lon = geoData[0].lon;
      city = geoData[0].name;
      state = geoData[0].state || '';
    }

    // 2. Fetch the 5-day / 3-hour Forecast to get Rain Probability (pop) and Wind Speed
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
    const forecastData = await forecastResponse.json();

    // 3. Extract the most immediate forecast (next 3 hours)
    const currentForecast = forecastData.list[0];
    
    const temp = Math.round(currentForecast.main.temp);
    const humidity = currentForecast.main.humidity;
    const windSpeed_kmh = Math.round(currentForecast.wind.speed * 3.6); // Convert m/s to km/h
    const rainProbability = currentForecast.pop; // decimal between 0 and 1
    
    // 4. Generate Smart Farming Alerts based on strict logic rules
    let alert = null;

    if (rainProbability > 0.60) {
      alert = {
        title: `⚠️ High Rain Probability (${Math.round(rainProbability * 100)}%)`,
        message: "Delay fertilizer application to prevent chemical runoff.",
        severity: "warning",
        bgColor: '#FFF8E1',
        iconColor: '#F57F17'
      };
    } else if (windSpeed_kmh > 20) {
      alert = {
        title: `💨 Strong Winds Detected (${windSpeed_kmh} km/h)`,
        message: "Avoid pesticide spraying today to prevent chemical drift.",
        severity: "warning",
        bgColor: '#F3E5F5',
        iconColor: '#8E24AA'
      };
    } else if (temp > 35) {
      alert = {
        title: "🔥 High Temperature Alert",
        message: `It is currently ${temp}°C. Increase irrigation to prevent heat stress on crops.`,
        severity: "warning",
        bgColor: '#FFEBEE',
        iconColor: '#D32F2F'
      };
    } else if (humidity > 85) {
      alert = {
        title: "💧 High Humidity Detected",
        message: `Humidity is very high (${humidity}%). Monitor crops closely for fungal diseases.`,
        severity: "warning",
        bgColor: '#E0F7FA',
        iconColor: '#0097A7'
      };
    } else {
      alert = {
        title: "✅ Optimal Farming Conditions",
        message: `Current temp is ${temp}°C with ${windSpeed_kmh} km/h winds. Clear to proceed with routine tasks.`,
        severity: "success",
        bgColor: '#F1F8E9',
        iconColor: '#388E3C'
      };
    }

    const finalResult = { 
      weather: currentForecast, 
      alert, 
      forecastList: forecastData.list,
      locationName: city ? (state ? `${city}, ${state}` : city) : '',
      isGps: isCoords,
      coords: isCoords ? { lat, lon } : null
    };

    // Save the fresh data to cache before returning
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: finalResult
      }));
    } catch (e) {
      console.warn("Failed to save to localStorage cache", e);
    }

    return finalResult;

  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return null;
  }
};
