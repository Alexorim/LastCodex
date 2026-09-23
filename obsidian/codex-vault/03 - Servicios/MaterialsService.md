---
title: "MaterialsService"
type: service
tags:
  - "#servicio"
  - "#forecast"
  - "#csv"
  - "#logica"
version: 1.3.0
created: 2026-09-23
---

# 📦 MaterialsService (`materials.service.ts`)

`MaterialsService` es el servicio responsable de la adquisición, parseo, caché y distribución reactiva de las predicciones de materiales de los gremios de *Orna*.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Módulo: [[Módulo Forecast de Gremios]]
- Vistas Consumidoras: [[HomePage - Forecast Hoy y Mañana]], [[CalendarPage - Calendario de Materiales]], [[SearchPage - Buscador de Materiales]]
- Servicio Hermano: [[TimerService]]
- Modelos: [[Modelo DayForecast y GuildStock]]
- Utilidades: [[Forecast Canvas]], [[Traducciones y Mapeo de Nombres]]

---

## 🌐 Endpoint y Estrategia de Caché

```typescript
private readonly FORECAST_URL = 
  'https://docs.google.com/spreadsheets/d/1gWTEeQnFlNePLTOLCbrzyMWljJjR01L84z2tpeaOAi8/export?format=csv&gid=1635134007';

private readonly CACHE_TODAY_KEY = 'orna_today_forecast';
private readonly CACHE_TOMORROW_KEY = 'orna_tomorrow_forecast';
private readonly CACHE_CATALOG_KEY = 'orna_materials_catalog';
private readonly LAST_UPDATED_KEY = 'orna_materials_last_updated';
```

---

## 🌊 Flujo de Datos y Reactividad

| Observable | Tipo | Propósito |
| :--- | :--- | :--- |
| `today$` | `Observable<DayForecast \| null>` | Emite los materiales y stocks del día en curso. |
| `tomorrow$` | `Observable<DayForecast \| null>` | Emite los materiales pronosticados para el día siguiente. |
| `catalog$` | `Observable<MaterialSearchResult[]>` | Emite el catálogo histórico y futuro agrupado por material para búsqueda. |

---

## ⚙️ Métodos y Lógica Principal

### 1. Actualización Automática e Intervalos (`constructor()`)
- Suscripción a un `interval(5 * 60 * 1000)` (cada 5 minutos) para descargar el CSV y mantener actualizados los stocks.
- Suscripción al observable `dayReset$` de [[TimerService]]:
  - Cuando se detecta el cruce de medianoche UTC, programa un `setTimeout` de 30 segundos y ejecuta `loadData()` para obtener los nuevos stocks en rotación.

### 2. Parseo Robusto de CSV (`parseCsvLine()`, `parseForecastCsv()`)
- El CSV exportado desde Google Sheets incluye celdas con comas internas, comillas dobles y retornos de carro.
- `parseCsvLine(line: string): string[]` implementa una máquina de estados básica para leer carácter por carácter, distinguiendo comas delimitadoras de comas contenidas entre comillas (`inQuotes`).
- Identifica columnas correspondientes a:
  - Fecha (*Date*)
  - Monument Guild
  - Circle of Anguish
  - Blades of Finesse
  - Spelunking Guild
- Normaliza nombres usando [[Traducciones y Mapeo de Nombres]].

### 3. Persistencia en `localStorage`
- Tras un parseo exitoso, guarda de inmediato los objetos serializados en `localStorage`, asegurando que al recargar la app no se dependa de la conexión a internet.

---

## 🔗 Sinapsis Relacionadas
- Ir al módulo de pronóstico: [[Módulo Forecast de Gremios]]
- Ver servicio de temporizadores: [[TimerService]]
- Ver vista principal: [[HomePage - Forecast Hoy y Mañana]]
