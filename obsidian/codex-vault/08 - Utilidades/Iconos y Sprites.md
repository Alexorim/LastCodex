---
title: "Iconos y Sprites"
type: utility
tags:
  - "#utilidad"
  - "#sprites"
  - "#iconos"
  - "#recursos"
version: 1.3.0
created: 2026-09-23
---

# 🛡️ Iconos y Sprites (`material-icon.util.ts` & `guild-icon.util.ts`)

Esta utilidad unifica el acceso a los recursos gráficos, insignias de gremios y sprites de ítems de *Orna* y *LastCodex*.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Vistas Relacionadas: [[HomePage - Forecast Hoy y Mañana]], [[CodexPage - Explorador del Códice]], [[CalendarPage - Calendario de Materiales]]
- Generador de Infografías: [[Forecast Canvas]]
- Scripts de Soporte: [[Script Scraper del Codex]]

---

## 🎨 Funciones y Mapeos Principales

1. **`getMaterialIcon(materialName: string): string`**:
   - Devuelve la ruta relativa o nombre de sprite para cualquier material conocido.
   - En caso de materiales nuevos o no registrados, asigna un ícono de cofre o mineral por defecto para evitar roturas visuales.
2. **`getGuildIcon(guildId: string): string`**:
   - Asigna los emblemas vectoriales y colores distintivos de cada gremio:
     - 🏛️ Monument: Dorado celestial (`#f59e0b`)
     - 🩸 Anguish: Carmesí oscuro (`#dc2626`)
     - ⚔️ Finesse: Azul acero (`#2563eb`)
     - ⛏️ Spelunking: Esmeralda profunda (`#059669`)

---

## 🔗 Sinapsis Relacionadas
- Ver generador de infografías: [[Forecast Canvas]]
- Ver pantalla de inicio: [[HomePage - Forecast Hoy y Mañana]]
- Ver explorador del códice: [[CodexPage - Explorador del Códice]]
