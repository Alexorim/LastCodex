---
title: "Nodo Central (MOC) - LastCodex"
type: hub
tags:
  - "#hub"
  - "#core"
  - "#lastcodex"
version: 1.4.0
created: 2026-09-23
---

# 🧠 Nodo Central (MOC) — LastCodex / OrnaForecast

Bienvenido al núcleo de la **red neuronal de conocimiento** de **LastCodex** (también conocido como *OrnaForecast* o *Orna Guild Material Forecast*). Este espacio modela la arquitectura completa, funcionalidades, servicios, modelos de datos, plataformas y scripts de automatización del proyecto mediante enlaces bidireccionales (`synapses`).

```
                              [00 - Nodo Central (MOC)]
                                         │
        ┌───────────────┬────────────────┼────────────────┬───────────────┐
        ▼               ▼                ▼                ▼               ▼
 ┌─────────────┐ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ ┌─────────────┐
 │ 01-General  │ │ 02-Módulos  │  │03-Servicios │  │ 04-Páginas  │ │06-Plataforma│
 └─────────────┘ └─────────────┘  └─────────────┘  └─────────────┘ └─────────────┘
```

---

## 🧭 Sinapsis Principales (Mapa de Navegación)

### 📌 1. Visión & Arquitectura General
- [[01 - Visión General y Propósito]]: Fundamentos del proyecto, problemática que resuelve y público objetivo.
- [[02 - Versiones y Changelog]]: Control de versiones, estado actual (`v1.3.0`) e historial de lanzamientos.
- [[03 - Arquitectura del Sistema]]: Arquitectura reactiva, flujo de datos unidireccional y filosofía *offline-first*.
- [[04 - Stack Tecnológico]]: Angular 22, Ionic 9, Capacitor 8, Electron 44, TypeScript, SCSS y Python.

### 🧩 2. Módulos Funcionales
- [[Módulo Forecast de Gremios]]: Predicción y calendario de materiales de gremio (*Blades of Finesse*, *Monument*, *Anguish*, *Spelunking*).
- [[Módulo Códice de Orna]]: Base de datos offline de más de 3000 ítems, monstruos, jefes, hechizos y habilidades.
- [[Módulo Rastreador de Eventos]]: Monitorización de eventos mensuales y jefes limitados en tiempo real.
- [[Módulo Configuración y Sistema]]: Personalización de idiomas (ES/EN), temas visuales, IndexedDB y diagnóstico.

### ⚙️ 3. Capa de Servicios (Lógica & Datos)
- [[CodexService]]: Motor del Códice, persistencia en IndexedDB (`lastcodex_offline_db` v3), observables reactivos y sincronización web.
- [[MaterialsService]]: Ingesta y parseo reactivo del CSV de pronóstico de Google Sheets con caché en LocalStorage.
- [[TimerService]]: Control de temporizadores para el reseteo UTC medianoche y cálculo de *stale window*.
- [[SettingsService]]: Orquestador de preferencias de usuario, internacionalización y cálculo de zona horaria local.
- [[BackButtonService]]: Gestión de navegación por hardware y botón de retroceso en Android nativo.

### 📱 4. Capa de Presentación (Páginas & Vistas)
- [[HomePage - Forecast Hoy y Mañana]]: Pantalla principal con stocks diarios, cuenta atrás y generador de infografías.
- [[CalendarPage - Calendario de Materiales]]: Matriz de calendario interactiva con los materiales pronosticados por día.
- [[SearchPage - Buscador de Materiales]]: Buscador con historial de rotaciones y predicción de próximas apariciones.
- [[CodexPage - Explorador del Códice]]: Explorador con filtros por Tier (T1-T11), subcategorías dinámicas y búsqueda rápida.
- [[CodexClassesPage - Clases y Habilidades]]: Vista detallada de clases del juego, pasivas y hechizos aprendidos.
- [[EventsPage - Eventos en Vivo]]: Listado y desglose de eventos activos, calendarios y recompensas.
- [[SettingsPage - Configuración]]: Panel de ajustes, actualización del códice y descarga directa de la APK compilada.

### 🧱 5. Modelos de Datos
- [[Modelo CodexEntry]]: Estructura tipada para ítems, criaturas, hechizos, drops y materiales de mejora.
- [[Modelo DayForecast y GuildStock]]: Contratos de datos para el stock de gremios y resultados de búsqueda.
- [[Modelo Event]]: Estructura para eventos activos y temporales.

### 🚀 6. Plataformas & Despliegue
- [[Plataforma Android y Capacitor]]: Integración móvil nativa mediante Capacitor 8.5 y generación de APKs de producción.
- [[Plataforma Desktop y Electron]]: Empaquetado de escritorio Windows portable y directorio mediante Electron Builder.
- [[Plataforma Web y PWA]]: Configuración de despliegue en Vercel y arquitectura PWA.

### 🛠️ 7. Herramientas & Automatización
- [[Script Build APK]]: Pipeline automatizado en Node.js para compilar, versionar y empaquetar APKs.
- [[Script Generador de Íconos]]: Utilidad en Python para generación masiva de mipmaps e íconos adaptativos.
- [[Script Scraper del Codex]]: Scripts de extracción, enriquecimiento y descarga de sprites desde PlayOrna Codex.

### 🎨 8. Utilidades & Helpers
- [[Forecast Canvas]]: Renderizado dinámico HTML5 Canvas / `html-to-image` para exportar y compartir pronósticos en Discord/WhatsApp.
- [[Traducciones y Mapeo de Nombres]]: Normalización y traducción bilingüe de terminología de Orna (EN <-> ES).
- [[Iconos y Sprites]]: Mapeo de identificadores de gremios, sprites de materiales e íconos vectoriales.

### 📜 9. Registro de Actualizaciones & Changelog
- [[00 - Registro de Actualizaciones (Changelog Maestro)]]: Índice histórico completo de versiones.
  - [[v1.4.0 - Tema Claro, 22 Idiomas, Ajuste de Grilla Codex y Limpieza de Barra]]: Versión activa en producción (Tema Claro, 22 Idiomas, Grilla corregida y Limpieza de Barra).
  - [[v1.3.1 - Paginación Numérica y Modo Cuadrícula en Códice]]: Paginación numérica y vista cuadrícula inicial.
  - [[v1.3.0 - Renacimiento LastCodex, Subcategorías y APK Versionada]]: Rebranding, subcategorías y APK versionada.
  - [[v1.2.0 - Códice Masivo Offline (5065 ítems) y Sincronización]]: Integración de base de datos masiva IndexedDB.
  - [[v1.1.0 - Clases, Eventos, Canvas Offline y Soporte Android]]: Clases, eventos y generación canvas offline.
  - [[v1.0.0 - Lanzamiento Inicial Orna Guild Forecast y Multiplataforma]]: Nacimiento de la app y soporte multiplataforma.
- [[Plantilla de Nueva Versión]]: Protocolo estándar para documentar futuras versiones en Obsidian.

---
> [!TIP] Vista de Grafo en Obsidian
> Presiona `Ctrl + G` dentro de Obsidian para abrir la **Vista de Grafo** y observar la red neuronal completa en funcionamiento.
