---
title: "TimerService"
type: service
tags:
  - "#servicio"
  - "#temporizador"
  - "#tiempo"
  - "#logica"
version: 1.4.5
created: 2026-09-23
updated: 2026-09-29
---

# ⏱️ TimerService (`timer.service.ts`)

`TimerService` gestiona la sincronización temporal con el reloj universal (UTC) del servidor del juego, controlando la cuenta atrás hacia el reseteo diario y emitiendo eventos de ciclo de vida.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Módulo: [[Módulo Forecast de Gremios]], [[Módulo Torres Celestiales]]
- Vistas Consumidoras: [[HomePage - Forecast Hoy y Mañana]], [[TowersPage - Torres Celestiales]], [[SettingsPage - Configuración]]
- Servicio Hermano: [[MaterialsService]], [[NotificationsService]]

---

## 🕒 Reglas del Servidor y Horario de Reseteo

1. **Hora de Reseteo Oficial**:
   - Sincronizado para dispararse a las **05:00:00 UTC** (equivalente a las **12:00 AM Medianoche UTC-5** / Hora del servidor de materiales).
2. **Ventana Stale (Stale Window)**:
   - Intervalo de 15 a 30 minutos inmediatamente posterior al reseteo.
   - Durante este periodo, los servidores de Google Sheets pueden demorar en asentar las nuevas rotaciones observadas por los scouts de la comunidad.
   - `isInStaleWindow()` advierte a la interfaz que muestre un indicador de advertencia al usuario.

---

## 🌊 Observables y Métodos Clave

| Miembro | Tipo | Descripción |
| :--- | :--- | :--- |
| `countdown$` | `Observable<string>` | String formateado en tiempo real `HH:MM:SS` restante para el próximo reset. |
| `dayReset$` | `Observable<void>` | Emisión puntual en el instante exacto del reseteo. |
| `isInStaleWindow()` | `boolean` | Devuelve `true` si el momento actual está dentro de la ventana de actualización. |
| `getLocalResetTime()` | `string` | Convierte la hora de reseteo a la hora local del dispositivo móvil (ej: medianoche local según la zona horaria). |

---

## 🔗 Sinapsis Relacionadas
- Ver servicio de pronóstico: [[MaterialsService]]
- Ver servicio de torres: [[TowersService]]
- Ver pantalla de inicio: [[HomePage - Forecast Hoy y Mañana]]
