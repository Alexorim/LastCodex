---
title: "Módulo Códice de Orna"
type: module
tags:
  - "#modulo"
  - "#codex"
  - "#base_de_datos"
version: 1.3.0
created: 2026-09-23
---

# 📖 Módulo Códice de Orna (LastCodex Core)

El **Módulo Códice de Orna** constituye la base enciclopédica interactiva y sin conexión de **LastCodex**. Contiene información estructurada sobre miles de elementos del universo de *Orna* y *Hero of Aethric*.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Servicio Principal: [[CodexService]]
- Vistas Asociadas: [[CodexPage - Explorador del Códice]], [[CodexClassesPage - Clases y Habilidades]]
- Modelos: [[Modelo CodexEntry]]
- Scripts de Soporte: [[Script Scraper del Codex]]
- Utilidades: [[Traducciones y Mapeo de Nombres]], [[Iconos y Sprites]]

---

## 🗂️ Categorías Registradas en el Códice

El códice indexa 9 categorías exhaustivas:

| Categoría | Descripción | Ejemplos Representativos |
| :--- | :--- | :--- |
| **items** | Armas, armaduras, accesorios, consumibles y materiales. | *Fey Chimera Staff*, *Ortanite*, *Bag of Treats* |
| **monsters** | Criaturas y enemigos regulares del mapa. | *Draconian Mage*, *Great Pegasus*, *Immortal* |
| **bosses** | Jefes de mundo, mazmorras y misiones. | *Tiamat*, *Mammon*, *Fallen Heretic* |
| **raids** | Jefes de asalto para reinos y eventos. | *Morgawr*, *Arisen Morrigan*, *Arisen Apollyon* |
| **followers** | Mascotas y acompañantes con habilidades activas. | *Ashen Phoenix*, *Fey Chimera*, *Scarecrow* |
| **spells** | Hechizos y habilidades activas usables en combate. | *Omnimancy II*, *Summon Buggane*, *Cataclysm* |
| **buildings** | Estructuras construibles y puntos de interés del mapa. | *Monument*, *Town Hall*, *Altar of Ascension* |
| **dungeons** | Tipos de mazmorras y mecánicas de exploración. | *Underworld Portal*, *Beast Den*, *Dragon Roost* |
| **classes** | Clases y especializaciones del personaje. | *Beowulf*, *Heretic*, *Grand Summoner*, *Gilgamesh* |

---

## 🔍 Capacidades de Búsqueda y Filtrado

1. **Barra de Subcategorías Dinámicas (Pills)**:
   - Novedad de la versión `1.3.0`. Al seleccionar una categoría (ej: `items`), se despliega una hilera de etiquetas deslizables que deducen subtipos: *Staff, Dagger, Curved Sword, Helmet, Robe, Accessory, Material*, etc.
2. **Selector de Tier (T1 a T11)**:
   - Filtrado rápido según el nivel de progresión del jugador, desde principiante (Tier 1) hasta Tier Celestial / Tier 11 (T11).
3. **Filtros Especiales**:
   - Selector de rareza: *Común, Fino, Superior, Famoso, Legendario, Adornado (Ornate)*.
   - Conmutador para ítems **Arisen** (versiones ascendidas/potenciadas de fin de juego).
   - Conmutador para ítems **Exotic** (ítems limitados o de eventos especiales).
4. **Búsqueda Bilingüe en Vivo**:
   - El motor busca tanto en nombres en inglés como en español de forma transparente.

---

## ⚡ Almacenamiento Offline & Sincronización Web

- Toda la información reside en la base de datos **IndexedDB** local del navegador o dispositivo móvil (`lastcodex_offline_db` v3).
- No requiere conexión continua para operar.
- Cuenta con un comprobador de actualizaciones en segundo plano que consulta si PlayOrna ha agregado nuevas entradas mediante [[CodexService]] y permite sincronización en vivo guiada por barra de progreso.

---

## 🔗 Sinapsis Relacionadas
- Ver servicio y consultas IndexedDB: [[CodexService]]
- Ver modelo de datos: [[Modelo CodexEntry]]
- Ver interfaz del códice: [[CodexPage - Explorador del Códice]]
- Ver vista especializada de clases: [[CodexClassesPage - Clases y Habilidades]]
