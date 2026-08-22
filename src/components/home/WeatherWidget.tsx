"use client";

import { useEffect, useState } from "react";
import { PREFECTURES } from "@/lib/prefectures";
import { weatherLabel } from "@/lib/weather-codes";

const STORAGE_KEY = "aqualife:selected-prefecture";
const DEFAULT_PREFECTURE = "東京都";

interface WeatherData {
  temperatureC: number;
  humidityPercent: number;
  weatherCode: number;
}

export default function WeatherWidget() {
  const [prefectureName, setPrefectureName] = useState(DEFAULT_PREFECTURE);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // localStorage(外部システム)からの初回読み込みという正当な用途のため、
    // set-state-in-effectのルールを無効化する。
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && PREFECTURES.some((p) => p.name === saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrefectureName(saved);
    }
  }, []);

  useEffect(() => {
    const prefecture = PREFECTURES.find((p) => p.name === prefectureName);
    if (!prefecture) return;

    let cancelled = false;
    // 外部API(Open-Meteo)からの取得という正当な用途のため、
    // set-state-in-effectのルールを無効化する。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${prefecture.lat}&longitude=${prefecture.lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia%2FTokyo`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("天気情報の取得に失敗しました");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setWeather({
          temperatureC: data.current.temperature_2m,
          humidityPercent: data.current.relative_humidity_2m,
          weatherCode: data.current.weather_code,
        });
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "天気情報の取得に失敗しました");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [prefectureName]);

  const handleChange = (value: string) => {
    setPrefectureName(value);
    window.localStorage.setItem(STORAGE_KEY, value);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">天気</h2>
        <select
          value={prefectureName}
          onChange={(event) => handleChange(event.target.value)}
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {PREFECTURES.map((prefecture) => (
            <option key={prefecture.name} value={prefecture.name}>
              {prefecture.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">読み込み中...</p>}
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {!loading && !error && weather && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-700 dark:text-zinc-300">
          <span>{weatherLabel(weather.weatherCode)}</span>
          <span>気温 {weather.temperatureC.toFixed(1)}℃</span>
          <span>湿度 {weather.humidityPercent}%</span>
        </div>
      )}
    </div>
  );
}
