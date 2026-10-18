# DEVELOPMENT RULES — LastResources (LastCodex)

> Estas reglas son obligatorias salvo que el propietario del proyecto autorice explícitamente una excepción.

## 1. Regla Fundamental
ANTES DE MODIFICAR EL CÓDIGO:
1. Analizar la tarea.
2. Identificar archivos afectados.
3. Revisar componentes relacionados.
4. Revisar dependencias.
5. Revisar `docs/PROJECT_CONTEXT.md`.
6. Identificar posibles efectos secundarios.
7. Proponer el enfoque cuando la modificación sea importante.

## 2. Reglas de Modificación
- **Regla 1 — No reconstruir innecesariamente**: Modificaciones quirúrgicas y localizadas. No refactorizar módulos no solicitados.
- **Regla 2 — Reutilización**: Verificar componentes y utilidades existentes antes de duplicar (usar `src/app/utils/` y servicios existentes).
- **Regla 3 — No romper funcionalidades existentes**: Preservar contratos e interfaces en modelos (`src/app/models/`).
- **Regla 4 — No cambiar tecnologías sin autorización**: Mantener Angular 22, Ionic 9, Capacitor 8 y Electron 44.
- **Regla 5 — Dependencias mínimas**: Priorizar paquetes ya instalados. No añadir bibliotecas de terceros sin justificación.
- **Regla 6 — Estabilidad de Rutas**: No cambiar URLs/rutas en `tabs-routing.module.ts` ni en los aliases heredados sin justificación explícita.
- **Regla 7 — Integridad de Base de Datos y Datos**: Cambios no destructivos en estructuras JSON locales para no romper la compatibilidad con versiones previas de datos cacheados en clientes.
- **Regla 8 — Seguridad Estricta**: Cero credenciales, claves privadas o tokens en código o assets públicos.
- **Regla 9 — Variables de Entorno**: Usar configuración centralizada y mantener compatibilidad con plataformas móviles y de escritorio.
- **Regla 10 — Consistencia UI/UX**: Respetar el sistema de diseño visual de Ionic y las variables de tema en SCSS (`src/theme/variables.scss`).

## 3. Reglas de Calidad
- Tipado estricto en TypeScript sin `any` injustificado.
- Manejo proactivo de estados en vistas: carga, vacío y error.
- Responsive design garantizado para móviles (pantallas pequeñas), tablets y monitores de escritorio (Electron).
- Separación estricta de responsabilidades entre lógica (servicios) y presentación (componentes/páginas).

## 4. Reglas para Agentes de IA
1. Comprender la solicitud del usuario antes de tocar código.
2. Inspeccionar únicamente lo necesario para evitar sobrecostos de contexto y lecturas masivas.
3. Consultar `docs/PROJECT_CONTEXT.md` y `docs/DEVELOPMENT_RULES.md` como fuente de verdad.
4. Delimitar la edición quirúrgica a las líneas o funciones exactas involucradas.
5. Implementar el cambio sin alterar código periférico.
6. Verificar que la compilación (`ng build` o `ng lint`) no introduzca regresiones.
7. Actualizar la sección 'Última actualización' de `docs/PROJECT_CONTEXT.md` siempre que se modifiquen rutas, modelos o dependencias clave.
