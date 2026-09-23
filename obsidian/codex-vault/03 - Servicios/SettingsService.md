---
title: "SettingsService"
type: service
tags:
  - "#servicio"
  - "#configuracion"
  - "#i18n"
  - "#preferencias"
version: 1.3.0
created: 2026-09-23
---

# ⚙️ SettingsService (`settings.service.ts`)

`SettingsService` es el servicio encargado de administrar y persistir las preferencias del usuario: idioma seleccionado, tema visual y metadatos del entorno.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Módulo: [[Módulo Configuración y Sistema]]
- Vista Consumidora: [[SettingsPage - Configuración]]
- Vistas Impactadas: [[CodexPage - Explorador del Códice]], [[HomePage - Forecast Hoy y Mañana]]
- Utilidades: [[Traducciones y Mapeo de Nombres]]

---

## 🎨 Tipos e Interfaces

```typescript
export type Language = 'es' | 'en';
export type ThemeMode = 'codex-dark' | 'dark' | 'light';
```

---

## 🌊 Observables y Métodos Clave

| Miembro | Tipo | Descripción |
| :--- | :--- | :--- |
| `language$` | `Observable<Language>` | Idioma actual activo (`'es'` o `'en'`). |
| `theme$` | `Observable<ThemeMode>` | Tema activo en el DOM. |
| `setLanguage(lang)` | `void` | Cambia el idioma y lo guarda en `localStorage.setItem('orna_lang', lang)`. |
| `setTheme(theme)` | `void` | Aplica clases CSS al elemento raíz `<html>` o `<body>` y persiste la preferencia. |
| `getDeviceTimezone()` | `string` | Obtiene la zona horaria del dispositivo vía `Intl.DateTimeFormat().resolvedOptions().timeZone`. |

---

## 🔗 Sinapsis Relacionadas
- Ver interfaz de ajustes: [[SettingsPage - Configuración]]
- Ver módulo de configuración: [[Módulo Configuración y Sistema]]
- Ver utilidades de traducción: [[Traducciones y Mapeo de Nombres]]
