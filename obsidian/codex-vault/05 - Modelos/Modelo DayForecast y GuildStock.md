---
title: "Modelo DayForecast y GuildStock"
type: model
tags:
  - "#modelo"
  - "#typescript"
  - "#datos"
  - "#forecast"
version: 1.3.0
created: 2026-09-23
---

# 📊 Modelo DayForecast y GuildStock (`material.model.ts`)

Estas interfaces definen las estructuras de datos empleadas para modelar las predicciones diarias de rotación de las tiendas de gremios en *Orna*.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Servicio Consumidor: [[MaterialsService]]
- Vistas Relacionadas: [[HomePage - Forecast Hoy y Mañana]], [[SearchPage - Buscador de Materiales]], [[CalendarPage - Calendario de Materiales]]
- Módulo: [[Módulo Forecast de Gremios]]

---

## 📐 Definición de Tipos TypeScript

```typescript
export interface GuildStock {
  guildId: string;               // 'monument' | 'anguish' | 'finesse' | 'spelunking'
  guildName: string;             // Nombre traducido del gremio
  materials: DayMaterials[];     // Lista de materiales ofrecidos
}

export interface DayMaterials {
  id: string;
  name: string;                  // Nombre en idioma original/normalizado
  nameEs?: string;               // Traducción en español
  icon?: string;                 // Ruta al sprite
  rarity?: string;
  quantity?: number;
}

export interface DayForecast {
  date: string;                  // Fecha ISO (YYYY-MM-DD)
  dayOfWeek: string;             // 'Lunes', 'Martes', etc.
  stocks: GuildStock[];          // Stocks por cada gremio
}

export interface MaterialSearchResult {
  materialName: string;
  materialNameEs: string;
  icon: string;
  pastAppearances: string[];     // Fechas anteriores
  futureAppearances: string[];   // Próximas fechas pronosticadas
  guilds: string[];              // Gremios donde aparece
}
```

---

## 🔗 Sinapsis Relacionadas
- Ver servicio de materiales: [[MaterialsService]]
- Ver pantalla principal de pronóstico: [[HomePage - Forecast Hoy y Mañana]]
- Ver buscador: [[SearchPage - Buscador de Materiales]]
