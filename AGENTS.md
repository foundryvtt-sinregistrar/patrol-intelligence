# AGENTS.md — Patrol Intelligence

## Objetivo
Crear `patrol-intelligence` como complemento independiente de Patrol para Foundry VTT 14 y sistema D&D5e. Permitir modo autónomo del PNJ y toma/restitución de control exclusiva por el DM. El DM siempre prevalece.

## Documento rector
Leer `docs/PATROL-INTELLIGENCE-ESPECIFICACION-CODEX.md` antes de intervenir. El contenido es una propuesta pendiente de validación; no tratar como API comprobadas los contratos conceptuales.

## Versiones a validar
- **Sistema objetivo confirmado por el usuario: D&D5e 6.0.6** sobre Foundry VTT 14. El informe aportado registra Foundry **14.368** + D&D5e **6.0.6** en el mundo revisado el **26-10-2026**.
- La referencia al checkout del sistema **6.0.5** en ese informe es histórica: **no** cambiar el objetivo de este módulo a 6.0.5.
- Confirmar en el entorno de ejecución las versiones efectivas de Foundry, D&D5e **6.0.6** y Patrol. La versión exacta de Patrol sigue pendiente de comprobación.

## Fase actual: 0 — investigación de solo lectura
1. Inspeccionar la presencia y versión efectiva de Patrol y sus hooks `prePatrolSuspicious`, `patrolSuspicious`, `prePatrolAlerted`, `patrolAlerted`, `prePatrolSpotted`, `patrolSpotted` en esa versión.
2. Validar tipos de los argumentos, eventos realmente emitidos y duplicados entre clientes.
3. Investigar una vía **estable** para pausar/reanudar Patrol en un token individual sin afectar al resto. La selección manual del token no es suficiente para la toma persistente de control.
4. Inspeccionar el esquema real de estadísticas D&D5e (Percepción, Sigilo, Inteligencia) y las APIs de movimiento/visibilidad de Foundry 14.
5. Examinar el modelo de autoridad: un solo DM ejecutor, seguridad y ausencia de acciones duplicadas.
6. Documentar conclusiones y pruebas propuestas en `docs/INTEGRATION-RESEARCH.md` SOLO si se autoriza crear archivos; de momento entregar el informe en el chat.
7. Indicar `GO`, `NO-GO` o `GO condicionado` antes de proponer la fase 1.

## Restricciones
- No modificar el código del sistema D&D5e, Patrol ni otros módulos.
- No inventar APIs ni parchear métodos privados como solución definitiva.
- No utilizar un LLM para las decisiones en el MVP: usar reglas deterministas.
- No iniciar combates ni alterar personajes jugadores automáticamente en el MVP.
- No comenzar fases de implementación sin autorización.
- Diferenciar siempre evidencia, inferencias y cuestiones pendientes.
- Priorizar modificaciones mínimas y bajo consumo de contexto.
