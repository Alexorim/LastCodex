---
title: "Visión General y Propósito"
type: general
tags:
  - "#concepto"
  - "#general"
  - "#lastcodex"
version: 1.3.0
created: 2026-09-23
---

# 🌐 Visión General y Propósito del Proyecto

**LastCodex** (nacido inicialmente bajo el nombre **OrnaForecast** / **Orna Guild Material Forecast**) es una aplicación multiplataforma y suite de herramientas esenciales para jugadores de los títulos RPG de Northern Forge Studios: **Orna: The GPS RPG** y **Hero of Aethric**.

Conexión en la red:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Arquitectura: [[03 - Arquitectura del Sistema]]
- Módulos Principales: [[Módulo Forecast de Gremios]], [[Módulo Códice de Orna]], [[Módulo Rastreador de Eventos]]
- Plataformas: [[Plataforma Android y Capacitor]], [[Plataforma Desktop y Electron]], [[Plataforma Web y PWA]]

---

## 🎯 Problema que Resuelve

1. **Rotación Impredecible de Materiales de Gremios**:
   - En *Orna*, los gremios (*Monument Guild*, *Circle of Anguish*, *Blades of Finesse*, *Spelunking Guild*) rotan diariamente sus tiendas a las **00:00 UTC**.
   - Los jugadores de alto nivel (T10 / T11) necesitan planificar con semanas o meses de anticipación qué días gastar sus pruebas/monedas de gremio en materiales exóticos como *Ortanite*, *Pure Runestone*, *Cursed Ortanite*, etc.
   - **Solución de LastCodex**: El [[Módulo Forecast de Gremios]] proporciona predicción diaria, semanal y mensual gracias al algoritmo alimentado por datos de la comunidad, presentado en [[HomePage - Forecast Hoy y Mañana]] y [[CalendarPage - Calendario de Materiales]].

2. **Dificultad de Acceso al Códice en Vivo**:
   - La web oficial de PlayOrna puede resultar lenta o inaccesible con conexiones de datos móviles deficientes durante partidas en la calle.
   - No cuenta con filtros avanzados por subcategorías específicas (ej: diferenciar báculos de varitas, o cascos de sombreros) ni integración bilingüe instantánea.
   - **Solución de LastCodex**: El [[Módulo Códice de Orna]] implementa una base de datos local basada en [[CodexService]] e IndexedDB que funciona **100% offline**, con búsqueda instantánea, sprites empaquetados e interfaz optimizada para móviles.

3. **Comunicación en Gremios y Comunidades**:
   - Compartir qué materiales hay hoy en formato texto suele ser desordenado y propenso a errores.
   - **Solución de LastCodex**: Mediante [[Forecast Canvas]], la aplicación permite exportar imágenes infográficas estilizadas listas para publicar en Discord o WhatsApp con un solo clic.

---

## 👥 Público Objetivo

- **Jugadores de Fin de Juego (T9, T10 y T11 / Celestial / Ascensión)**:
  - Buscan optimizar sus materiales de mejora y no perderse rotaciones raras en Monumentos o Blades of Finesse.
- **Líderes y Oficiales de Reino (Kingdoms)**:
  - Generan y publican reportes diarios para sus miembros.
- **Nuevos Jugadores (T1 a T8)**:
  - Consultan estadísticas, monstruos, caídas de jefes y rutas de clases mediante [[CodexClassesPage - Clases y Habilidades]].

---

## 💎 Principios Clave de Diseño

| Principio | Implementación |
| :--- | :--- |
| **Offline-First** | Funcionalidad completa sin conexión gracias a IndexedDB y caché reactiva. |
| **Zero-Latency Search** | Filtrado local en memoria de más de 3,000 entradas en menos de 10ms. |
| **Bilingüe Nativo** | Soporte completo para nombres y descripciones en Español e Inglés gestionado por [[SettingsService]]. |
| **Multiplataforma Real** | Código único desplegado en Web (Vercel), Android (Capacitor) y Windows (Electron). |
| **Estética RPG Temática** | Diseño oscuro ("Codex Dark") inspirado en la interfaz del juego, con acentos dorados y runas. |

---

## 🔗 Sinapsis Relacionadas
- Ir a control de versiones: [[02 - Versiones y Changelog]]
- Ir a tecnologías empleadas: [[04 - Stack Tecnológico]]
- Ver servicio de persistencia: [[CodexService]]
