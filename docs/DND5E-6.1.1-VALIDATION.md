# Validación de Patrol Intelligence en D&D5e 6.1.1

Fecha: 27 de noviembre de 2026. Resultado: superadas las comprobaciones pendientes de detección real y dos clientes GM para el complemento pasivo existente.

## Entorno

- Versiones comprobadas en ejecución y en los manifiestos instalados: Foundry VTT 14.370, D&D5e 6.1.1, Patrol 5.0.12 y Patrol Intelligence 0.1.0.
- Mundo aislado `qa-dnd5e611-adventures`, navegador integrado conectado a `http://localhost:31471/game`.
- Dos clientes de navegador con contextos y sesiones independientes: `Gamemaster` (`n7wqQLVXaQGpIZBq`) y el GM temporal `QA Patrol GM 2` (`Y441DJy5TqLWf0r1`). Ambos conectados simultáneamente durante las pruebas de autoridad.
- Escena temporal `QA 6.1.1 Patrol` (`jYdT11Rvtr8oLh3K`), cuadrícula de 100 px/5 ft, iluminación global y sin paredes. Un PNJ guardia y un personaje con propietario jugador temporal; no se conectó un cliente jugador.
- Guardia `Scene.jYdT11Rvtr8oLh3K.Token.ti9scRkx4dpecsCI`, personaje `Scene.jYdT11Rvtr8oLh3K.Token.mv7jjA8DKGdczTKF`. Visión básica del guardia de 60 ft y separación inicial de 15 ft.
- Patrol habilitado para el guardia, detección habilitada, pasos automáticos globales desactivados. Intelligence opt-in, modo `AUTO`, perfil `GUARD`, política `ALWAYS` y cooldown de 600.000 ms para contar todas las propuestas y comprobar los reintentos.

## Método

Se usó la API exportada de la versión instalada, `game.modules.get("patrol").API.patrol.stepToken(token, false)`, para avanzar Patrol por sus estados reales. Se observaron los seis hooks mediante listeners temporales; no se llamaron artificialmente con `Hooks.call` ni se modificaron métodos privados. Se reinició la posición del guardia solo entre ciclos de prueba.

Los hooks entregaron dos objetos `Token5e`, con los UUID correctos de guardia y personaje: `prePatrolSuspicious`, `patrolSuspicious`, `prePatrolAlerted`, `patrolAlerted`, `prePatrolSpotted` y `patrolSpotted`. La lectura del adaptador coincide con las estadísticas preparadas del PNJ de prueba: Inteligencia 12, modificador +1, Percepción total +2/pasiva 12 y Perspicacia, Investigación y Sigilo +2.

## Resultados

| Caso | Evidencia observada |
| --- | --- |
| Dos GM conectados | Foundry designó `QA Patrol GM 2` como `activeGM`; ambos clientes vieron la misma autoridad. |
| Ciclo ejecutado desde el GM no designado | Los seis hooks reales se emitieron, Patrol pasó por sospecha y alerta y pausó al detectar. Cola de Intelligence vacía y ninguna notificación de propuesta en ese cliente. |
| Ciclo desde el GM designado | Seis hooks y exactamente tres propuestas: `INVESTIGATE` por sospecha, `WARN` por alerta y `WARN` por detección. Los pares pre/post no duplicaron las propuestas. |
| Repetición completa dentro del cooldown | Otros seis hooks, ninguna propuesta nueva; la cola conservó sus tres entradas. Pasó con debug desactivado tras probar el primer ciclo con debug activado. |
| Resolución desde el GM no designado | Rechazada: `only the active GM can resolve a proposal`. |
| Aprobar y rechazar desde el GM designado | Estados `APPROVED` y `REJECTED`; la instantánea completa de los TokenDocuments permaneció idéntica. Repetir la resolución devolvió `null`. |
| Cambio a modo DM | Incrementó la generación a 1; resolver la propuesta pendiente devolvió `STALE`. No cambió posición ni flags de Patrol. |
| Relevo de GM | Cerrada la sesión aislada del segundo GM, Foundry designó al GM original. Tras volver a `AUTO`, un nuevo ciclo real produjo exactamente tres propuestas en ese cliente, antes vacío. |
| Token sin configurar | Otro token, con cooldown independiente, emitió sospecha real de Patrol y no añadió propuestas de Intelligence. Configuración por defecto desactivada y `DM`. |
| Token habilitado en modo DM | Otro token emitió sospecha real de Patrol y no añadió propuestas de Intelligence. La patrulla externa continuó su transición. |
| Movimiento y pausa externos | En los ciclos completos, Patrol movió el guardia de `(200, 300)` a `(400, 300)` y pausó al detectar. Intelligence no bloqueó los pre-hooks. El personaje permaneció en `(500, 300)`. |

La cola del segundo GM terminó con una propuesta aprobada, una rechazada y una obsoleta. Las tres propuestas del GM original se invalidaron al terminar. Las propuestas no ejecutaron movimientos, combate, tiradas ni cambios de personajes.

## Limpieza y comprobaciones locales

- Cerrado el contexto de navegador temporal, retirados la escena, los dos actores, los dos usuarios y los tokens de prueba. Retirados los listeners temporales.
- Restaurados la vista de `toaCh2ChultMap00`, la pausa inicial, el ajuste debug desactivado y la activación original de Intelligence desactivada; recargado el cliente.
- Reloj mundial conservado en 0. Patrol y los restantes módulos mantienen su configuración original.
- `node --test tests/engine.test.mjs`: nueve pruebas correctas, cero fallos, Node.js 24.17.0.
- No se requieren cambios de ejecución ni de esquema. Se mantienen las versiones mínimas y la versión del complemento; el manifiesto registra D&D5e 6.1.1 y Patrol 5.0.12 como verificados.

## Alcance y límites

**GO condicionado** para la integración pasiva existente: observación, propuestas deterministas y resolución por el GM designado. El control manual exclusivo del PNJ y la ejecución de propuestas siguen sin implementar. No se certifica un contrato público estable de suspensión/reanudación individual en Patrol 5.0.12.

La cola, los cooldowns y las generaciones son locales y se pierden al cerrar o recargar el cliente; no se transfieren al nuevo GM. El relevo comprobó la autoridad y un ciclo nuevo, no la transferencia de propuestas pendientes. No se probó un cliente jugador conectado, combate activo, todas las restricciones de visión o todos los escenarios del checklist de release. Los avisos de Electron y de módulos ajenos no impidieron el flujo.

## Reanudación

Detección y ausencia de propuestas duplicadas con dos GM: comprobadas. No quedan módulos pendientes de los cinco puntos de compatibilidad con D&D5e 6.1.1. Evidencia preparada para integración local en `main`, sin push, tag ni release.
