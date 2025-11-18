import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");

    if (!city) {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing WEATHER_API_KEY" },
        { status: 500 }
      );
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      return NextResponse.json(
        { error: "Weather API failed", details: data },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        city: data.name,
        temp: data.main.temp,
        desc: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        wind: data.wind.speed,
        feels: data.main.feels_like,
        min: data.main.temp_min,
        max: data.main.temp_max,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Weather error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


