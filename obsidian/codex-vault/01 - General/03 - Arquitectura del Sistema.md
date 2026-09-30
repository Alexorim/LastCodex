---
title: "Arquitectura del Sistema"
type: architecture
tags:
  - "#arquitectura"
  - "#sistema"
  - "#diseno"
  - "#lastresources"
version: 1.4.5
created: 2026-09-23
updated: 2026-09-29
---

# 🏗️ Arquitectura del Sistema

La arquitectura de **LastResources** está diseñada bajo los principios de **Componentes Standalone de Angular**, **Programación Reactiva con RxJS**, y una estrategia radical de **Offline-First** que asegura la operatividad de la aplicación incluso sin conexión a internet.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Tecnologías: [[04 - Stack Tecnológico]]
- Capa de Lógica: [[NotificationsService]], [[TowersService]], [[CodexService]], [[MaterialsService]], [[TimerService]], [[SettingsService]]
- Capa Visual: [[HomePage - Forecast Hoy y Mañana]], [[TowersPage - Torres Celestiales]], [[CalendarPage - Calendario de Materiales]], [[MapPage - Mapa Interactivo]], [[CodexPage - Explorador del Códice]], [[LegalPage - Aviso Legal y Privacidad]], [[SettingsPage - Configuración]]

---

## 🏛️ Diagrama de Arquitectura Multicapa

```
+-----------------------------------------------------------------------------------------+
|                               CAPA DE PRESENTACIÓN (UI)                                 |
|         Angular 22 Standalone Components + Ionic 9 Mobile & Desktop Layouts             |
|                                                                                         |
| [Home]  [Towers]  [Calendar]  [Map]  [Search]  [Codex]  [Classes]  [Legal]  [Settings]  |
+--------------------------------------------┬--------------------------------------------+
                                             │ Inyección de Dependencias
                                             ▼
+-----------------------------------------------------------------------------------------+
|                               CAPA DE SERVICIOS (LÓGICA)                                |
|                                                                                         |
| [[NotificationsService]] [[TowersService]] [[MaterialsService]] [[CodexService]] [...]  |
|  (Capacitor Local Notif)  (Floor Timeline)  (RxJS Google CSV)   (IndexedDB v3)          |
+--------------------┬───────────────────────┬──────────────────────────┬-----------------+
                     │                       │                          │
                     ▼                       ▼                          ▼
+--------------------------+ +-------------------------------+ +--------------------------+
|      ALMACENAMIENTO      | |        RED & SYNC             | |   HARDWARE & DISPOSITIVO   |
|  - IndexedDB (v3)        | | - Google Sheets CSV           | | - @capacitor/local-notif   |
|  - LocalStorage          | | - Vercel Version Endpoint     | | - Haptics / Hardware Back  |
|  - Bundled JSONs         | | - PlayOrna Scrapers           | | - Safe Area / Notch Support|
|  - Obsidian Export (ZIP) | | - Leaflet Tile Cartography    | | - Electron Desktop Runner  |
+--------------------------+ +-------------------------------+ +--------------------------+
```

---

## 🔄 Flujo Reactivo de Datos (Unidirectional Data Flow)

1. **Ciclo de Inicialización**:
   - Al arrancar la aplicación, los servicios inyectados en la raíz (`providedIn: 'root'`) leen simultáneamente los datos cacheados en **LocalStorage** e **IndexedDB** (`loadFromCache()`).
   - Esto permite que la interfaz se dibuje de forma instantánea sin mostrar pantallas de carga en blanco.
2. **Sincronización en Segundo Plano**:
   - [[MaterialsService]] consulta el endpoint CSV de Google Sheets en segundo plano. Si detecta variaciones respecto a la caché, emite un nuevo valor en los observables reactivos.
   - [[CodexService]] mantiene un observable de entradas (`entries$`) con más de 5,000 entidades precargadas. Si el usuario solicita sincronización web, actualiza la base IndexedDB e incrementa los contadores reactivamente.
   - [[TowersService]] computa periódicamente la progresión de las 5 torres celestiales y emite proyecciones al piso 50.
3. **Despacho de Alertas Nativas**:
   - [[NotificationsService]] canaliza recordatorios hacia la bandeja del sistema Android (`NotificationManager`) vía Capacitor, garantizando que el usuario reciba alertas incluso con la app cerrada.
4. **Verificación de Versión sin Falsos Positivos**:
   - El cliente móvil consulta directamente el endpoint en vivo en Vercel para comparar la versión instalada contra el repositorio de producción, eliminando banners falsos de desactualización en la web.

---

## 🔗 Sinapsis Relacionadas
- Ver servicios: [[NotificationsService]], [[TowersService]], [[CodexService]], [[MaterialsService]]
- Ver vistas: [[TowersPage - Torres Celestiales]], [[MapPage - Mapa Interactivo]], [[LegalPage - Aviso Legal y Privacidad]]
