---
title: "SettingsPage - Configuración"
type: page
tags:
  - "#pagina"
  - "#vista"
  - "#configuracion"
  - "#sistema"
version: 1.3.0
created: 2026-09-23
---

# ⚙️ SettingsPage — Configuración (`settings.page.ts`)

`SettingsPage` es el centro de control de preferencias del usuario, gestión de base de datos offline, verificación de versiones e instalación de actualizaciones.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Módulo: [[Módulo Configuración y Sistema]]
- Servicios Inyectados: [[SettingsService]], [[TimerService]], [[CodexService]]
- Automatización y Versiones: [[02 - Versiones y Changelog]], [[Script Build APK]], [[Plataforma Android y Capacitor]]

---

## 🛠️ Opciones y Paneles Disponibles

1. **Selector de Idioma**:
   - Selector entre **Español (`es`)** e **Inglés (`en`)**. Actualiza dinámicamente toda la aplicación a través de [[SettingsService]].
2. **Tema de la Aplicación**:
   - Selección entre temas visuales (predeterminado: *Codex Dark*).
3. **Zona Horaria y Reseteo Local**:
   - Muestra la zona horaria del sistema (`Intl.DateTimeFormat`) y calcula automáticamente a qué hora local ocurren las 00:00 UTC (ej: `19:00:00 GMT-5`).
4. **Estado de la Base de Datos Offline (IndexedDB)**:
   - Contador de entradas totales en `lastcodex_offline_db` (más de 3,000 ítems).
   - Fecha de última sincronización.
   - Botón para **Comprobar Actualizaciones**: Compara el conteo local con el servidor de PlayOrna.
   - Botón de **Sincronización Completa**: Descarga incremental con barra de porcentaje interactiva.
   - Botón de **Restaurar Valores Predeterminados**: Purgado seguro de IndexedDB y restauración del bundle base.
5. **Descarga Directa de APK (Android)**:
   - Botón destacado: **"Descargar APK v1.3.0"** (`lastcodex_1.3.0.apk`).
   - Apunta directamente al repositorio oficial en GitHub.

---

## 🔗 Sinapsis Relacionadas
- Ver servicio de configuración: [[SettingsService]]
- Ver servicio del códice: [[CodexService]]
- Ver historial de versiones: [[02 - Versiones y Changelog]]
- Ver compilación de APK: [[Script Build APK]]
