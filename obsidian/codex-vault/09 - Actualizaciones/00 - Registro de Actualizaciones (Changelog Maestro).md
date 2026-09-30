---
title: "Registro de Actualizaciones (Changelog Maestro)"
type: update-hub
tags:
  - "#hub"
  - "#actualizacion"
  - "#changelog"
  - "#versiones"
version: 1.4.6
created: 2026-09-23
---

# 📜 Registro de Actualizaciones (Changelog Maestro)

Bienvenido al nodo central de **control evolutivo y versiones** de **LastResources** (antes *LastCodex*). Este módulo documenta la historia completa de desarrollo, las transformaciones arquitectónicas, correcciones de errores y nuevas funcionalidades introducidas a lo largo de cada hito de versión.

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
 │   v1.0.0    │  │   v1.2.0    │                 │   v1.4.0    │  │   v1.4.6    │
 │ (Fundación) │  │ (OfflineDB) │                 │(Multilingüe)│  │  (Actual)   │
 └─────────────┘  └─────────────┘                 └─────────────┘  └─────────────┘
```

---

## 🧭 Hitos de Versión en la Red

| Versión | Nombre Clave | Estado | Fecha de Corte | Commits Clave |
| :--- | :--- | :--- | :--- | :--- |
| **[[v1.4.6 - Calculadora Oficial de Pruebas y Optimizaciones Móviles]]** | *Proofs Calculator & Mobile UI* | **Actual (Producción)** | 29 Septiembre 2026 | `db0b79b`, `f4ed012` |
| **[[v1.4.5 - Rebranding LastResources, Torres Celestiales, Notificaciones Push y Blindaje Legal]]** | *LastResources & Torres* | Precedente | 27 Septiembre 2026 | `03edada`, `e2b7b27`, `38fa794`, `9dafe90` |
| **[[v1.4.4 - Visor de Mapa Interactivo y Comprobador de Actualizaciones Remoto]]** | *Mapa & Update Checker* | Precedente | 25 Septiembre 2026 | `27c9495`, `014f7ee`, `8b4de09`, `5250d0f` |
| **[[v1.4.3 - Nombre Estable APK, Glassmorphism Sakura y Soporte Notch]]** | *APK Estable & Notch* | Precedente | 24 Septiembre 2026 | `1d0efb2`, `210ce6d` |
| **[[v1.4.2 - Tema Sakura, Footer Compacto y Auto-ocultación de Barra]]** | *Tema Sakura & Auto-BNB* | Precedente | 24 Septiembre 2026 | `8e0a716`, `7d10fb6` |
| **[[v1.4.1 - Efecto Glassmorphism en Sprite Codex, Paleta Café y Corrección Tema Claro]]** | *Glassmorphism & Paleta Café* | Precedente | 23 Septiembre 2026 | `ca7affc`, `bdd3023` |
| **[[v1.4.0 - Tema Claro, 22 Idiomas, Ajuste de Grilla Codex y Limpieza de Barra]]** | *Tema Claro & 22 Idiomas* | Precedente | Septiembre 2026 | `v1.4.0` |
| **[[v1.3.1 - Paginación Numérica y Modo Cuadrícula en Códice]]** | *Paginación & Vista Cuadrícula* | Precedente | Septiembre 2026 | `d1389bd` |
| **[[v1.3.0 - Renacimiento LastCodex, Subcategorías y APK Versionada]]** | *Branding & Subcategorías* | Precedente | Septiembre 2026 | `14039c3`, `dd3d54f`, `998984e`, `c2d471c` |
| **[[v1.2.0 - Códice Masivo Offline (5065 ítems) y Sincronización]]** | *Offline IndexedDB & Sync* | Precedente | Septiembre 2026 | `c041b4e`, `38d628a`, `82c28f0`, `41eded1` |
| **[[v1.1.0 - Clases, Eventos, Canvas Offline y Soporte Android]]** | *Expansión de Funcionalidades* | Precedente | Septiembre 2026 | `1d39d71`, `7e9b8d7`, `158f6bc`, `27e4d69` |
| **[[v1.0.0 - Lanzamiento Inicial Orna Guild Forecast y Multiplataforma]]** | *Génesis del Proyecto* | Fundación | Agosto 2026 | `6ea2411`, `1793c8a`, `417b2ab`, `fb28397` |

---

## 📐 Regla Oficial de Incremento de Versiones
- **Cambios Menores (Ajustes, correcciones, mejoras puntuales)**: Sube el **tercer dígito** (PATCH) — Ejemplo: `1.4.5` ➔ `1.4.6`.
- **Cambios Notables (Nuevas implementaciones, módulos o rediseño)**: Sube el **segundo dígito** (MINOR) — Ejemplo: `1.3.x` ➔ `1.4.0`.

---

## 📈 Resumen Rápido por Capas del Sistema

### 🎨 Capa Visual & Branding
- `v1.0.0`: Lanzamiento inicial con tema básico de forecast.
- `v1.0.x`: Migración a tema AMOLED Pure Black y diseño de navegación semicircular.
- `v1.1.0`: Vistas especializadas de progresión de clases (`codex-classes`) y calendario de eventos.
- `v1.3.0`: Renacimiento como LastCodex con nueva paleta dorada e íconos refinados.
- `v1.4.0`: Modo Claro (Light Mode) con fondo marfil y soporte para 22 idiomas.
- `v1.4.1`: Glassmorphism en tarjetas de códice y paleta café.
- `v1.4.2`: Tema floral Sakura y auto-ocultación de la barra de navegación inferior.
- `v1.4.5`: Rebranding oficial a LastResources y blindaje legal.
- `v1.4.6`: Calculadora de pruebas oficial, 2 columnas móvil y header dinámico.
