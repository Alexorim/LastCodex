---
title: "Nodo Central (MOC) - LastCodex"
type: hub
tags:
  - "#hub"
  - "#core"
  - "#lastcodex"
version: 1.4.6
created: 2026-09-23
---

# 🧠 Nodo Central (MOC) — LastCodex / LastResources

Bienvenido al núcleo de la **red neuronal de conocimiento** de **LastResources** (anteriormente conocido como *LastCodex* / *OrnaForecast*). Este espacio modela la arquitectura completa, funcionalidades, servicios, modelos de datos, plataformas y scripts de automatización del proyecto mediante enlaces bidireccionales (`synapses`).

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
- [[02 - Versiones y Changelog]]: Control de versiones, estado actual (`v1.4.6`) e historial de lanzamientos.
- [[03 - Arquitectura del Sistema]]: Arquitectura reactiva, flujo de datos unidireccional y filosofía *offline-first*.
- [[04 - Stack Tecnológico]]: Angular 22, Ionic 9, Capacitor 8, Electron 44, TypeScript, SCSS y Python.

### 🧩 2. Módulos Funcionales
- [[Módulo Forecast de Gremios]]: Predicción y calendario de materiales de gremio (*Blades of Finesse*, *Monument*, *Anguish*, *Spelunking*).
- [[Módulo Calculadora de Pruebas de Gremios]]: Calculadora matemática oficial de costes y canje de materiales por pruebas de gremios.
- [[Módulo Torres Celestiales]]: Seguimiento de las 5 Torres Celestiales, proyección de pisos futuros (Floor Growth) y alertas al piso 50.
- [[Módulo Códice de Orna]]: Base de datos offline de más de 5,000 ítems, monstruos, jefes, hechizos y habilidades.
- [[Módulo Mapa Interactivo de Ciudades y Marcadores]]: Cartografía interactiva con filtros inteligentes (ciudades por defecto) y zoom escalable.
- [[Módulo Notificaciones del Sistema]]: Alertas locales integradas con la barra de notificaciones de Android para materiales y torres.
- [[Módulo Legal y Cumplimiento DMCA]]: Declaración sin fines de lucro, marcas registradas, política de cero datos y canal DMCA.
- [[Módulo Rastreador de Eventos]]: Monitorización de eventos mensuales y jefes limitados en tiempo real.
- [[Módulo Configuración y Sistema]]: Personalización de 22 idiomas, temas visuales (Dark, Light, Sakura, Café), comprobador de versiones y exportador de Obsidian.

### ⚙️ 3. Capa de Servicios (Lógica & Datos)
- [[ProofsService]]: Algoritmos oficiales de conversión y cálculo de pruebas y materiales de gremios.
- [[TowersService]]: Modelo matemático y cronograma proyectado de pisos de torres celestiales.
- [[NotificationsService]]: Orquestador de notificaciones locales nativas con Capacitor y plantillas de alertas personalizadas.
- [[CodexService]]: Motor del Códice, persistencia en IndexedDB (`lastcodex_offline_db` v3), observables reactivos y sincronización web.
- [[MaterialsService]]: Ingesta y parseo reactivo del CSV de pronóstico de Google Sheets con caché en LocalStorage.
- [[TimerService]]: Control de temporizadores para el reseteo horario (05:00 UTC / medianoche UTC-5) y cálculo de *stale window*.
- [[SettingsService]]: Orquestador de preferencias de usuario, internacionalización y cálculo de zona horaria local.
- [[BackButtonService]]: Gestión de navegación por hardware y botón de retroceso en Android nativo.

### 📱 4. Capa de Presentación (Páginas & Vistas)
- [[HomePage - Forecast Hoy y Mañana]]: Pantalla principal con stocks diarios, cuenta atrás y generador de infografías.
- [[ProofsPage - Calculadora de Pruebas]]: Vista interactiva de conversión de pruebas optimizada para móviles (2 columnas).
- [[TowersPage - Torres Celestiales]]: Monitor de las 5 torres celestiales, modal de proyección de pisos y enlace directo al códice.
- [[CalendarPage - Calendario de Materiales]]: Matriz de calendario con programación de recordatorios directos a la barra de estado.
- [[MapPage - Mapa Interactivo]]: Visor cartográfico a pantalla completa con selector flotante de capas de marcadores.
- [[SearchPage - Buscador de Materiales]]: Buscador con historial de rotaciones y predicción de próximas apariciones.
- [[CodexPage - Explorador del Códice]]: Explorador con filtros por Tier (T1-T11), subcategorías dinámicas, vista de cuadrícula y búsqueda rápida.
- [[CodexClassesPage - Clases y Habilidades]]: Vista detallada de clases del juego, pasivas y hechizos aprendidos.
- [[EventsPage - Eventos en Vivo]]: Listado y desglose de eventos activos, calendarios y recompensas.
- [[LegalPage - Aviso Legal y Privacidad]]: Términos de uso, aviso legal, atribución de marcas a Northern Forge y canal DMCA.
- [[AssessPage - Evaluador de Objetos]]: Evaluador multi-objeto de calidad porcentual (Poor a Ornate) con persistencia offline.
- [[SettingsPage - Configuración]]: Panel de ajustes, verificación remota en vivo de versiones, exportador de baúl y descarga de APK.

