---
title: "CodexPage - Explorador del Códice"
type: page
tags:
  - "#pagina"
  - "#vista"
  - "#codex"
  - "#buscador"
version: 1.3.0
created: 2026-09-23
---

# 📖 CodexPage — Explorador del Códice (`codex.page.ts`)

`CodexPage` es la interfaz de consulta principal de la base de datos de *LastCodex*. Permite explorar más de 3,000 entradas de monstruos, jefes, ítems, hechizos y seguidores con rendimiento instantáneo y offline.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Módulo: [[Módulo Códice de Orna]]
- Servicio Inyectado: [[CodexService]]
- Modelo Asociado: [[Modelo CodexEntry]]
- Página Hermana: [[CodexClassesPage - Clases y Habilidades]]
- Configuración: [[SettingsService]]
- Utilidades: [[Traducciones y Mapeo de Nombres]], [[Iconos y Sprites]]

---

## 🎨 Elementos y Mecánicas de la Interfaz

1. **Barra de Búsqueda Instantánea**:
   - Búsqueda textual sobre títulos en inglés, títulos en español y descripciones.
2. **Carrusel de Categorías**:
   - Botones deslizables: *Items, Monsters, Bosses, Raids, Followers, Spells, Buildings, Dungeons, Classes*.
3. **Barra Dinámica de Subcategorías (Pills)**:
   - Implementada en la versión `1.3.0`.
   - Cuando la categoría es *Items*, genera etiquetas dinámicas: *Báculo, Espada, Hacha, Daga, Arco, Casco, Pechera, Accesorio, Material, etc.*
4. **Filtro de Tiers (T1 a T11)**:
   - Selector visual desplegable para aislar exactamente el nivel de progresión deseado.
5. **Selector de Modo de Vista (Normal vs Cuadrícula Compacta)**:
   - **Vista Normal**: Tarjetas completas con sprite, tier, nombre, tipo y estadísticas.
   - **Vista Cuadrícula Compacta**: Muestra exclusivamente el sprite centrado, la categoría y el nombre ajustado al ancho de la celda con elipsis.
   - **Ubicación Adaptativa del Botón de Cambio**:
     - En **móvil** (`<= 767px`): Ubicado en la barra lateral izquierda superior de categorías (`.mobile-view-toggle`).
     - En **ordenador** (`>= 768px`): Situado directamente al lado del menú desplegable del Tier (`.desktop-view-toggle-group`).
6. **Sistema de Paginación Numérica Directa (1, 2, 3, 4...)**:
   - Reemplaza el antiguo botón "cargar más" por una barra de paginación completa.
   - Botones directos a la primera página (`«`), anterior (`<`), páginas numeradas correlativas (`1, 2, 3, 4...`), siguiente (`>`) y última página (`»`).
   - Mantiene scroll automático al inicio al cambiar de página o filtrar.
7. **Modal de Detalle Completo**:
   - Al seleccionar cualquier tarjeta (tanto en lista como en cuadrícula) se abre un diálogo modal profundo que incluye:
     - Sprite a resolución completa.
     - Estadísticas base (*Ataque, Magia, Defensa, Resistencia, Ward, Crítico*).
     - Materiales requeridos para mejorarlo al nivel 10 / Masterforged / Demonforged / Godforged.
     - Monstruos y jefes que lo sueltan (*Dropped by*), con enlaces interactivos a sus propias fichas de monstruo.

---

## 🔗 Sinapsis Relacionadas
- Ver servicio del códice: [[CodexService]]
- Ver modelo de datos: [[Modelo CodexEntry]]
- Ver vista de clases: [[CodexClassesPage - Clases y Habilidades]]
