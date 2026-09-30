---
title: "Versiones y Changelog"
type: general
tags:
  - "#versiones"
  - "#changelog"
  - "#lastresources"
  - "#lastcodex"
version: 1.4.5
created: 2026-09-23
updated: 2026-09-29
---

# 🏷️ Versiones y Changelog del Proyecto

Estado actual del proyecto: **Versión 1.4.5 (Producción)**

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Registro Histórico Detallado: [[00 - Registro de Actualizaciones (Changelog Maestro)]]
- Hitos de Versión:
  - [[v1.4.5 - Rebranding LastResources, Torres Celestiales, Notificaciones Push y Blindaje Legal]] (Actual)
  - [[v1.4.4 - Visor de Mapa Interactivo y Comprobador de Actualizaciones Remoto]]
  - [[v1.4.3 - Nombre Estable APK, Glassmorphism Sakura y Soporte Notch]]
  - [[v1.4.2 - Tema Sakura, Footer Compacto y Auto-ocultación de Barra]]
  - [[v1.4.1 - Efecto Glassmorphism en Sprite Codex, Paleta Café y Corrección Tema Claro]]
  - [[v1.4.0 - Tema Claro, 22 Idiomas, Ajuste de Grilla Codex y Limpieza de Barra]]
  - [[v1.3.1 - Paginación Numérica y Modo Cuadrícula en Códice]]
  - [[v1.3.0 - Renacimiento LastCodex, Subcategorías y APK Versionada]]
  - [[v1.2.0 - Códice Masivo Offline (5065 ítems) y Sincronización]]
  - [[v1.1.0 - Clases, Eventos, Canvas Offline y Soporte Android]]
  - [[v1.0.0 - Lanzamiento Inicial Orna Guild Forecast y Multiplataforma]]
- Plantilla de Registro: [[Plantilla de Nueva Versión]]
- Visión General: [[01 - Visión General y Propósito]]
- Compilador de Versiones: [[Script Build APK]]
- Plataformas Afectadas: [[Plataforma Android y Capacitor]], [[Plataforma Desktop y Electron]], [[Plataforma Web y PWA]]

---

## 📐 Regla Oficial de Incremento de Versiones
> [!IMPORTANT] Política de Versionado Semántico
> - **Cambios Menores (Ajustes, correcciones, mejoras puntuales)**: Sube el **tercer dígito** (PATCH) — Ejemplo: `1.4.1` ➔ `1.4.2`.
> - **Cambios Notables (Nuevas implementaciones, módulos o rediseño)**: Sube el **segundo dígito** (MINOR) — Ejemplo: `1.4.0` ➔ `1.4.5`.

---

## 📦 Identificadores de Versión Actual

| Parámetro | Valor Actual | Archivo de Configuración |
| :--- | :--- | :--- |
| **App Name** | `LastResources` | `package.json`, `capacitor.config.ts` |
| **App Version** | `1.4.5` (`v1.4.5`) | `package.json` |
| **Android Version Code** | `10` | `android/app/build.gradle` |
| **Android Version Name** | `1.4.5` | `android/app/build.gradle` |
| **APK Binario Canónico** | `lastcodex_stable.apk` | `release/`, `src/assets/`, `www/assets/` |
| **IndexedDB Version** | `3` (`lastcodex_offline_db`) | `src/app/services/codex.service.ts` |
| **App ID (Capacitor)** | `com.lastresources.app` | `capacitor.config.ts` |
| **App ID (Android)** | `com.lastresources.app` | `android/app/build.gradle` |
| **App ID (Electron)** | `com.lastresources.app` | `package.json` |

---

## 📜 Historial Sintético de Versiones Recientes

### 🚀 Versión 1.4.5 (Actual)
*Septiembre 2026*
- Rebranding oficial a **LastResources** y migración de identificador a `com.lastresources.app`.
- Incorporación del **Módulo de Torres Celestiales** con cronograma de crecimiento de pisos (*Floor Growth*) y botón "Ver en Códice".
- Sistema de **Notificaciones Nativas** para materiales y aviso de Torres al Piso 50 con plantillas exactas en barra de estado de Android.
- Página formal de **Aviso Legal, DMCA y Privacidad** (`/legal`), cláusula Safe Harbor y reconocimiento de marcas de Northern Forge.
- Filtro por defecto en el mapa interactivo configurado para activar únicamente ciudades.
- Sincronización del reseteo diario a las 05:00 UTC (12:00 AM Midnight UTC-5).

### 🗺️ Versión 1.4.4
*Septiembre 2026*
- Integración del **Visor de Mapa Interactivo** (`MapPage`) con capas de marcadores para ciudades, mazmorras y santuarios.
- Reemplazo del descargador estático por un **Comprobador de Actualizaciones Remoto** con detección de versiones en vivo.

### 📱 Versión 1.4.3
*Septiembre 2026*
- Estandarización de compilación con distribución de APK canónica `lastcodex_stable.apk`.
- Soporte para áreas seguras móviles y notch (`safe-area-inset`).
- Modal de material con estilo Sakura Glassmorphism y alternador de cuadrícula/lista en Códice.

### 🌸 Versión 1.4.2
*Septiembre 2026*
- Introducción del nuevo tema visual **Sakura** (`theme-sakura`).
- Auto-ocultación de la barra de navegación inferior (`BNB`) al hacer scroll hacia el pie de página.
- Paleta optimizada para el selector modal de 22 idiomas.

---

## 🔗 Sinapsis Relacionadas
- Volver al MOC: [[00 - Nodo Central (MOC) - LastCodex]]
- Ver changelog maestro: [[00 - Registro de Actualizaciones (Changelog Maestro)]]
- Ver compilador: [[Script Build APK]]
