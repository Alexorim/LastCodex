---
title: "Plataforma Android y Capacitor"
type: platform
tags:
  - "#plataforma"
  - "#android"
  - "#capacitor"
  - "#mobile"
version: 1.3.0
created: 2026-09-23
---

# 🤖 Plataforma Android y Capacitor

**LastCodex** está empaquetada como una aplicación nativa para Android mediante **Capacitor 8.5.2**, ofreciendo acceso al hardware, aceleración gráfica y manejo de eventos del sistema operativo móvil.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Stack: [[04 - Stack Tecnológico]]
- Scripts de Automatización: [[Script Build APK]], [[Script Generador de Íconos]]
- Servicios Nativos: [[BackButtonService]]
- Ajustes y Descargas: [[SettingsPage - Configuración]], [[02 - Versiones y Changelog]]

---

## ⚙️ Configuración (`capacitor.config.ts`)

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.orna.forecast',
  appName: 'LastResources',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1F1F1F'
    },
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#1F1F1F',
      showSpinner: false
    }
  }
};

export default config;
```

---

## 📦 Plugins Nativos de Capacitor Integrados

| Plugin | Versión | Rol en la Aplicación |
| :--- | :--- | :--- |
| `@capacitor/android` | `^8.5.2` | Plataforma nativa puente Android / Java / WebView. |
| `@capacitor/app` | `8.1.1` | Ciclo de vida y captura del evento `backButton` ([[BackButtonService]]). |
| `@capacitor/haptics` | `8.0.2` | Vibración sutil al interactuar con tabs, modales y botones. |
| `@capacitor/share` | `^8.0.2` | Compartir imágenes de infografías ([[Forecast Canvas]]) directamente en apps como Discord o WhatsApp. |
| `@capacitor/filesystem` | `^8.1.3` | Guardado en la memoria local del dispositivo de imágenes generadas. |
| `@capacitor/status-bar` | `8.0.3` | Personalización del color y contraste de la barra de estado superior. |

---

## 🚀 Compilación y Salida

- El proyecto Android reside en el directorio `android/`.
- La compilación se realiza a través de Gradle mediante el script automatizado [[Script Build APK]]:
  ```bash
  npm run build:apk
  ```
- El artefacto final generado es `lastcodex_1.3.0.apk`, disponible en `release/` y `src/assets/`.

---

## 🔗 Sinapsis Relacionadas
- Ver script de build automatizado: [[Script Build APK]]
- Ver generador de íconos para Android: [[Script Generador de Íconos]]
- Ver servicio de botón de retroceso: [[BackButtonService]]
