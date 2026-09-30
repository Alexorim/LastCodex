---
title: "HomePage - Forecast Hoy y Mañana"
type: page
tags:
  - "#pagina"
  - "#vista"
  - "#home"
  - "#forecast"
version: 1.3.0
created: 2026-09-23
---

# 🏠 HomePage — Forecast Hoy y Mañana (`home.page.ts`)

`HomePage` es la pantalla inicial y el centro de mando de la aplicación. Brinda información inmediata sobre los materiales disponibles hoy en las tiendas de gremios y el pronóstico confirmado para el día de mañana.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Módulo: [[Módulo Forecast de Gremios]], [[Módulo Calculadora de Pruebas de Gremios]], [[Módulo Rastreador de Eventos]]
- Servicios Inyectados: [[MaterialsService]], [[TimerService]], [[SettingsService]], [[ProofsService]]
- Vistas Vinculadas: [[ProofsPage - Calculadora de Pruebas]], [[EventsPage - Eventos en Vivo]]
- Utilidades: [[Forecast Canvas]], [[Iconos y Sprites]], [[Traducciones y Mapeo de Nombres]]
- Modelos: [[Modelo DayForecast y GuildStock]]

---

## 📱 Componentes y Secciones Visuales

1. **Header Principal**:
   - Título con logotipo de LastResources.
   - Grupo de acciones rápidas:
     - **Botón de Eventos**: Acceso directo al calendario y cuenta regresiva de eventos en vivo de Orna.
     - **Botón de Calculadora**: Acceso directo e instantáneo a [[ProofsPage - Calculadora de Pruebas]] para estimación de materiales y monedas de gremio.
   - Tarjeta de cuenta regresiva (*Guild Reset Countdown*) y botón de refresco manual.
2. **Tarjeta de Cuenta Regresiva (Reset Countdown)**:
   - Contador en tiempo real conectado a `TimerService.countdown$`.
   - Muestra las horas y minutos restantes hasta las 00:00 UTC.
   - Indicador de alerta ámbar si la aplicación está dentro de la ventana de actualización (*stale window*).
3. **Segmento Hoy / Mañana (Segment Tabs)**:
   - Alternador rápido para conmutar entre los stocks de **Hoy (Today)** y **Mañana (Tomorrow)**.
4. **Tarjetas de Gremios (Guild Cards)**:
   - Secciones dedicadas para cada uno de los 4 gremios:
     - 🏛️ **Monument Guild**
     - 🩸 **Circle of Anguish**
     - ⚔️ **Blades of Finesse**
     - ⛏️ **Spelunking Guild**
   - Cada tarjeta lista los materiales con su ícono temático, rareza y nombre en el idioma activo.
5. **Modal de Detalle de Material**:
   - Al pulsar un material, se despliega un diálogo con el sprite ampliado, descripción, usos y botón para consultar su ficha en el códice con [[CodexService]].

---

## 🔗 Sinapsis Relacionadas
- Ver servicio de materiales: [[MaterialsService]]
- Ver servicio de cuenta regresiva: [[TimerService]]
- Ver generador de infografías: [[Forecast Canvas]]
