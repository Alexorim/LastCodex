---
title: "SettingsPage - Configuración"
type: page
tags:
  - "#pagina"
  - "#vista"
  - "#configuracion"
  - "#sistema"
version: 1.4.5
created: 2026-09-23
updated: 2026-09-29
---

# ⚙️ SettingsPage — Configuración (`settings.page.ts`)

`SettingsPage` es el centro de control de preferencias del usuario, gestión de base de datos offline, verificación remota de versiones, configuración de alertas y enlaces al mapa y marco legal.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Módulos: [[Módulo Configuración y Sistema]], [[Módulo Notificaciones del Sistema]], [[Módulo Legal y Cumplimiento DMCA]], [[Módulo Mapa Interactivo de Ciudades y Marcadores]]
- Servicios Inyectados: [[SettingsService]], [[TimerService]], [[CodexService]], [[NotificationsService]], [[TowersService]]
- Automatización y Versiones: [[02 - Versiones y Changelog]], [[Script Build APK]], [[Plataforma Android y Capacitor]]

---

## 🛠️ Opciones y Paneles Disponibles

1. **Selector de Idioma**:
   - Soporte extendido para **22 idiomas**, adaptando textos de la interfaz dinámicamente mediante [[SettingsService]].
2. **Tema de la Aplicación**:
   - Selección entre temas visuales: *Codex Dark* (paleta café), *Tema Claro* (pergamino), *Sakura* (floral cerezo) y *Pure Black*.
3. **Alertas y Notificaciones de Torres**:
   - Switch / Check global para activar o desactivar notificaciones en el celular cuando **cualquier Torre Celestial alcance los 50 pisos**.
4. **Visor de Mapa y Acceso Cartográfico**:
   - Acceso directo hacia [[MapPage - Mapa Interactivo]] para explorar ciudades y marcadores.
5. **Zona Horaria y Reseteo Local**:
   - Muestra la zona horaria del sistema (`Intl.DateTimeFormat`) y calcula automáticamente la hora local de reseteo (05:00 UTC / 12:00 AM UTC-5).
6. **Estado del Códice Offline (IndexedDB)**:
   - Contador de entradas totales en `lastcodex_offline_db` (más de 5,000 ítems).
   - Botón para comprobar actualizaciones del Códice contra la fuente comunitaria.
   - Sincronización progresiva y purga segura de caché.
7. **Comprobador de Actualizaciones de la Aplicación (APK / Web)**:
   - Botón reactivo **"Buscar Actualizaciones"**: consulta el endpoint remoto en Vercel para comparar versiones.
   - Si se cuenta con la última versión, notifica al usuario que ya tiene la versión más reciente.
   - Si hay una versión superior, facilita la descarga directa del APK oficial (`lastcodex_stable.apk`).
8. **Exportar Baúl de Obsidian (Móvil)**:
   - Botón para descargar una copia comprimida (`.zip`) del baúl de notas de Obsidian directamente en el celular o PC.
9. **Aviso Legal, DMCA y Privacidad**:
   - Enlace directo a [[LegalPage - Aviso Legal y Privacidad]] con el descargo de responsabilidad, marcas registradas de Northern Forge y buzón DMCA.

---

## 🔗 Sinapsis Relacionadas
- Ver servicio de configuración: [[SettingsService]]
- Ver servicio de notificaciones: [[NotificationsService]]
- Ver aviso legal: [[LegalPage - Aviso Legal y Privacidad]]
- Ver mapa interactivo: [[MapPage - Mapa Interactivo]]
