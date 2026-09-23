---
title: "Script Scraper del Codex"
type: script
tags:
  - "#script"
  - "#scraping"
  - "#node"
  - "#codex"
version: 1.3.0
created: 2026-09-23
---

# 🕷️ Scripts de Extracción y Enriquecimiento del Códice

Este conjunto de scripts (`scrape_codex.js`, `enrich_codex_details.js`, `download_all_sprites.js`, `download-t10.js`) se encarga de recolectar, parsear, traducir y empaquetar el contenido enciclopédico de PlayOrna para su distribución offline.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Módulo: [[Módulo Códice de Orna]]
- Servicio: [[CodexService]]
- Modelos: [[Modelo CodexEntry]]
- Utilidades: [[Iconos y Sprites]], [[Traducciones y Mapeo de Nombres]]

---

## 🛠️ Herramientas del Conjunto

### 1. `scrape_codex.js`
- Realiza peticiones HTTP a `https://playorna.com/codex/` para las 9 categorías principales.
- Parsea el DOM mediante expresiones regulares y selectores HTML.
- Extrae ID, nombre, tier, rareza, URL del sprite y enlace a la ficha oficial.

### 2. `enrich_codex_details.js`
- Navega a la página individual de cada ítem/criatura para extraer:
  - Atributos estadísticos (*Attack, Magic, Ward, Crit, Mana, HP*).
  - Materiales de mejora y cantidades requeridas.
  - Relaciones de drop (*Dropped by* y *Drops*).
  - Efectos pasivos e inmunidades elementales.

### 3. `download_all_sprites.js`
- Descarga todos los sprites e imágenes PNG desde el CDN oficial de Orna a la carpeta de assets locales.
- Previene peticiones HTTP externas durante el uso de la aplicación, afianzando la filosofía *offline-first*.

---

## 🔗 Sinapsis Relacionadas
- Ver servicio del códice: [[CodexService]]
- Ver modelo de datos: [[Modelo CodexEntry]]
- Ver módulo del códice: [[Módulo Códice de Orna]]
