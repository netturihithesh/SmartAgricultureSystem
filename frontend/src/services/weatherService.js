const generateMockWeather = (locationOrCoords) => {
  let district = 'Nizamabad';
  let state = 'Telangana';

  if (locationOrCoords && typeof locationOrCoords === 'object') {
    const lat = locationOrCoords.latitude || locationOrCoords.lat || 0;
    const lon = locationOrCoords.longitude || locationOrCoords.lon || 0;
    district = `GPS (${lat.toFixed(2)}°N`;
    state = `${lon.toFixed(2)}°E)`;
  } else if (typeof locationOrCoords === 'string') {
    const parts = locationOrCoords.split(',');
    district = parts[0]?.trim() || 'Nizamabad';
    state = parts[1]?.trim() || 'Telangana';
  }

  const currentForecast = {
    dt: Math.floor(Date.now() / 1000),
    main: {
      temp: 31,
      humidity: 62,
    },
    wind: {
      speed: 3.3, // ~12 km/h
    },
    pop: 0.15,
    weather: [
      {
        main: 'Clear',
        description: 'scattered clouds',
      }
    ]
  };

  const alert = {
    title: "✅ Optimal Farming Conditions (Simulated)",
    message: `Weather in ${district}, ${state} is optimal: 31°C with 12 km/h winds. Clear to proceed with routine spraying and irrigation.`,
    severity: "success",
    bgColor: '#F1F8E9',
    iconColor: '#388E3C'
  };

  const forecastList = [];
  const baseTime = Math.floor(Date.now() / 1000);
  const conditions = ['Clear', 'Clouds', 'Rain', 'Clear', 'Clouds'];
  
  for (let i = 0; i < 40; i++) {
    const timeOffset = i * 3 * 60 * 60;
    const dayIndex = Math.floor(i / 8);
    const tempVariance = Math.sin(i / 2) * 4;
    forecastList.push({
      dt: baseTime + timeOffset,
      main: {
        temp: 29 + tempVariance,
        humidity: 60 + Math.sin(i) * 10,
      },
      wind: {
        speed: 3 + Math.cos(i) * 1.5,
      },
      pop: conditions[dayIndex] === 'Rain' ? 0.70 : 0.1,
      weather: [
        {
          main: conditions[dayIndex],
          description: conditions[dayIndex] === 'Rain' ? 'light rain' : 'scattered clouds',
        }
      ]
    });
  }

  return { 
    weather: currentForecast, 
    alert, 
    forecastList,
    locationName: state ? `${district}, ${state}` : district,
    isGps: locationOrCoords && typeof locationOrCoords === 'object',
    coords: (locationOrCoords && typeof locationOrCoords === 'object') ? {
      lat: locationOrCoords.latitude || locationOrCoords.lat || 0,
      lon: locationOrCoords.longitude || locationOrCoords.lon || 0
    } : null
  };
};

export const fetchWeatherAndAlerts = async (locationOrCoords, apiKey) => {
  if (!apiKey) {
    console.warn("OpenWeather API key is missing. Using high-quality mock weather data.");
    return generateMockWeather(locationOrCoords);
  }

  const isCoords = locationOrCoords && typeof locationOrCoords === 'object' && 
                   ('latitude' in locationOrCoords || 'lat' in locationOrCoords) &&
                   ('longitude' in locationOrCoords || 'lon' in locationOrCoords);

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
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const parsedCache = JSON.parse(cachedData);
      const isFresh = (Date.now() - parsedCache.timestamp) < (CACHE_HOURS * 60 * 60 * 1000);
      
      if (isFresh && parsedCache.data) {
        return parsedCache.data;
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
