---
title: "Traducciones y Mapeo de Nombres"
type: utility
tags:
  - "#utilidad"
  - "#i18n"
  - "#traduccion"
  - "#idiomas"
version: 1.3.0
created: 2026-09-23
---

# 🌐 Traducciones y Mapeo de Nombres (`material-translation.util.ts`)

Esta utilidad proporciona diccionarios bidireccionales y normalizadores fonéticos para traducir los nombres de materiales, ítems y monstruos entre **Inglés** y **Español**, manteniendo correspondencia exacta con la localización oficial de *Orna*.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Servicio Consumidor: [[SettingsService]], [[MaterialsService]], [[CodexService]]
- Vistas Relacionadas: [[CodexPage - Explorador del Códice]], [[HomePage - Forecast Hoy y Mañana]]

---

## 📚 Diccionarios y Mecánica de Reemplazo

1. **Normalización de Nombres de Materiales**:
   - Mapea variaciones de ortografía del CSV (ej: `Ortanite` <-> `Ortanita`, `Pure Runestone` <-> `Piedra Rúnica Pura`, `Ancient Wood` <-> `Madera Antigua`).
2. **Nombres de Gremios**:
   - *Monument Guild* -> *Gremio de Monumentos*.
   - *Circle of Anguish* -> *Círculo de la Angustia*.
   - *Blades of Finesse* -> *Hojas de Destreza*.
   - *Spelunking Guild* -> *Gremio de Espeleología*.
3. **Búsqueda Flexible (Fuzzy Match)**:
   - Limpia diacríticos y tildes para que buscar *"ortanita"* encuentre *"Ortanite"* de manera instantánea.

---

## 🔗 Sinapsis Relacionadas
- Ver servicio de configuración de idiomas: [[SettingsService]]
- Ver servicio de materiales: [[MaterialsService]]
- Ver servicio del códice: [[CodexService]]
