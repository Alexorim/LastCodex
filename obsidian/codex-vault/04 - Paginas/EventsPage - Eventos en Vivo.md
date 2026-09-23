---
title: "EventsPage - Eventos en Vivo"
type: page
tags:
  - "#pagina"
  - "#vista"
  - "#eventos"
version: 1.3.0
created: 2026-09-23
---

# 🎪 EventsPage — Eventos en Vivo (`events.page.ts`)

`EventsPage` es la interfaz donde los jugadores pueden verificar qué eventos temáticos temporales están ocurriendo actualmente en *Orna*, cuáles comenzarán pronto y qué jefes exclusivos pueden enfrentar.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Módulo: [[Módulo Rastreador de Eventos]]
- Modelo: [[Modelo Event]]
- Códice Relacionado: [[CodexPage - Explorador del Códice]], [[CodexService]]

---

## 📅 Estructura de la Pantalla

1. **Sección de Eventos Activos**:
   - Tarjetas destacadas con fecha límite, banner del evento y contador de días restantes.
2. **Lista de Monstruos & Jefes de Evento**:
   - Tapping en cualquier monstruo o jefe abre su ficha directamente en el códice con [[CodexService]].
3. **Recompensas Exclusivas**:
   - Guía rápida de equipamiento, seguidores y materiales que solo pueden conseguirse durante la vigencia del evento.

---

## 🔗 Sinapsis Relacionadas
- Ver módulo de eventos: [[Módulo Rastreador de Eventos]]
- Ver modelo de datos: [[Modelo Event]]
- Explorar criaturas en el códice: [[CodexPage - Explorador del Códice]]
