---
title: "CalendarPage - Calendario de Materiales"
type: page
tags:
  - "#pagina"
  - "#vista"
  - "#calendario"
  - "#forecast"
version: 1.3.0
created: 2026-09-23
---

# 📅 CalendarPage — Calendario de Materiales (`calendar.page.ts`)

`CalendarPage` presenta una vista matricial de calendario mensual donde los jugadores pueden explorar visualmente las predicciones de rotación de materiales para cualquier día del mes.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Módulo: [[Módulo Forecast de Gremios]]
- Servicio Inyectado: [[MaterialsService]]
- Utilidades: [[Iconos y Sprites]], [[Traducciones y Mapeo de Nombres]]

---

## 🧭 Interacción del Usuario

1. **Navegación Mensual**:
   - Selector interactivo para avanzar o retroceder entre meses.
2. **Matriz de Días**:
   - Cada celda representa un día del mes. Muestra mini-iconos de los materiales más relevantes que aparecerán en las tiendas ese día.
3. **Panel de Detalle del Día**:
   - Al tocar un día específico, se expande la lista completa desglosada por gremio (*Monument, Anguish, Blades, Spelunking*).
   - Permite a los jugadores marcar recordatorios o planificar el ahorro de monedas de gremio.

---

## 🔗 Sinapsis Relacionadas
- Ver servicio de pronóstico: [[MaterialsService]]
- Ver buscador por material: [[SearchPage - Buscador de Materiales]]
- Ver pantalla principal: [[HomePage - Forecast Hoy y Mañana]]
