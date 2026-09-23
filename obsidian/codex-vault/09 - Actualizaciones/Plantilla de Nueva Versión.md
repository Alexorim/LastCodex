---
title: "Plantilla de Nueva Versión"
type: template
tags:
  - "#plantilla"
  - "#actualizacion"
  - "#guia"
version: 1.3.0
created: 2026-09-23
---

# 📋 Plantilla para Registrar Nuevas Versiones en Obsidian

Utiliza este protocolo cada vez que el proyecto **LastCodex** cambie de versión (ejemplo: `v1.3.1`, `v1.4.0`, etc.) para mantener actualizada la red neuronal de conocimiento.

---

## 🛠️ Paso a Paso para una Nueva Versión

1. **Crear una nueva nota** en la carpeta `09 - Actualizaciones/` siguiendo la nomenclatura:
   `vX.Y.Z - [Nombre Corto o Tema Principal].md`
2. **Copiar y rellenar la plantilla** que figura más abajo.
3. **Actualizar el Changelog Maestro**:
   - Abre `09 - Actualizaciones/00 - Registro de Actualizaciones (Changelog Maestro).md`.
   - Agrega la nueva fila en la tabla de hitos con su respectivo `[[enlace]]`.
4. **Actualizar la nota general de versiones**:
   - Abre `01 - General/02 - Versiones y Changelog.md` y actualiza el número de versión activa y los binarios generados.
5. **Conectar las sinapsis**:
   - Enlaza en la nueva nota los servicios, páginas, scripts o componentes que hayan sido modificados con `[[NombreDeNota]]`.

---

## 📄 Plantilla Markdown (Copiar y Pegar)

```markdown
---
title: "vX.Y.Z - [Nombre o Hito Principal]"
type: changelog-entry
tags:
  - "#actualizacion"
  - "#version-actual" # (cambiar a #version-previa en la versión anterior)
  - "#vX-Y-Z"
version: X.Y.Z
created: YYYY-MM-DD
---

# 🚀 Versión X.Y.Z — [Nombre o Hito Principal]

- **Estado**: Producción (Versión Activa)
- **Fecha**: [Mes y Año]
- **Tag en Repositorio**: `vX.Y.Z`
- **Compilación Android**: VersionCode `[Código]`, VersionName `X.Y.Z`

Conexiones en la red:
- Nodo Padre: [[00 - Registro de Actualizaciones (Changelog Maestro)]]
- Versión Previa: [[vX.Y.(Z-1) - Nombre]]
- Componentes Afectados: [[NombreDePagina]], [[NombreDeServicio]]
- Scripts Ejecutados: [[Script Build APK]]

---

## 🌟 Principales Características Implementadas

### 1. [Nombre de Funcionalidad 1]
- **Descripción**: Detalle de qué hace la nueva función y por qué se añadió.
- **Componentes impactados**: [[Página O Servicio]].

### 2. [Nombre de Funcionalidad 2 / Corrección]
- **Descripción**: Problema solucionado o mejora de rendimiento.

---

## 💻 Registro de Commits (vX.Y.Z)

| Commit | Mensaje | Impacto |
| :--- | :--- | :--- |
| `abcdef1` | `feat: ...` | [[Componente Modificado]] |
| `1234567` | `fix: ...` | Corrección de bug |

---

## 🔗 Sinapsis Relacionadas
- Ver changelog maestro: [[00 - Registro de Actualizaciones (Changelog Maestro)]]
- Ver versión anterior: [[vX.Y.(Z-1) - Nombre]]
```

---

## 🔗 Sinapsis Relacionadas
- Volver al changelog maestro: [[00 - Registro de Actualizaciones (Changelog Maestro)]]
- Ver versión activa actual: [[v1.3.0 - Renacimiento LastCodex, Subcategorías y APK Versionada]]
