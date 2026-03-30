export const fetchWeatherAndAlerts = async (locationString, apiKey) => {
  if (!apiKey) {
    console.warn("OpenWeather API key is missing. Using fallback alert for UI testing.");
    return null; // The UI will fallback to default mock alerts if this is null
  }

  // CACHING LOGIC: Prevent hitting the API on every page reload
  const CACHE_KEY = `weather_${locationString.replace(/\s+/g, '')}`; // e.g. "weather_Nizamabad,Telangana"
  const CACHE_HOURS = 1; // Store data for 1 hour

  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const parsedCache = JSON.parse(cachedData);
      const isFresh = (Date.now() - parsedCache.timestamp) < (CACHE_HOURS * 60 * 60 * 1000);
      
      if (isFresh) {
        // Return instantly from browser memory! No API call made.
        return parsedCache.data;
      }
    }
  } catch (e) {
    console.warn("Failed to read from localStorage cache", e);
  }

  try {
    // 1. Convert State & District to Lat/Lon via Geo API
    // We expect locationString format: "District, State"
    const parts = locationString.split(',');
    const district = parts[0]?.trim() || '';
    const state = parts[1]?.trim() || '';
    
    // We append ",IN" to restrict searches to India
    const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${district},${state},IN&limit=1&appid=${apiKey}`);
    const geoData = await geoResponse.json();

    // Check if OpenWeather returned an error object instead of an array (like 401 Unauthorized)
    if (geoData.cod === '401' || geoData.cod === 401 || geoData.message) {
      throw new Error(`OpenWeather API Error: ${geoData.message}`);
    }

    if (!Array.isArray(geoData) || geoData.length === 0) {
      throw new Error("Could not find coordinates for this district.");
    }

    const { lat, lon } = geoData[0];

    // 2. Fetch the 5-day / 3-hour Forecast to get Rain Probability (pop) and Wind Speed
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
    const forecastData = await forecastResponse.json();

    // 3. Extract the most immediate forecast (next 3 hours)
    const currentForecast = forecastData.list[0];
    
    const temp = Math.round(currentForecast.main.temp);
    const humidity = currentForecast.main.humidity;
    const windSpeed_kmh = Math.round(currentForecast.wind.speed * 3.6); // Convert m/s to km/h
    const rainProbability = currentForecast.pop; // decimal between 0 and 1
    const condition = currentForecast.weather[0].main; 
    const description = currentForecast.weather[0].description;
    
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

    const finalResult = { weather: currentForecast, alert };

    // Save the fresh data to cache before returning
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
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
