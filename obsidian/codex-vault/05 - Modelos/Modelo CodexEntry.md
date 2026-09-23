---
title: "Modelo CodexEntry"
type: model
tags:
  - "#modelo"
  - "#typescript"
  - "#datos"
  - "#codex"
version: 1.3.0
created: 2026-09-23
---

# 📑 Modelo CodexEntry (`codex.service.ts`)

La interfaz `CodexEntry` define la entidad atómica fundamental de datos para cualquier registro en la enciclopedia de **LastCodex**.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Servicio Consumidor: [[CodexService]]
- Vistas Relacionadas: [[CodexPage - Explorador del Códice]], [[CodexClassesPage - Clases y Habilidades]]
- Módulo: [[Módulo Códice de Orna]]

---

## 📐 Definición de Tipos TypeScript

```typescript
export interface CodexSubItem {
  name: string;
  sprite?: string;
  tier?: number;
  rarity?: string;
  url?: string;
  meta?: string;
}

export interface CodexEntry {
  id: string;
  name: string;
  nameEs?: string;
  nameEn?: string;
  category: string;             // 'items' | 'monsters' | 'bosses' | 'raids' | ...
  subcategory?: string;          // 'Staff' | 'Curved Sword' | 'Helmet' | ...
  tier: number;                  // 1 a 11
  icon: string;                  // Ruta al sprite
  type: string;
  rarity?: string;
  exotic?: boolean;
  arisen?: boolean;
  description?: string;
  descriptionEs?: string;
  descriptionEn?: string;
  stats?: string;
  officialUrl?: string;
  facts?: Array<{ label: string; value: string }>;
  itemStats?: { [key: string]: string }; // Atk, Mag, Def, Res, Ward...
  useableBy?: string;            // Clases compatibles
  place?: string;                // Ubicación o bioma
  element?: string;              // Fuego, Hielo, Rayo, Tierra, Sagrado, Oscuro
  upgradeMaterials?: CodexSubItem[]; // Materiales de forja
  droppedBy?: CodexSubItem[];        // Monstruos/jefes que lo sueltan
  causes?: CodexSubItem[];           // Estados alterados causados
  gives?: CodexSubItem[];            // Buffs otorgados
  skills?: CodexSubItem[];           // Hechizos concedidos
  drops?: CodexSubItem[];            // Botín dejado por criaturas
  learnedBy?: CodexSubItem[];        // Clases que lo aprenden
}
```

---

## 🔗 Sinapsis Relacionadas
- Ver servicio principal: [[CodexService]]
- Ver explorador del códice: [[CodexPage - Explorador del Códice]]
