---
title: "BackButtonService"
type: service
tags:
  - "#servicio"
  - "#android"
  - "#capacitor"
  - "#hardware"
version: 1.3.0
created: 2026-09-23
---

# 🔙 BackButtonService (`back-button.service.ts`)

`BackButtonService` gestiona de manera centralizada la pulsación del botón físico o por gestos de retroceso en dispositivos Android utilizando el plugin nativo de Capacitor `@capacitor/app`.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Plataforma: [[Plataforma Android y Capacitor]]
- Vistas Impactadas: [[HomePage - Forecast Hoy y Mañana]], [[CodexPage - Explorador del Códice]], [[SettingsPage - Configuración]]

---

## 📱 Comportamiento de Navegación

1. **Jerarquía de Cierre de Modales**:
   - Si un modal o alerta de Ionic está abierto (ej: el modal de detalle de un material o ítem del Códice), pulsar atrás cierra primero el modal sin alterar la ruta del navegador.
2. **Navegación Histórica**:
   - Si el usuario se encuentra en una sub-ruta (ej: `codex/classes` o `settings`), la pulsación retrocede a la pantalla previa.
3. **Confirmación de Salida en Home**:
   - Si el usuario se encuentra en la pantalla raíz ([[HomePage - Forecast Hoy y Mañana]]), una primera pulsación muestra un Toast informando: *"Presione atrás nuevamente para salir"*. Si se presiona dentro de un intervalo de 2 segundos, invoca `App.exitApp()`.

---

## 🔗 Sinapsis Relacionadas
- Ver plataforma Android: [[Plataforma Android y Capacitor]]
- Ver módulo de configuración: [[Módulo Configuración y Sistema]]
