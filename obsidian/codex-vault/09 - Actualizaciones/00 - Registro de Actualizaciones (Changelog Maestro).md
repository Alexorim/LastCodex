---
title: "Registro de Actualizaciones (Changelog Maestro)"
type: update-hub
tags:
  - "#hub"
  - "#actualizacion"
  - "#changelog"
  - "#versiones"
version: 1.3.0
created: 2026-09-23
---

# 📜 Registro de Actualizaciones (Changelog Maestro)

Bienvenido al nodo central de **control evolutivo y versiones** de **LastCodex**. Este módulo documenta la historia completa de desarrollo, las transformaciones arquitectónicas, correcciones de errores y nuevas funcionalidades introducidas a lo largo de cada hito de versión.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Resumen General: [[02 - Versiones y Changelog]]
- Protocolo de Nuevas Versiones: [[Plantilla de Nueva Versión]]

```
                                [Changelog Maestro]
                                         │
        ┌────────────────┬───────────────┴───────────────┬────────────────┐
        ▼                ▼                               ▼                ▼
 ┌─────────────┐  ┌─────────────┐                 ┌─────────────┐  ┌─────────────┐
 │   v1.0.0    │  │   v1.1.0    │                 │   v1.2.0    │  │   v1.3.0    │
 │ (Fundación) │  │(Expansión)  │                 │ (OfflineDB) │  │  (Actual)   │
 └─────────────┘  └─────────────┘                 └─────────────┘  └─────────────┘
```

---

## 🧭 Hitos de Versión en la Red

| Versión | Nombre Clave | Estado | Fecha de Corte | Commits Clave |
| :--- | :--- | :--- | :--- | :--- |
| **[[v1.4.0 - Tema Claro, 22 Idiomas, Ajuste de Grilla Codex y Limpieza de Barra]]** | *Tema Claro & 22 Idiomas* | **Actual (Producción)** | Septiembre 2026 | `v1.4.0` |
| **[[v1.3.1 - Paginación Numérica y Modo Cuadrícula en Códice]]** | *Paginación & Vista Cuadrícula* | Precedente | Septiembre 2026 | `d1389bd` |
| **[[v1.3.0 - Renacimiento LastCodex, Subcategorías y APK Versionada]]** | *Branding & Subcategorías* | Precedente | Septiembre 2026 | `14039c3`, `dd3d54f`, `998984e`, `c2d471c` |
| **[[v1.2.0 - Códice Masivo Offline (5065 ítems) y Sincronización]]** | *Offline IndexedDB & Sync* | Precedente | Septiembre 2026 | `c041b4e`, `38d628a`, `82c28f0`, `41eded1` |
| **[[v1.1.0 - Clases, Eventos, Canvas Offline y Soporte Android]]** | *Expansión de Funcionalidades* | Precedente | Septiembre 2026 | `1d39d71`, `7e9b8d7`, `158f6bc`, `27e4d69` |
| **[[v1.0.0 - Lanzamiento Inicial Orna Guild Forecast y Multiplataforma]]** | *Génesis del Proyecto* | Fundación | Agosto 2026 | `6ea2411`, `1793c8a`, `417b2ab`, `fb28397` |

---

## 📐 Regla Oficial de Incremento de Versiones
- **Cambios Menores (Ajustes, correcciones, mejoras puntuales)**: Sube el **tercer dígito** (PATCH) — Ejemplo: `1.3.0` ➔ `1.3.1`.
- **Cambios Notables (Nuevas implementaciones, módulos o rediseño)**: Sube el **segundo dígito** (MINOR) — Ejemplo: `1.3.x` ➔ `1.4.0`.

---

## 📈 Resumen Rápido por Capas del Sistema

### 🎨 Capa Visual & Branding
- `v1.0.0`: Lanzamiento inicial con tema básico de forecast.
- `v1.0.x`: Migración a tema AMOLED Pure Black y diseño de navegación semicircular.
- `v1.1.0`: Vistas especializadas de progresión de clases (`codex-classes`) y calendario de eventos.
- `v1.2.0`: Diseño borderless de sprites, fichas con estadísticas detalladas y barras de progreso de sincronización.
- `v1.3.0`: Nuevo logotipo transparente de alta fidelidad, barra deslizante de *pills* de subcategorías y nuevo set de splash screens adaptativos.

### 💾 Capa de Persistencia & Datos
- `v1.0.0`: Consumo directo del CSV de Google Sheets en `localStorage`.
- `v1.1.0`: Integración de diccionarios de traducción inglés-español.
- `v1.2.0`: Creación del motor **IndexedDB** (`lastcodex_offline_db` v3) con 5,065 entradas oficiales empaquetadas.
- `v1.3.0`: Base de datos de subcategorías automáticas (`item_subcategories.json`).

### ⚙️ Automatización & Compilación
- `v1.0.0`: Empaquetado manual con Capacitor y Electron Builder.
- `v1.1.0`: Configuración de Vercel rewrites para PWA y rutas limpias.
- `v1.2.0`: Configuración para evitar pantallas negras offline en Android WebViews nativas.
- `v1.3.0`: Script automatizado `build-apk.js` con versionado de binario (`lastcodex_1.3.0.apk`) y generador Python de iconos adaptativos `generate_app_icons.py`.

---

## 📝 Cómo Agregar Nuevas Versiones a Futuro

Cuando el equipo de desarrollo prepare la versión `1.3.1`, `1.4.0` o superior, sigue el protocolo definido en:
👉 **[[Plantilla de Nueva Versión]]**

---

## 🔗 Sinapsis Relacionadas
- Volver al MOC: [[00 - Nodo Central (MOC) - LastCodex]]
- Ver detalles de la versión activa: [[02 - Versiones y Changelog]]
- Ver script de compilación: [[Script Build APK]]
