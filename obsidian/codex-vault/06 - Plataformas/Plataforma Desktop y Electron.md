---
title: "Plataforma Desktop y Electron"
type: platform
tags:
  - "#plataforma"
  - "#desktop"
  - "#electron"
  - "#windows"
version: 1.3.0
created: 2026-09-23
---

# 🖥️ Plataforma Desktop y Electron

**LastCodex** ofrece soporte de escritorio para Windows mediante **Electron 44** y **Electron Builder 26**, permitiendo ejecutar la herramienta como una aplicación de ventana nativa independiente sin necesidad de un navegador web abierto.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Stack: [[04 - Stack Tecnológico]]
- Control de Versiones: [[02 - Versiones y Changelog]]
- Salida en Disco: Carpeta `release/`

---

## ⚙️ Archivo Principal (`electron-main.js`)

El proceso principal de Electron:
1. Crea una instancia de `BrowserWindow` con resolución estándar (1200x800) y tema oscuro.
2. Inhabilita `nodeIntegration` y habilita `contextIsolation` por motivos de seguridad moderna.
3. Carga el bundle web compilado en `www/index.html`.
4. Controla atajos de teclado y menú de aplicación.

---

## 📦 Configuración de Empaquetado (`package.json`)

```json
"build": {
  "appId": "com.lastresources.app",
  "productName": "LastResources",
  "files": [
    "electron-main.js",
    "www/**/*"
  ],
  "directories": {
    "output": "release"
  },
  "win": {
    "target": [
      {
        "target": "dir",
        "arch": ["x64"]
      },
      {
        "target": "portable",
        "arch": ["x64"]
      }
    ]
  }
}
```

---

## 🚀 Comandos de Construcción

```bash
# Ejecutar localmente con Electron
npm run electron

# Generar directorio descomprimido de Windows
npm run dist:win

# Generar binario ejecutable portable .exe
npm run dist:win:exe
```

Los ejecutables generados se almacenan en la carpeta `release/` (ej: `LastCodex 1.0.0.exe` o `win-unpacked`).

---

## 🔗 Sinapsis Relacionadas
- Ver stack general: [[04 - Stack Tecnológico]]
- Ver arquitectura: [[03 - Arquitectura del Sistema]]
