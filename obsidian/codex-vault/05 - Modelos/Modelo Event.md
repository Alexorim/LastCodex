---
title: "Modelo Event"
type: model
tags:
  - "#modelo"
  - "#typescript"
  - "#datos"
  - "#eventos"
version: 1.3.0
created: 2026-09-23
---

# 🎪 Modelo Event (`event.model.ts`)

La interfaz `Event` modela las características de los eventos en juego de *Orna* y *Hero of Aethric*.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Módulo: [[Módulo Rastreador de Eventos]]
- Vista Consumidora: [[EventsPage - Eventos en Vivo]]
- Relación con Códice: [[CodexService]], [[Modelo CodexEntry]]

---

## 📐 Definición de Tipos TypeScript

```typescript
export interface GameEvent {
  id: string;
  title: string;
  titleEs?: string;
  description: string;
  descriptionEs?: string;
  startDate: string;             // ISO Date
  endDate: string;               // ISO Date
  imageUrl?: string;
  active: boolean;
  upcoming: boolean;
  featuredMonsters?: string[];   // Nombres o IDs vinculados al códice
  featuredRaids?: string[];      // Jefes de asalto exclusivos
  exclusiveDrops?: string[];     // Equipamiento obtenible únicamente aquí
}
```

---

## 🔗 Sinapsis Relacionadas
- Ver pantalla de eventos: [[EventsPage - Eventos en Vivo]]
- Ver módulo de eventos: [[Módulo Rastreador de Eventos]]
