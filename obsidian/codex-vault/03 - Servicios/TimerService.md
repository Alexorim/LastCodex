---
title: "TimerService"
type: service
tags:
  - "#servicio"
  - "#temporizador"
  - "#tiempo"
  - "#logica"
version: 1.3.0
created: 2026-09-23
---

# ⏱️ TimerService (`timer.service.ts`)

`TimerService` gestiona la sincronización temporal con el reloj universal (UTC) del servidor del juego, controlando la cuenta atrás hacia el reseteo diario y emitiendo eventos de ciclo de vida.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Módulo: [[Módulo Forecast de Gremios]]
- Vistas Consumidoras: [[HomePage - Forecast Hoy y Mañana]], [[SettingsPage - Configuración]]
- Servicio Hermano: [[MaterialsService]]

---

## 🕒 Reglas del Servidor de Orna

1. **Hora de Reseteo Global**:
   - Ocurre todos los días a las **00:00:00 UTC**.
2. **Ventana Stale (Stale Window)**:
   - Intervalo de 15 a 30 minutos inmediatamente posterior al reseteo (de 00:00 UTC a 00:30 UTC).
   - Durante este periodo, los servidores de Google Sheets pueden demorar en asentar las nuevas rotaciones observadas por los scouts de la comunidad.
   - `isInStaleWindow()` advierte a la interfaz que muestre un indicador de advertencia al usuario.

---

## 🌊 Observables y Métodos Clave

| Miembro | Tipo | Descripción |
| :--- | :--- | :--- |
| `countdown$` | `Observable<string>` | String formateado en tiempo real `HH:MM:SS` restante para el próximo reset. |
| `dayReset$` | `Observable<void>` | Emisión puntual en el instante exacto del cruce de medianoche UTC. |
| `isInStaleWindow()` | `boolean` | Devuelve `true` si el momento actual está dentro de la ventana de actualización. |
| `getLocalResetTime()` | `string` | Convierte las 00:00 UTC a la hora local del dispositivo móvil (ej: `19:00` en UTC-5). |

---

## 🔗 Sinapsis Relacionadas
- Ver servicio de pronóstico: [[MaterialsService]]
- Ver pantalla de inicio: [[HomePage - Forecast Hoy y Mañana]]
