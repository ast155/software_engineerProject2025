"use client";

type WeatherProps = {
  city: string;
  temp: number;
  desc: string;
  icon: string;
  humidity: number;
  wind: number;
  feels: number;
  min: number;
  max: number;
};

export default function WeatherCard({
  city,
  temp,
  desc,
  icon,
  humidity,
  wind,
  feels,
  min,
  max,
}: WeatherProps) {
  return (
    <div className="max-w-5xl mx-auto mt-6 p-6 rounded-2xl bg-gradient-to-br from-blue-600/70 to-purple-700/70 backdrop-blur-xl border border-white/20 text-white shadow-2xl flex items-center gap-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/30">
      
      <img
        src={`https://openweathermap.org/img/wn/${icon}@4x.png`}
        alt="weather"
        className="w-24 h-24 drop-shadow-xl"
      />

      <div className="flex flex-col">
        <h2 className="text-2xl font-bold tracking-wide">{city}</h2>

        <p className="text-lg font-medium capitalize">
          {temp}°F — {desc}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-3 text-sm text-white/90">
          <p>Feels like: {feels}°F</p>
          <p>Humidity: {humidity}%</p>
          <p>Wind: {wind} mph</p>
          <p>
            Min / Max: {min}°F / {max}°F
          </p>
        </div>
      </div>
    </div>
  );
}

