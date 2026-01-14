import { useState, useEffect } from "react";

type WeatherData = {
  temperature: number;
  weatherCode: number;
};

// Simple mapping of WMO codes to emojis
const getWeatherIcon = (code: number) => {
  if (code <= 1) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  return "🌦️";
};

export const Weather = () => {
  const [data, setData] = useState<WeatherData | null>(null);

  useEffect(() => {
    // Turku coordinates: 60.4518, 22.2666
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=60.4518&longitude=22.2666&current_weather=true"
        );
        const json = await res.json();
        if (json.current_weather) {
          setData({
            temperature: json.current_weather.temperature,
            weatherCode: json.current_weather.weathercode,
          });
        }
      } catch (e) {
        console.error("Weather fetch failed", e);
      }
    };

    fetchWeather();
    // Refresh every 30 mins
    const timer = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  if (!data) return null;

  return (
    <div className="weather-widget">
      <span className="weather-icon">{getWeatherIcon(data.weatherCode)}</span>
      <span className="weather-temp">{data.temperature}°C</span>
    </div>
  );
};
