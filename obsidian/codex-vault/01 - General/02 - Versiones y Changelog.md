---
title: "Versiones y Changelog"
type: general
tags:
  - "#versiones"
  - "#changelog"
  - "#lastcodex"
version: 1.3.0
created: 2026-09-23
---

# 🏷️ Versiones y Changelog del Proyecto

Estado actual del proyecto: **Versión 1.3.0 (Producción)**

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Registro Histórico Detallado: [[00 - Registro de Actualizaciones (Changelog Maestro)]]
- Hitos de Versión:
  - [[v1.3.0 - Renacimiento LastCodex, Subcategorías y APK Versionada]] (Actual)
  - [[v1.2.0 - Códice Masivo Offline (5065 ítems) y Sincronización]]
  - [[v1.1.0 - Clases, Eventos, Canvas Offline y Soporte Android]]
  - [[v1.0.0 - Lanzamiento Inicial Orna Guild Forecast y Multiplataforma]]
- Plantilla de Registro: [[Plantilla de Nueva Versión]]
- Visión General: [[01 - Visión General y Propósito]]
- Compilador de Versiones: [[Script Build APK]]
- Plataformas Afectadas: [[Plataforma Android y Capacitor]], [[Plataforma Desktop y Electron]], [[Plataforma Web y PWA]]

---

## 📦 Identificadores de Versión Actual

| Parámetro | Valor Actual | Archivo de Configuración |
| :--- | :--- | :--- |
| **App Version** | `1.3.0` (`v1.3.0`) | `package.json` |
| **Android Version Code** | `10300` | `android/app/build.gradle` |
| **Android Version Name** | `1.3.0` | `android/app/build.gradle` |
| **APK Binario** | `lastcodex_1.3.0.apk` | `release/` y `src/assets/` |
| **IndexedDB Version** | `3` (`lastcodex_offline_db`) | `src/app/services/codex.service.ts` |
| **App ID (Capacitor)** | `com.orna.forecast` | `capacitor.config.ts` |
| **App ID (Electron)** | `com.lastresources.app` | `package.json` |

---

## 📜 Historial de Versiones (Changelog)

### 🚀 Versión 1.3.0 (Actual)
*Fecha de corte: Septiembre 2026*
- **Renombramiento & Branding Global**:
  - Transición definitiva de identidad hacia **LastCodex**.
  - Actualización del logotipo principal a un emblema con fondo transparente y runas refinadas.
  - Generación de nuevo set de íconos adaptativos y splash screens para Android e iOS mediante [[Script Generador de Íconos]].
- **Subcategorías Interactivas con Pills**:
  - Incorporación de una barra interactiva de *pills* / etiquetas en [[CodexPage - Explorador del Códice]] para filtrado granular instantáneo (ej: Armas -> Espada, Daga, Báculo, Arco, etc.).
  - Deducción automática de subcategorías a partir de atributos `itemType` y metadatos del códice vía `item_subcategories.json`.
- **Automatización de Build y Distribución de APK**:
  - Implementación del script [[Script Build APK]] (`scripts/build-apk.js`), que compila la APK en Gradle, sustituye versiones anteriores y la disponibiliza tanto en la carpeta `release/` como en los activos web (`src/assets/lastcodex_1.3.0.apk`).
  - Botón de descarga directa de APK con detección de versión en [[SettingsPage - Configuración]].
- **Correcciones Visuales & Canvas**:
  - Resolución del renderizado de sprites en el modal de materiales del pronóstico en [[HomePage - Forecast Hoy y Mañana]].
  - Limpieza de imágenes generadas por [[Forecast Canvas]], suprimiendo mensajes por defecto no deseados al exportar a redes sociales o Discord.

---

### 🌟 Versión 1.2.0
- **Base de Datos Offline para el Códice**:
  - Migración a IndexedDB con capacidad para albergar más de 3,000 entradas de ítems, monstruos, jefes, raids, hechizos y habilidades.
  - Implementación de [[CodexService]] con soporte para observables reactivos y sincronización incremental.
- **Soporte Bilingüe Completo (ES / EN)**:
  - Sistema dinámico de traducción para nombres y descripciones de ítems y materiales mediante [[Traducciones y Mapeo de Nombres]].
- **Rastreador de Eventos**:
  - Creación de [[EventsPage - Eventos en Vivo]] para monitorizar eventos temporales y jefes rotativos.

---

### 📦 Versión 1.1.0
- **Integración con Capacitor 8**:
  - Despliegue en plataforma móvil Android con soporte para gestos táctiles, hápticos y control del botón físico de retroceso con [[BackButtonService]].
- **Exportación de Infografías**:
  - Integración de `html-to-image` para capturar la vista de pronóstico y generar imágenes PNG con estilos RPG personalizados.
- **Temporizador de Reset**:
  - Creación del [[TimerService]] sincronizado con el reseteo UTC a las 00:00, con cálculo de zona horaria local del dispositivo.

---

### 🐣 Versión 1.0.0
- **Lanzamiento Inicial (Orna Guild Forecast)**:
  - Consumo directo del Google Sheet de pronóstico de gremios mediante [[MaterialsService]].
  - Vistas básicas de hoy, mañana y calendario.
  - Empaquetado inicial para escritorio Windows con Electron 44.

---

## 🔗 Sinapsis Relacionadas
- Volver al MOC: [[00 - Nodo Central (MOC) - LastCodex]]
- Ver flujo de compilación: [[Script Build APK]]
- Ver interfaz de ajustes: [[SettingsPage - Configuración]]
