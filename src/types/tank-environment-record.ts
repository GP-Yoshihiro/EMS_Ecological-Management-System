export interface TankEnvironmentRecord {
  id: string;
  tankId: string;
  /** 記録日時(ISO) */
  recordedAt: string;
  ambientTemperatureC: number | null;
  humidityPercent: number | null;
  waterTemperatureC: number | null;
  /** 綺麗度(0〜100) */
  cleanlinessPercent: number;
  createdAt: string;
}