### 🧱 5. Modelos de Datos
- [[Modelo CodexEntry]]: Estructura tipada para ítems, criaturas, hechizos, drops y materiales de mejora.
- [[Modelo DayForecast y GuildStock]]: Contratos de datos para el stock de gremios y resultados de búsqueda.
- [[Modelo Event]]: Estructura para eventos activos y temporales.

### 🚀 6. Plataformas & Despliegue
- [[Plataforma Android y Capacitor]]: Integración móvil nativa mediante Capacitor 8.5, `appId: com.lastresources.app` y notificaciones locales.
- [[Plataforma Desktop y Electron]]: Empaquetado de escritorio Windows portable y directorio mediante Electron Builder.
- [[Plataforma Web y PWA]]: Configuración de despliegue en Vercel, endpoints de versión y arquitectura PWA.

### 🛠️ 7. Herramientas & Automatización
- [[Script Build APK]]: Pipeline automatizado en Node.js para compilar, versionar y empaquetar APKs estables (`lastcodex_stable.apk`).
- [[Script Generador de Íconos]]: Utilidad en Python para generación masiva de mipmaps e íconos adaptativos.
- [[Script Scraper del Codex]]: Scripts de extracción, enriquecimiento y descarga de sprites desde PlayOrna Codex.

### 🎨 8. Utilidades & Helpers
- [[Forecast Canvas]]: Renderizado dinámico HTML5 Canvas / `html-to-image` para exportar y compartir pronósticos en Discord/WhatsApp.
- [[Traducciones y Mapeo de Nombres]]: Normalización y traducción bilingüe de terminología de Orna (EN <-> ES) y 22 idiomas.
- [[Iconos y Sprites]]: Mapeo de identificadores de gremios, sprites de materiales e íconos vectoriales.

### 📜 9. Registro de Actualizaciones & Changelog
- [[00 - Registro de Actualizaciones (Changelog Maestro)]]: Índice histórico completo de versiones.
  - [[v1.4.6 - Calculadora Oficial de Pruebas y Optimizaciones Móviles]]: Versión activa en producción (Calculadora de pruebas, 2 columnas móvil y header dinámico).
  - [[v1.4.5 - Rebranding LastResources, Torres Celestiales, Notificaciones Push y Blindaje Legal]]: Rebranding a LastResources, módulo de torres, notificaciones locales y legal DMCA.
  - [[v1.4.4 - Visor de Mapa Interactivo y Comprobador de Actualizaciones Remoto]]: Visor de mapa interactivo con filtro por defecto de ciudades y actualizador remoto.
  - [[v1.4.3 - Nombre Estable APK, Glassmorphism Sakura y Soporte Notch]]: Distribución de `lastcodex_stable.apk`, glassmorphism y compatibilidad con notch.
  - [[v1.4.2 - Tema Sakura, Footer Compacto y Auto-ocultación de Barra]]: Tema floral Sakura, pie compacto y auto-ocultación de BNB.
  - [[v1.4.1 - Efecto Glassmorphism en Sprite Codex, Paleta Café y Corrección Tema Claro]]: Glassmorphism en sprite, Paleta Café y Corrección Tema Claro.
  - [[v1.4.0 - Tema Claro, 22 Idiomas, Ajuste de Grilla Codex y Limpieza de Barra]]: Tema Claro, 22 Idiomas, Grilla corregida y Limpieza de Barra.
  - [[v1.3.1 - Paginación Numérica y Modo Cuadrícula en Códice]]: Paginación numérica y vista cuadrícula inicial.
  - [[v1.3.0 - Renacimiento LastCodex, Subcategorías y APK Versionada]]: Rebranding, subcategorías y APK versionada.
  - [[v1.2.0 - Códice Masivo Offline (5065 ítems) y Sincronización]]: Integración de base de datos masiva IndexedDB.
  - [[v1.1.0 - Clases, Eventos, Canvas Offline y Soporte Android]]: Clases, eventos y generación canvas offline.
  - [[v1.0.0 - Lanzamiento Inicial Orna Guild Forecast y Multiplataforma]]: Nacimiento de la app y soporte multiplataforma.
- [[Plantilla de Nueva Versión]]: Protocolo estándar para documentar futuras versiones en Obsidian.

---
> [!TIP] Vista de Grafo en Obsidian
> Presiona `Ctrl + G` dentro de Obsidian para abrir la **Vista de Grafo** y observar la red neuronal completa en funcionamiento.
