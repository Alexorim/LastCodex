---
title: "CalendarPage - Calendario de Materiales"
type: page
tags:
  - "#pagina"
  - "#vista"
  - "#calendario"
  - "#forecast"
  - "#notificaciones"
version: 1.4.5
created: 2026-09-23
updated: 2026-09-29
---

# 📅 CalendarPage — Calendario de Materiales (`calendar.page.ts`)

`CalendarPage` presenta una matriz de calendario mensual donde los jugadores pueden explorar visualmente las predicciones de rotación de materiales para cualquier día del mes y activar recordatorios en sus dispositivos.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Módulo: [[Módulo Forecast de Gremios]], [[Módulo Notificaciones del Sistema]]
- Servicios Inyectados: [[MaterialsService]], [[NotificationsService]]
- Utilidades: [[Iconos y Sprites]], [[Traducciones y Mapeo de Nombres]]

---

## 🧭 Interacción del Usuario y Componentes

1. **Navegación Mensual**:
   - Selector interactivo para avanzar o retroceder entre meses.
2. **Matriz de Días**:
   - Cada celda representa un día del mes y muestra mini-iconos de los materiales raros que aparecerán ese día.
3. **Modal de Detalle del Material con Glassmorphism**:
   - Al pulsar sobre un material, se despliega una tarjeta de detalle translúcida.
   - En la esquina de la tarjeta se ubica un **botón con icono de reloj**:
     - Al pulsarlo, solicita confirmación para crear un **recordatorio nativo** en el celular.
     - Programa la alerta a través de [[NotificationsService]] para que el móvil avise en la barra de estado cuando el material esté disponible en la tienda del gremio:
     ```text
     LastResources • ahora
     ¡Material Disponible: {material}!
     El material {material} ya está disponible en el {gremio}.
     ```

---

## 🔗 Sinapsis Relacionadas
- Ver servicio de pronóstico: [[MaterialsService]]
- Ver servicio de notificaciones: [[NotificationsService]]
- Ver buscador por material: [[SearchPage - Buscador de Materiales]]
- Ver pantalla principal: [[HomePage - Forecast Hoy y Mañana]]
