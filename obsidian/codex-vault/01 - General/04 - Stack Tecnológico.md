---
title: "Stack Tecnológico"
type: technology
tags:
  - "#stack"
  - "#tecnologia"
  - "#herramientas"
version: 1.3.0
created: 2026-09-23
---

# 💻 Stack Tecnológico de LastCodex

El stack tecnológico de **LastCodex** combina las herramientas más modernas del ecosistema web moderno con entornos nativos de compilación para móviles y escritorio.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Arquitectura: [[03 - Arquitectura del Sistema]]
- Plataformas: [[Plataforma Android y Capacitor]], [[Plataforma Desktop y Electron]], [[Plataforma Web y PWA]]
- Scripts de Automatización: [[Script Build APK]], [[Script Generador de Íconos]], [[Script Scraper del Codex]]

---

## 🛠️ Tecnologías Principales (Core Frameworks)

| Tecnología | Versión | Rol en el Proyecto |
| :--- | :--- | :--- |
| **Angular** | `22.0.1` | Framework principal SPA. Uso de componentes standalone, inyección funcional (`inject()`) y tipado estricto. |
| **Ionic Framework** | `9.0.0` (`@ionic/angular`) | Biblioteca de componentes UI adaptativos para móviles (tabs, modals, badges, toggles). |
| **TypeScript** | `~6.0.0` | Lenguaje base del proyecto, con interfaces fuertemente tipadas y chequeo estricto. |
| **RxJS** | `~7.8.0` | Manejo de flujos asíncronos mediante `BehaviorSubject`, `Observable`, operadores de tiempo y filtrado. |
| **Capacitor** | `8.5.2` | Runtime nativo para convertir la aplicación web en una app nativa Android (`@capacitor/android`). |
| **Electron** | `44.4.2` | Runtime de escritorio para empaquetar ejecutables nativos de Windows (`.exe`). |
| **Electron Builder** | `26.15.3` | Orquestador de empaquetado para distribución portable y empaquetada de Windows. |
| **html-to-image** | `1.11.13` | Renderizado y rasterizado de DOM a imagen PNG para exportación de infografías. |
| **Ionicons** | `8.1.0` | Iconografía vectorial temática utilizada en botones, navegación y cabeceras. |

---

## 🐍 Lenguajes & Herramientas Auxiliares

1. **Python 3**:
   - Empleado en scripts de backend local como [[Script Generador de Íconos]] (`scripts/generate_app_icons.py`) usando la biblioteca **Pillow (PIL)** para recortar, redimensionar y generar los conjuntos mipmap de Android.
2. **Node.js (ESM / CommonJS)**:
   - Scripts de pipeline como [[Script Build APK]] (`scripts/build-apk.js`) para invocar Gradle, verificar hashes, copiar artefactos y gestionar el versionado.
   - Scripts de web scraping para el Códice (`scripts/scrape_codex.js`).
3. **SCSS / CSS Modules**:
   - Variables CSS personalizadas con tema oscuro RPG ("Codex Dark") y animaciones suaves para tabs y modales.
4. **IndexedDB (W3C Standard)**:
   - Motor de persistencia estructurado para almacenar miles de registros del Códice con índices por id, categoría y tier.

---

## 🏗️ Comandos y Scripts de `package.json`

```bash
# Desarrollo web local
npm run start          # ng serve

# Compilación de producción
npm run build          # ng build --configuration production

# Compilación y ejecución en Electron (Escritorio)
npm run electron       # electron .
npm run dist:win       # Genera carpeta descomprimida en release/
npm run dist:win:exe   # Genera ejecutable portable .exe en release/

# Automatización de Android APK
npm run build:apk      # node scripts/build-apk.js (Compila con Gradle y versiona)
```

---

## 🔗 Sinapsis Relacionadas
- Ver arquitectura multicapa: [[03 - Arquitectura del Sistema]]
- Ver detalles del pipeline Android: [[Plataforma Android y Capacitor]]
- Ver detalles del pipeline Electron: [[Plataforma Desktop y Electron]]
