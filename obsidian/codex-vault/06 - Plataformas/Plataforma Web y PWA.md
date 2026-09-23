---
title: "Plataforma Web y PWA"
type: platform
tags:
  - "#plataforma"
  - "#web"
  - "#pwa"
  - "#vercel"
version: 1.3.0
created: 2026-09-23
---

# 🌐 Plataforma Web y PWA

**LastCodex** está concebida primordialmente como una **Progressive Web App (PWA)** desarrollada con Angular 22 e Ionic 9, desplegable en la nube y accesible desde cualquier navegador moderno en iOS, Android o PC.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Stack: [[04 - Stack Tecnológico]]
- Arquitectura: [[03 - Arquitectura del Sistema]]

---

## ☁️ Despliegue en Vercel (`vercel.json`)

El proyecto incluye configuración nativa para hosting estático de alto rendimiento en **Vercel**:

```json
{
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

- La directiva `rewrites` redirige todas las rutas del cliente al `index.html`, permitiendo que el enrutador de Angular maneje las URLs limpias (`/home`, `/codex`, `/settings`, etc.) sin errores 404.

---

## ⚡ Capacidades PWA y Caché Web

- **Service Workers**: Permiten el almacenamiento de assets estáticos (fuentes, logos, iconos y bundles JS) para navegación instantánea.
- **IndexedDB**: Garantiza que el Códice (`lastcodex_offline_db`) opere sin gastar datos del usuario tras la primera carga.
- **Diseño Responsivo**: Adaptación fluida entre pantallas estrechas de teléfonos inteligentes y monitores panorámicos de escritorio.

---

## 🔗 Sinapsis Relacionadas
- Ver stack general: [[04 - Stack Tecnológico]]
- Ver servicio del códice: [[CodexService]]
