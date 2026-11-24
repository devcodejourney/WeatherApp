import React from 'react';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Snowflake,
  Sun,
} from 'lucide-react';
import type { WeatherConditionMain } from '../types/weather';

interface WeatherGlyphProps {
  condition: WeatherConditionMain;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
  xl: 'w-16 h-16',
};

export const WeatherGlyph: React.FC<WeatherGlyphProps> = ({
  condition,
  size = 'md',
  className = '',
}) => {
  const sizeClass = `${SIZE_MAP[size]} ${className}`.trim();

  switch (condition) {
    case 'Clear':
      return (
        <Sun
          className={`${sizeClass} text-amber-500 dark:text-amber-400`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      );
    case 'Clouds':
      return (
        <CloudSun
          className={`${sizeClass} text-sky-600 dark:text-sky-300`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      );
    case 'Rain':
      return (
        <CloudRain
          className={`${sizeClass} text-sky-600 dark:text-sky-400`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      );
    case 'Drizzle':
      return (
        <CloudDrizzle
          className={`${sizeClass} text-cyan-600 dark:text-cyan-300`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      );
    case 'Thunderstorm':
    case 'Squall':
    case 'Tornado':
      return (
        <CloudLightning
          className={`${sizeClass} text-amber-600 dark:text-amber-300`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      );
    case 'Snow':
      return (
        <Snowflake
          className={`${sizeClass} text-sky-500 dark:text-sky-200`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      );
    case 'Fog':
    case 'Mist':
    case 'Haze':
    case 'Smoke':
      return (
        <CloudFog
          className={`${sizeClass} text-slate-500 dark:text-slate-400`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      );
    default:
      return (
        <Cloud
          className={`${sizeClass} text-slate-600 dark:text-slate-300`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      );
  }
};
