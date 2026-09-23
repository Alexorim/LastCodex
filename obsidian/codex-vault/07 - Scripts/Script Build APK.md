---
title: "Script Build APK"
type: script
tags:
  - "#script"
  - "#automatizacion"
  - "#android"
  - "#build"
version: 1.3.0
created: 2026-09-23
---

# 🤖 Script Build APK (`scripts/build-apk.js`)

`build-apk.js` es un script de Node.js diseñado para automatizar por completo el pipeline de compilación de Android con Capacitor y Gradle, versionado de binarios y actualización de referencias en la app.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Plataforma: [[Plataforma Android y Capacitor]]
- Versiones: [[02 - Versiones y Changelog]]
- Vista Impactada: [[SettingsPage - Configuración]]

---

## 🔄 Flujo de Trabajo Automatizado

1. **Lectura de Versión**:
   - Lee `version` directamente de `package.json` (ej: `1.3.0`).
2. **Sincronización Web con Capacitor**:
   - Compila la aplicación Angular en modo producción (`ng build --configuration production`).
   - Ejecuta `npx cap sync android` para transferir los nuevos bundles web a la carpeta nativa `android/app/src/main/assets/public`.
3. **Invocación de Gradle**:
   - Lanza el script `gradlew.bat assembleRelease` dentro del directorio `android/`.
4. **Copia y Versionado de Binarios**:
   - Localiza el APK generado en `android/app/build/outputs/apk/release/app-release-unsigned.apk`.
   - Limpia APKs antiguas en `release/` y `src/assets/`.
   - Copia y renombra el binario como `lastcodex_1.3.0.apk` en ambas ubicaciones:
     - `release/lastcodex_1.3.0.apk` (para archivo local)
     - `src/assets/lastcodex_1.3.0.apk` (para descarga directa desde la app o GitHub)
5. **Actualización de Enlaces en Configuración**:
   - Actualiza la constante de versión en `src/app/pages/settings/settings.page.ts` para que el botón de descarga apunte automáticamente al nuevo archivo.

---

## 💻 Ejecución

```bash
npm run build:apk
```

---

## 🔗 Sinapsis Relacionadas
- Ver plataforma Android: [[Plataforma Android y Capacitor]]
- Ver control de versiones: [[02 - Versiones y Changelog]]
- Ver pantalla de configuración: [[SettingsPage - Configuración]]
