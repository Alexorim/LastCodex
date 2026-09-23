---
title: "Arquitectura del Sistema"
type: architecture
tags:
  - "#arquitectura"
  - "#sistema"
  - "#diseno"
version: 1.3.0
created: 2026-09-23
---

# 🏗️ Arquitectura del Sistema

La arquitectura de **LastCodex** está diseñada bajo los principios de **Componentes Standalone de Angular**, **Programación Reactiva con RxJS**, y una estrategia radical de **Offline-First** que asegura la usabilidad de la aplicación incluso sin conexión a internet.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Tecnologías: [[04 - Stack Tecnológico]]
- Capa de Lógica: [[CodexService]], [[MaterialsService]], [[TimerService]], [[SettingsService]]
- Capa Visual: [[HomePage - Forecast Hoy y Mañana]], [[CodexPage - Explorador del Códice]], [[SettingsPage - Configuración]]

---

## 🏛️ Diagrama de Arquitectura Multicapa

```
+-----------------------------------------------------------------------+
|                       CAPA DE PRESENTACIÓN (UI)                       |
|   Angular 22 Standalone Components + Ionic 9 Mobile & Web Layouts    |
|                                                                       |
| [HomePage]  [CalendarPage]  [SearchPage]  [CodexPage]  [SettingsPage] |
+-----------------------------------┬-----------------------------------+
                                    │ Inyección de Dependencias
                                    ▼
+-----------------------------------------------------------------------+
|                    CAPA DE SERVICIOS (LÓGICA)                        |
|                                                                       |
|  [[MaterialsService]]   [[CodexService]]   [[TimerService]]   [...]  |
|   (RxJS Observables)     (IndexedDB Sync)   (UTC Midnight)            |
+-----------------┬─────────────────┬───────────────────┬---------------+
                  │                 │                   │
                  ▼                 ▼                   ▼
+-----------------------+ +-------------------+ +-----------------------+
|     ALMACENAMIENTO    | |   RED & SCRAPING  | | HARDWARE / DISPOSITIVO|
|  - IndexedDB (v3)     | | - Google Sheets   | | - Capacitor Plugins   |
|  - LocalStorage       | | - PlayOrna Codex  | | - Haptics / BackBtn   |
|  - Bundled JSONs      | | - Vercel / GitHub | | - Electron IPC / Win  |
+-----------------------+ +-------------------+ +-----------------------+
```

---

## 🔄 Flujo Reactivo de Datos (Unidirectional Data Flow)

1. **Ciclo de Inicialización**:
   - Al arrancar la aplicación, los servicios inyectados en la raíz (`providedIn: 'root'`) leen simultáneamente los datos cacheados en **LocalStorage** e **IndexedDB** (`loadFromCache()`).
   - Esto permite que la interfaz se dibuje de forma instantánea sin mostrar pantallas de carga en blanco.
2. **Sincronización en Segundo Plano**:
   - [[MaterialsService]] consulta el endpoint CSV de Google Sheets en segundo plano. Si detecta variaciones respecto a la caché, emite un nuevo valor en `todaySubject` y `tomorrowSubject`.
   - [[CodexService]] mantiene un observable de entradas (`entries$`) con las más de 3,000 entidades precargadas de `codex-items.json`. Si el usuario solicita sincronización web, actualiza la base IndexedDB e incrementa los contadores reactivamente.
3. **Temporización y Eventos de Medianoche**:
   - [[TimerService]] emite a través de `dayReset$` en el instante exacto en que el reloj UTC llega a las 00:00:00.
   - [[MaterialsService]] se suscribe a este evento y programa una actualización automática tras un delay de 30 segundos para recuperar el nuevo stock rotado.

---

## 💾 Estrategia de Almacenamiento Multinivel

| Nivel | Mecanismo | Datos Almacenados | Tiempo de Acceso |
| :--- | :--- | :--- | :--- |
| **L1 (Memoria)** | `BehaviorSubject<T>` en servicios | Estados activos, filtros, búsquedas y contadores | Inmediato (~0ms) |
| **L2 (Local)** | `localStorage` | Forecast de hoy, mañana, catálogo resumido, idioma, tema | < 5ms |
| **L3 (Estructurado)** | `IndexedDB` (`lastcodex_offline_db`) | Más de 3,000 entradas completas del Códice, relaciones de drops, sprites | < 30ms |
| **L4 (Estático empaquetado)** | Assets JSON (`codex-items.json`) | Backup base incorporado en el bundle para primera apertura | Compilado |

---

## 🛡️ Principio de Robustez y Fallbacks

- **Sin Internet**: La aplicación arranca y opera al 100% de sus funciones de consulta con los datos empaquetados en IndexedDB y caché.
- **Hoja de cálculo inaccesible**: Si la API de Google Sheets falla o tiene rate-limiting, la app recurre silenciosamente al último forecast válido guardado en LocalStorage.
- **Mapeo Seguro de Tipos**: Las interfaces tipadas en [[Modelo CodexEntry]] y [[Modelo DayForecast y GuildStock]] previenen errores de renderizado ante campos nulos.

---

## 🔗 Sinapsis Relacionadas
- Explorar tecnologías: [[04 - Stack Tecnológico]]
- Profundizar en el servicio del Códice: [[CodexService]]
- Profundizar en el servicio de Materiales: [[MaterialsService]]
