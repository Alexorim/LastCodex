---
title: "Módulo Forecast de Gremios"
type: module
tags:
  - "#modulo"
  - "#forecast"
  - "#gremios"
version: 1.3.0
created: 2026-09-23
---

# 🔮 Módulo Forecast de Gremios (Guild Materials)

El **Módulo Forecast de Gremios** es una de las funcionalidades estrella de **LastCodex**. Permite a los jugadores anticipar la disponibilidad de materiales raros en las tiendas de los distintos gremios de *Orna: The GPS RPG* y *Hero of Aethric*.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Servicio Central: [[MaterialsService]]
- Temporizador y Reseteo: [[TimerService]]
- Vistas Asociadas: [[HomePage - Forecast Hoy y Mañana]], [[CalendarPage - Calendario de Materiales]], [[SearchPage - Buscador de Materiales]]
- Modelos: [[Modelo DayForecast y GuildStock]]
- Utilidades: [[Forecast Canvas]], [[Iconos y Sprites]], [[Traducciones y Mapeo de Nombres]]

---

## 🏛️ Los Cuatro Gremios Monitoreados

1. **Monument Guild (Gremio de Monumentos)**:
   - Ofrece materiales de alta categoría a cambio de *Proofs of Monument*.
   - Clave para armaduras de dioses celestiales y mejoras de nivel 10 a 20.
2. **Circle of Anguish (Círculo de la Angustia)**:
   - Recompensas obtenidas al activar niveles de dificultad Anguish (*Proofs of Anguish*).
   - Vende materiales altamente cotizados como *Ortanite*, *Pure Runestone*, y materiales corruptos.
3. **Blades of Finesse (Hojas de Destreza / PvP Guild)**:
   - Tienda de combate contra otros jugadores usando equipamiento estandarizado (*Proofs of Finesse*).
   - Rota materiales raros necesarios para forja y transmutación.
4. **Spelunking Guild (Gremio de Espeleología)**:
   - Tienda asociada a mazmorras, cavernas y minería.
   - Materiales de piedras rúnicas y minerales elementales.

---

## ⚙️ Funcionamiento Técnico

```
[Google Sheets CSV (gid=1635134007)]
                │
                ▼ (HTTP GET cada 5 min / medianoche)
      [[MaterialsService]]
       ├── Parseo CSV con comillas escapadas
       ├── Inferencia de fechas y zonas horarias
       └── Almacenamiento en LocalStorage
                │
                ├───────► [[HomePage - Forecast Hoy y Mañana]] (Stock Hoy y Mañana)
                ├───────► [[CalendarPage - Calendario de Materiales]] (Matriz Mensual)
                └───────► [[SearchPage - Buscador de Materiales]] (Búsqueda Histórica)
```

### 1. Ingesta de Datos
- La fuente de verdad proviene de una hoja comunitaria de cálculo de Google Sheets exportada dinámicamente en formato CSV:
  `https://docs.google.com/spreadsheets/d/1gWTEeQnFlNePLTOLCbrzyMWljJjR01L84z2tpeaOAi8/export?format=csv&gid=1635134007`
- [[MaterialsService]] se encarga de analizar las filas, separando cabeceras, fechas, nombres de gremios e ítems disponibles.

### 2. Sincronización Temporal y Ventana Stale
- El juego resetea su stock globalmente a las **00:00 UTC**.
- [[TimerService]] detecta la proximidad a la medianoche y notifica si el sistema se encuentra en la **"Stale Window"** (ventana de tiempo donde los datos del nuevo día se están actualizando y pueden requerir confirmación comunitaria).

### 3. Compartición en Redes
- Mediante [[Forecast Canvas]], la información de la pantalla de hoy se puede convertir en una imagen atractiva lista para enviar a canales de Discord de reinos o grupos de mensajería.

---

## 🔗 Sinapsis Relacionadas
- Ver servicio detallado: [[MaterialsService]]
- Ver pantalla principal de pronóstico: [[HomePage - Forecast Hoy y Mañana]]
- Ver vista de calendario: [[CalendarPage - Calendario de Materiales]]
