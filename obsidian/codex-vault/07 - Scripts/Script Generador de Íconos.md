---
title: "Script Generador de Íconos"
type: script
tags:
  - "#script"
  - "#python"
  - "#assets"
  - "#iconos"
version: 1.3.0
created: 2026-09-23
---

# 🎨 Script Generador de Íconos (`scripts/generate_app_icons.py`)

`generate_app_icons.py` es una utilidad escrita en Python que utiliza la biblioteca Pillow (PIL) para automatizar la generación de todos los tamaños y densidades de iconos adaptativos y splash screens para Android e iOS.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Plataforma: [[Plataforma Android y Capacitor]]
- Utilidades: [[Iconos y Sprites]]
- Versiones: [[02 - Versiones y Changelog]]

---

## 🎯 Problema que Resuelve

Android requiere iconos en múltiples resoluciones dentro de las carpetas `res/mipmap-*`:
- `mipmap-mdpi` (48x48)
- `mipmap-hdpi` (72x72)
- `mipmap-xhdpi` (96x96)
- `mipmap-xxhdpi` (144x144)
- `mipmap-xxxhdpi` (192x192)
Además de los iconos redondos (`ic_launcher_round.png`) e iconos de primer plano (`ic_launcher_foreground.png`).

Hacer esto a mano tras un cambio de logotipo (como el rediseño a fondo transparente de la versión `1.3.0`) es lento y propenso a distorsiones.

---

## ⚙️ Capacidades del Script

1. **Lectura de Imagen Origen**:
   - Toma `logo.png` o `resources/icon.png` como fuente de alta resolución.
2. **Generación Adaptativa**:
   - Redimensiona con filtro bicúbico de alta calidad (`LANCZOS`).
   - Aplica márgenes de seguridad para evitar recortes en launchers con máscaras circulares o hexagonales.
3. **Distribución en el Árbol Nativo**:
   - Escribe directamente en `android/app/src/main/res/` reemplazando los mipmaps sin romper configuraciones de Gradle.

---

## 🔗 Sinapsis Relacionadas
- Ver plataforma Android: [[Plataforma Android y Capacitor]]
- Ver control de versiones y branding: [[02 - Versiones y Changelog]]
