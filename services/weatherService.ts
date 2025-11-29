
export interface WeatherData {
  current: {
    temperature: number;
    weatherCode: number;
  };
  forecast: {
    date: string;
    maxTemp: number;
    minTemp: number;
    weatherCode: number;
  }[];
}

// WMO Weather interpretation codes (0-99)
// Simplified mapping
export const getWeatherCondition = (code: number): { label: string; iconType: 'sun' | 'cloud' | 'rain' | 'storm' | 'snow' } => {
  if (code === 0) return { label: 'Clear Sky', iconType: 'sun' };
  if (code >= 1 && code <= 3) return { label: 'Partly Cloudy', iconType: 'cloud' };
  if (code >= 45 && code <= 48) return { label: 'Foggy', iconType: 'cloud' };
  if (code >= 51 && code <= 67) return { label: 'Rainy', iconType: 'rain' };
  if (code >= 71 && code <= 77) return { label: 'Snow', iconType: 'snow' };
  if (code >= 80 && code <= 82) return { label: 'Showers', iconType: 'rain' };
  if (code >= 95 && code <= 99) return { label: 'Thunderstorm', iconType: 'storm' };
  return { label: 'Clear', iconType: 'sun' };
};

export const fetchWeather = async (lat: number, lng: number): Promise<WeatherData | null> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`
    );
    const data = await response.json();

    if (!data || !data.daily) return null;

    const forecast = data.daily.time.slice(0, 3).map((time: string, index: number) => ({
      date: new Date(time).toLocaleDateString('en-US', { weekday: 'short' }),
      maxTemp: Math.round(data.daily.temperature_2m_max[index]),
      minTemp: Math.round(data.daily.temperature_2m_min[index]),
      weatherCode: data.daily.weathercode[index]
    }));

    return {
      current: {
        temperature: Math.round(data.current_weather.temperature),
        weatherCode: data.current_weather.weathercode
      },
      forecast
    };
  } catch (error) {
    console.error("Weather fetch failed:", error);
    return null;
  }
};
