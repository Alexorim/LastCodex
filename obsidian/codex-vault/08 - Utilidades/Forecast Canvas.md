---
title: "Forecast Canvas"
type: utility
tags:
  - "#utilidad"
  - "#canvas"
  - "#graficos"
  - "#compartir"
version: 1.3.0
created: 2026-09-23
---

# 🎨 Forecast Canvas (`forecast-canvas.util.ts`)

`Forecast Canvas` es una utilidad gráfica diseñada para rasterizar los stocks de gremios en una imagen infográfica estilizada, limpia y lista para compartir en comunidades de Discord o mensajería instantánea.

Conexiones:
- Nodo Padre: [[00 - Nodo Central (MOC) - LastCodex]]
- Módulo: [[Módulo Forecast de Gremios]]
- Vistas Consumidoras: [[HomePage - Forecast Hoy y Mañana]]
- Librería Externa: `html-to-image`
- Iconos y Gráficos: [[Iconos y Sprites]]
- Servicios Móviles: `@capacitor/share`, `@capacitor/filesystem` ([[Plataforma Android y Capacitor]])

---

## 📸 Funcionamiento y Flujo de Exportación

1. **Aislamiento del Contenedor DOM**:
   - Localiza el elemento del pronóstico actual en el árbol HTML.
2. **Aplicación de Estilo Infográfico**:
   - Ajusta fondos, añade el emblema dorado de LastCodex, la fecha actual y la firma comunitaria.
   - En la versión `1.3.0` se corrigió para suprimir textos redundantes o mensajes genéricos por defecto.
3. **Conversión a PNG (`html-to-image`)**:
   - Rasteriza el DOM a un `dataURL` / Blob PNG en alta resolución (2x para pantallas Retina).
4. **Despacho Nativo o Descarga Web**:
   - En Android: Invoca `@capacitor/share` para abrir la hoja de compartir nativa del sistema.
   - En Web/Escritorio: Desencadena una descarga automática del archivo `lastcodex_forecast_YYYY-MM-DD.png`.

---

## 🔗 Sinapsis Relacionadas
- Ver pantalla principal de pronóstico: [[HomePage - Forecast Hoy y Mañana]]
- Ver módulo de pronóstico: [[Módulo Forecast de Gremios]]
- Ver librería de sprites e iconos: [[Iconos y Sprites]]
