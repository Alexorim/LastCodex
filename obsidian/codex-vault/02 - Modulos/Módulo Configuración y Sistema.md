---
title: "Módulo Configuración y Sistema"
type: module
tags:
  - "#modulo"
  - "#sistema"
  - "#configuracion"
version: 1.3.0
created: 2026-09-23
---

# ⚙️ Módulo Configuración y Sistema

El **Módulo Configuración y Sistema** centraliza las preferencias de usuario, la gestión del almacenamiento local, las comprobaciones de versiones y el control del ciclo de vida de la aplicación.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Servicio Central: [[SettingsService]]
- Vista Principal: [[SettingsPage - Configuración]]
- Integración Móvil: [[BackButtonService]], [[Plataforma Android y Capacitor]]
- Versiones: [[02 - Versiones y Changelog]], [[Script Build APK]]

---

## 🛠️ Capacidades del Módulo

### 1. Internacionalización Dinámica (i18n)
- Gestión de idiomas: **Español (`es`)** e **Inglés (`en`)**.
- Persistencia inmediata en `localStorage` mediante [[SettingsService]].
- Adaptación reactiva sin necesidad de reiniciar la app.

### 2. Gestión de Temas Visuales
- Implementación del tema temático **Codex Dark** (paleta de colores oscuros con acentos ámbar/dorados y bordes sutiles para emular pergaminos arcanos).
- Optimización de contraste para pantallas OLED y reducción del consumo de batería en dispositivos móviles.

### 3. Diagnóstico y Control de Almacenamiento Local
- Monitorización del número total de entradas almacenadas en **IndexedDB** (`lastcodex_offline_db`).
- Fecha y hora del último sync con los servidores del Códice.
- Herramienta de purga y reinicio de base de datos offline en caso de inconsistencias.

### 4. Sistema de Comprobación y Actualización de Códice
- Consulta web a la API comunitaria para detectar si se agregaron nuevos monstruos o ítems en parches del juego.
- Ejecución de sincronización progresiva con reporte de estado porcentual en tiempo real.

### 5. Distribución de Versiones y Descarga de APK
- Detección de la versión instalada (`v1.3.0`).
- Generación de enlace dinámico de descarga directa del binario APK alojado en GitHub:
  `https://github.com/Alexorim/LastCodex/raw/main/src/assets/lastcodex_1.3.0.apk`

---

## 🔗 Sinapsis Relacionadas
- Ver servicio de opciones: [[SettingsService]]
- Ver interfaz de configuración: [[SettingsPage - Configuración]]
- Ver servicio de persistencia del códice: [[CodexService]]
- Ver detalles de la versión actual: [[02 - Versiones y Changelog]]
