---
title: "Visión General y Propósito"
type: general
tags:
  - "#concepto"
  - "#general"
  - "#lastresources"
  - "#lastcodex"
version: 1.4.5
created: 2026-09-23
updated: 2026-09-29
---

# 🌐 Visión General y Propósito del Proyecto

**LastResources** (conocido históricamente en versiones anteriores como **LastCodex** y **OrnaForecast**) es una suite integral de herramientas de código abierto y utilidades comunitarias para jugadores de los títulos RPG de Northern Forge Studios: **Orna: The GPS RPG** y **Hero of Aethric**.

Conexión en la red:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Arquitectura: [[03 - Arquitectura del Sistema]]
- Módulos Principales: 
  - [[Módulo Forecast de Gremios]]
  - [[Módulo Torres Celestiales]]
  - [[Módulo Códice de Orna]]
  - [[Módulo Mapa Interactivo de Ciudades y Marcadores]]
  - [[Módulo Notificaciones del Sistema]]
  - [[Módulo Legal y Cumplimiento DMCA]]
  - [[Módulo Rastreador de Eventos]]
- Plataformas: [[Plataforma Android y Capacitor]], [[Plataforma Desktop y Electron]], [[Plataforma Web y PWA]]

---

## 🎯 Problemas que Resuelve

1. **Rotación Impredecible de Materiales de Gremios**:
   - En *Orna*, los gremios rotan periódicamente sus tiendas.
   - Jugadores avanzados necesitan planificar con semanas de antelación cuándo invertir sus pruebas en materiales exóticos (*Ortanite*, *Pure Runestone*, *Cursed Ortanite*, etc.).
   - **Solución de LastResources**: El [[Módulo Forecast de Gremios]] ofrece predicción precisa diaria y mensual en [[HomePage - Forecast Hoy y Mañana]] y [[CalendarPage - Calendario de Materiales]], permitiendo además programar recordatorios que notifican al celular en el momento exacto de aparición.

2. **Seguimiento y Ascenso de Torres Celestiales**:
   - Coordinar el farmeo de pisos en las 5 Torres Celestiales (Selene, Prometeo, Eos, Oceanus, Themis) requiere saber con exactitud cuándo alcanzan el límite de 50 pisos.
   - **Solución de LastResources**: El [[Módulo Torres Celestiales]] proyecta la progresión de pisos por cada reseteo y emite alertas automáticas al móvil cuando una torre alcanza los 50 pisos.

3. **Cartografía y Ubicación en Aethric y Orna**:
   - Ubicar ciudades y puntos clave sin perderse en el mapa del juego.
   - **Solución de LastResources**: El [[Módulo Mapa Interactivo de Ciudades y Marcadores]] provee un visor cartográfico completo con zoom escalable y filtros por capas (activando solo ciudades por defecto para máxima fluidez).

4. **Códice Offline Sin Latencia**:
   - Consultar monstruos, hechizos, drops y equipo sin depender de cobertura o conexión móvil deficiente.
   - **Solución de LastResources**: El [[Módulo Códice de Orna]] almacena más de 5,000 registros en IndexedDB con soporte para 22 idiomas, filtros por subcategorías y acceso directo a titanes celestiales.

5. **Infografías y Comunicación Comunitaria**:
   - Mediante [[Forecast Canvas]], permite exportar resúmenes visuales para Discord y WhatsApp en un solo toque.

6. **Transparencia y Seguridad Legal**:
   - Declaración de proyecto comunitario de fans, sin ánimo de lucro, sin recopilación de datos privados, respetando las marcas de Northern Forge y con canal formal DMCA Safe Harbor mediante [[Módulo Legal y Cumplimiento DMCA]].

---

## 👥 Público Objetivo

- **Jugadores de Fin de Juego (T9, T10, T11 / Titanes Celestiales / Ascensión)**.
- **Líderes y Oficiales de Reino (Kingdoms)** que organizan eventos y farmeo colectivo.
- **Nuevos Jugadores (T1 a T8)** que consultan builds, clases y drops en [[CodexClassesPage - Clases y Habilidades]].

---

## 💎 Principios Clave de Diseño

| Principio | Implementación |
| :--- | :--- |
| **Offline-First** | Funcionalidad completa sin conexión gracias a IndexedDB y almacenamiento local. |
| **Zero-Latency Search** | Filtrado instantáneo en memoria de más de 5,000 entradas. |
| **Alertas Nativas** | Notificaciones en barra de estado de Android sin telemetría invasiva con [[NotificationsService]]. |
| **Multilingüe** | Soporte para 22 idiomas coordinado por [[SettingsService]]. |
| **Multiplataforma** | Un único código Angular/Capacitor desplegado en Web (Vercel), Android (APK) y Windows (Electron). |
