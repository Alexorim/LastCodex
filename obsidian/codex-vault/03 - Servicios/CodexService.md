---
title: "CodexService"
type: service
tags:
  - "#servicio"
  - "#codex"
  - "#indexeddb"
  - "#logica"
version: 1.3.0
created: 2026-09-23
---

# 🧠 CodexService (`codex.service.ts`)

`CodexService` es el servicio más extenso y complejo del proyecto (~677 líneas). Administra el ciclo de vida, persistencia local, indexación, búsqueda y sincronización de datos de más de 3,000 entradas enciclopédicas de *Orna*.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Módulo: [[Módulo Códice de Orna]]
- Vistas Consumidoras: [[CodexPage - Explorador del Códice]], [[CodexClassesPage - Clases y Habilidades]], [[SettingsPage - Configuración]]
- Modelo de Datos: [[Modelo CodexEntry]]
- Scripts Relacionados: [[Script Scraper del Codex]]

---

## 🏛️ Constantes y Parámetros del Servicio

```typescript
const DB_NAME = 'lastcodex_offline_db';
const DB_VERSION = 3;
const STORE_NAME = 'codex_store';
const KEY_ENTRIES = 'entries';
const KEY_METADATA = 'metadata';

const CATEGORIES = [
  'items', 'monsters', 'bosses', 'raids', 
  'followers', 'spells', 'buildings', 'dungeons', 'classes'
];
```

---

## 🌊 Observables Públicos (RxJS State)

| Observable | Tipo | Propósito |
| :--- | :--- | :--- |
| `entries$` | `Observable<CodexEntry[]>` | Emite la lista completa de entradas activas en memoria. |
| `lastSync$` | `Observable<string \| null>` | Timestamp ISO de la última sincronización ejecutada. |
| `isCustomData$` | `Observable<boolean>` | `true` si el usuario ha sincronizado datos nuevos que superan los empaquetados. |
| `syncProgress$` | `Observable<SyncProgress>` | Emite el progreso (0-100%), categoría actual y estado de la sincronización en vivo. |

---

## 🛠️ Métodos Clave y Responsabilidades

### 1. Inicialización & Carga Híbrida (`init()`, `loadFromCache()`)
- Primero, inicializa `entriesSubject` con el archivo estático empaquetado `codex-items.json` como fallback inmediato.
- Abre la conexión a **IndexedDB** (`lastcodex_offline_db`, versión 3).
- Si existen entradas en IndexedDB, las extrae y actualiza `entries$`, notificando a la interfaz sin parpadeos.

### 2. Motor de Búsqueda y Filtrado (`filterEntries()`)
- Realiza filtrado en memoria de alto rendimiento:
  - **Categoría**: `items`, `monsters`, etc.
  - **Subcategoría**: Mediante cruce con `item-subcategories.json`.
  - **Tier**: Filtrado por nivel de nivel 1 a 11.
  - **Búsqueda por texto**: Coincidencia insensible a mayúsculas/minúsculas en español (`nameEs`), inglés (`nameEn`) y descripción.
  - **Filtros booleanos**: `arisen`, `exotic`.

### 3. Sincronización Web (`syncFromWeb()`, `checkUpdates()`)
- `checkUpdates()`: Comprueba el conteo remoto contra el local para verificar si hay contenido nuevo.
- `syncFromWeb()`: Descarga secuencialmente por lotes los ítems del códice de PlayOrna, actualizando `SyncProgress` (porcentaje, categoría actual) y guardando los resultados en IndexedDB.

### 4. Limpieza y Restauración (`resetToDefaults()`)
- Permite al usuario en [[SettingsPage - Configuración]] purgar la base IndexedDB y regresar a los datos base empaquetados en la versión original.

---

## 🔗 Sinapsis Relacionadas
- Ir al módulo funcional: [[Módulo Códice de Orna]]
- Ver modelo de datos: [[Modelo CodexEntry]]
- Ver pantalla de búsqueda: [[CodexPage - Explorador del Códice]]
