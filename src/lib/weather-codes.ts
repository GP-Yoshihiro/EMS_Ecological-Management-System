/** Open-Meteoが返すWMO天気コードの日本語ラベル */
const WEATHER_CODE_LABELS: Record<number, string> = {
  0: "快晴",
  1: "晴れ",
  2: "一部曇り",
  3: "曇り",
  45: "霧",
  48: "霧(霜)",
  51: "霧雨(弱)",
  53: "霧雨(並)",
  55: "霧雨(強)",
  56: "着氷性の霧雨(弱)",
  57: "着氷性の霧雨(強)",
  61: "雨(弱)",
  63: "雨(並)",
  65: "雨(強)",
  66: "着氷性の雨(弱)",
  67: "着氷性の雨(強)",
  71: "雪(弱)",
  73: "雪(並)",
  75: "雪(強)",
  77: "霧雪",
  80: "にわか雨(弱)",
  81: "にわか雨(並)",
  82: "にわか雨(強)",
  85: "にわか雪(弱)",
  86: "にわか雪(強)",
  95: "雷雨",
  96: "雷雨(雹を伴う・弱)",
  99: "雷雨(雹を伴う・強)",
};

export function weatherLabel(code: number): string {
  return WEATHER_CODE_LABELS[code] ?? "不明";
}

export type WeatherIconKind = "sunny" | "cloudy" | "rain" | "heavy-rain" | "snow";

const SUNNY_CODES = new Set([0, 1]);
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);
/** 雷雨・雹を伴う雨・強い雨は「大雨」アイコンにまとめる */
const HEAVY_RAIN_CODES = new Set([65, 67, 82, 95, 96, 99]);
const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 66, 80, 81]);

/** WMO天気コードを、イラスト表示用の5種類(晴れ・曇り・雨・大雨・雪)に分類する */
export function weatherIconKind(code: number): WeatherIconKind {
  if (SUNNY_CODES.has(code)) return "sunny";
  if (SNOW_CODES.has(code)) return "snow";
  if (HEAVY_RAIN_CODES.has(code)) return "heavy-rain";
  if (RAIN_CODES.has(code)) return "rain";
  return "cloudy";
}
