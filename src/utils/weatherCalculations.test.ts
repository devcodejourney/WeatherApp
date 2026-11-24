import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDailyForecasts,
  calculateDewPointC,
  calculateHeatIndexC,
  classifyHumidityIndex,
  convertTemp,
  evaluateSevereAlerts,
  formatLocalTime,
} from './weatherCalculations';
import type { AlertPreferences, CurrentWeather } from '../types/weather';

test('convertTemp accurately converts Celsius to Fahrenheit and rounds', () => {
  assert.equal(convertTemp(0, 'c'), 0);
  assert.equal(convertTemp(0, 'f'), 32);
  assert.equal(convertTemp(25.4, 'c'), 25);
  assert.equal(convertTemp(25, 'f'), 77);
  assert.equal(convertTemp(-10, 'f'), 14);
});

test('calculateDewPointC matches Magnus-Tetens meteorological expectations', () => {
  // At 20°C and 50% RH, dew point is ~9.3°C
  const dp1 = calculateDewPointC(20, 50);
  assert.ok(dp1 >= 9.0 && dp1 <= 9.6, `Expected ~9.3°C, got ${dp1}`);

  // At 100% RH, dew point equals ambient temperature
  const dp2 = calculateDewPointC(28, 100);
  assert.equal(dp2, 28);
});

test('calculateHeatIndexC rises sharply under high temperature and humidity', () => {
  const hiHotHumid = calculateHeatIndexC(33, 75);
  assert.ok(hiHotHumid > 40, `Expected oppressive heat index > 40°C, got ${hiHotHumid}`);

  const hiCool = calculateHeatIndexC(16, 50);
  assert.ok(hiCool <= 17, `Expected cool apparent temp <= 17°C, got ${hiCool}`);
});

test('classifyHumidityIndex categorizes Dry, Comfortable, and Oppressive bands', () => {
  const dry = classifyHumidityIndex(22, 20);
  assert.equal(dry.comfortLevel, 'Dry');

  const comfortable = classifyHumidityIndex(22, 50);
  assert.equal(comfortable.comfortLevel, 'Comfortable');

  const oppressive = classifyHumidityIndex(32, 85);
  assert.equal(oppressive.comfortLevel, 'Oppressive');
  assert.ok(oppressive.indexScore >= 85);
});

test('formatLocalTime respects positive and negative UTC timezone offsets', () => {
  // 2026-11-24T00:00:00Z = 1795478400
  const midnightUtc = 1795478400;
  assert.equal(formatLocalTime(midnightUtc, 0), '00:00');
  assert.equal(formatLocalTime(midnightUtc, 6 * 3600), '06:00'); // Dhaka UTC+6
  assert.equal(formatLocalTime(midnightUtc, -5 * 3600), '19:00'); // NYC UTC-5
});

test('buildDailyForecasts aggregates 3-hour slots into daily summaries', () => {
  const baseTs = 1795478400; // 2026-11-24 00:00 UTC
  const rawList = [
    {
      dt: baseTs + 3 * 3600,
      main: { temp: 18, feels_like: 18, temp_min: 17, temp_max: 19, humidity: 60, pressure: 1014 },
      wind: { speed: 4 },
      pop: 0.1,
      weather: [{ main: 'Clear', description: 'clear sky' }],
    },
    {
      dt: baseTs + 12 * 3600,
      main: { temp: 26, feels_like: 26, temp_min: 25, temp_max: 27, humidity: 48, pressure: 1012 },
      wind: { speed: 5 },
      pop: 0.25,
      weather: [{ main: 'Clouds', description: 'scattered clouds' }],
    },
    {
      dt: baseTs + 36 * 3600,
      main: { temp: 22, feels_like: 22, temp_min: 21, temp_max: 23, humidity: 78, pressure: 1008 },
      wind: { speed: 8 },
      pop: 0.85,
      weather: [{ main: 'Rain', description: 'moderate rain' }],
    },
  ];

  const { hourlySlots, dailyForecast } = buildDailyForecasts(rawList, 0);
  assert.equal(hourlySlots.length, 3);
  assert.equal(dailyForecast.length, 2);
  assert.equal(dailyForecast[0].dayLabel, 'Today');
  assert.equal(dailyForecast[0].tempMinC, 18);
  assert.equal(dailyForecast[0].tempMaxC, 26);
  assert.equal(dailyForecast[0].maxPop, 25);
  assert.equal(dailyForecast[0].conditionMain, 'Clouds');
  assert.equal(dailyForecast[1].maxPop, 85);
});

test('evaluateSevereAlerts triggers warning and advisories based on thresholds', () => {
  const current: CurrentWeather = {
    city: 'Dhaka',
    country: 'BD',
    lat: 23.81,
    lon: 90.41,
    tempC: 34,
    feelsLikeC: 41,
    tempMinC: 30,
    tempMaxC: 35,
    humidity: 86,
    pressure: 1004,
    windSpeedKmh: 48,
    windDeg: 180,
    clouds: 90,
    visibilityKm: 6,
    conditionMain: 'Thunderstorm',
    description: 'heavy thunderstorm',
    sunrise: 1795478400,
    sunset: 1795518000,
    timezoneOffset: 21600,
    dt: 1795490000,
    lastUpdatedIso: '2026-11-24T06:00:00.000Z',
  };

  const prefs: AlertPreferences = {
    pushEnabled: true,
    severeStorms: true,
    highHumidityThreshold: 80,
    highHeatThresholdC: 36,
    highWindThresholdKmh: 40,
  };

  const alerts = evaluateSevereAlerts(current, [], prefs);
  assert.equal(alerts.length, 4);
  assert.ok(alerts.some((a) => a.title.includes('Storm')));
  assert.ok(alerts.some((a) => a.title.includes('Wind')));
  assert.ok(alerts.some((a) => a.title.includes('Heat')));
  assert.ok(alerts.some((a) => a.title.includes('Humidity')));

  const alertsF = evaluateSevereAlerts(current, [], prefs, 'f');
  assert.ok(alertsF.some((a) => a.metricLabel.includes('mph')));
  assert.ok(alertsF.some((a) => a.metricLabel.includes('°F')));
});
