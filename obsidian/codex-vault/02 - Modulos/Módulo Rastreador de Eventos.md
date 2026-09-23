---
title: "Módulo Rastreador de Eventos"
type: module
tags:
  - "#modulo"
  - "#eventos"
  - "#rotaciones"
version: 1.3.0
created: 2026-09-23
---

# 📅 Módulo Rastreador de Eventos

El **Módulo Rastreador de Eventos** permite a los usuarios de **LastCodex** seguir el calendario de eventos temporales, incursiones temáticas y jefes mensuales de *Orna*.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Vista Principal: [[EventsPage - Eventos en Vivo]]
- Modelos: [[Modelo Event]]
- Interacción con Códice: [[Módulo Códice de Orna]], [[CodexService]]

---

## 🎪 Naturaleza de los Eventos en Orna

Los desarrolladores de *Orna* introducen periódicamente eventos de tiempo limitado:
- **Eventos Mensuales Temáticos**: Introducen monstruos, mascotas y jefes temáticos durante todo un mes calendario (ej: *Ragnarok*, *The Other Realm*, *Sisters of Morrigan*, *Mimic Mayhem*).
- **Mini-Eventos de Fin de Semana**: Bonificaciones de experiencia, ornas dobles, o apariciones de jefes errantes.
- **Incursiones Limitadas (Raid Events)**: Invocación de jefes mundiales que solo pueden invocarse mediante pergaminos de invocación durante dicho lapso.

---

## 📋 Funcionalidades del Módulo

1. **Estado en Tiempo Real**:
   - Clasificación de eventos en:
     - 🟢 **Activo Ahora**: Eventos en curso con contador de días y horas restantes.
     - 🟡 **Próximamente**: Eventos programados para las próximas semanas.
     - ⚪ **Histórico / Concluido**: Referencia de rotaciones pasadas.
2. **Desglose de Contenido Vinculado**:
   - Cada evento muestra:
     - Fechas oficiales de inicio y culminación.
     - Monstruos y jefes asociados.
     - Enlace directo a las entradas correspondientes en el códice mediante [[CodexService]].
     - Mascotas exclusivas disponibles en el bestiario durante el evento.

---

## 🔗 Sinapsis Relacionadas
- Ver pantalla de eventos: [[EventsPage - Eventos en Vivo]]
- Ver estructura de datos: [[Modelo Event]]
- Explorar criaturas de eventos: [[Módulo Códice de Orna]]
