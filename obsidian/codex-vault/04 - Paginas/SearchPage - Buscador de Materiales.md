---
title: "SearchPage - Buscador de Materiales"
type: page
tags:
  - "#pagina"
  - "#vista"
  - "#buscador"
  - "#materiales"
version: 1.3.0
created: 2026-09-23
---

# 🔎 SearchPage — Buscador de Materiales (`search.page.ts`)

`SearchPage` está concebido para resolver la pregunta: *¿Cuándo volverá a salir este material específico y en qué gremio?*

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Módulo: [[Módulo Forecast de Gremios]]
- Servicio Inyectado: [[MaterialsService]]
- Modelos: [[Modelo DayForecast y GuildStock]]
- Utilidades: [[Traducciones y Mapeo de Nombres]], [[Iconos y Sprites]]

---

## 🔍 Características y Flujo de Búsqueda

1. **Barra de Entrada Reactiva**:
   - Conforme el usuario escribe (ej: *Ortanite*, *Pure Runestone*, *Ancient Wood*), la lista se filtra en tiempo real sin latencia.
2. **Historial y Próximas Fechas**:
   - Para cada material coincidente, muestra:
     - Última fecha en que estuvo disponible.
     - **Próximas fechas proyectadas** en el calendario de rotación.
     - Gremios en los que suele aparecer.
3. **Filtro por Gremio**:
   - Botones rápidos para filtrar exclusivamente materiales de *Monument*, *Anguish*, etc.

---

## 🔗 Sinapsis Relacionadas
- Ver servicio de datos: [[MaterialsService]]
- Ver vista de calendario: [[CalendarPage - Calendario de Materiales]]
