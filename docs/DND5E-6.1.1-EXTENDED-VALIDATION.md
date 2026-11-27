# Pruebas ampliadas de Patrol Intelligence · 27-11-2026

Foundry 14.370, D&D5e 6.1.1 y Patrol 5.0.12, mundo aislado `qa-dnd5e611-adventures`. Complementa la [validación de detección y dos GM](DND5E-6.1.1-VALIDATION.md).

## Ejecución y resultados

Se creó la escena temporal `FNESAlGu1ESbA408`, un guardia, un personaje propiedad de un jugador temporal y una sesión real de ese jugador en un contexto de navegador independiente. Se activó la escena solo durante las pruebas. Intelligence estuvo habilitado para el guardia, en AUTO, con aprobación ALWAYS.

| Caso | Resultado |
| --- | --- |
| Jugador conectado durante una detección visible | Cola del jugador vacía y ninguna notificación de propuesta; el GM recibió una propuesta INVESTIGATE. Un observador temporal del DOM de notificaciones del jugador no registró contenido del guardia. |
| Jugador intenta aprobar | Error `only a GM can resolve a proposal`. |
| Jugador intenta configurar el token | Error `only a GM can change token configuration`. |
| Juego pausado | El paso nativo de Patrol no emitió hooks ni propuestas. |
| Combate de prueba iniciado | El paso nativo tampoco emitió hooks ni propuestas. El combate se eliminó al terminar el caso. |
| Defensa propia de Intelligence en pausa y combate | Una llamada diagnóstica al productor real `spotEnemy({aboutToSuspect: true})` del objeto devuelto por el lookup de Patrol emitió los hooks pre/post con objetivo visible. En ambos casos la cola permaneció vacía. No se parchearon métodos ni se fabricaron hooks. |
| Objetivo oculto | El productor de Patrol devolvió 0; sin hooks ni propuestas. |
| Pared opaca entre guardia y objetivo | Devolvió 0; sin hooks ni propuestas. |
| Estado Patrol Undetectable | Devolvió 0; sin hooks ni propuestas. |
| Objetivo sin iluminar fuera de visión en la oscuridad | A 40 ft, con visión en la oscuridad de 20 ft y luz global desactivada, devolvió 0; sin hooks ni propuestas. |
| Objetivo iluminado fuera de basicSight | Foundry mantuvo lightPerception con alcance Infinity. La detección con luz global fue correcta; limitar basicSight a 20 ft no limita la visión de un objetivo iluminado a 40 ft. |
| Recarga | La configuración opt-in del guardia persistió; las propuestas siguen siendo locales y no persistentes, como establece el diseño. |

La llamada diagnóstica al productor sirve para ejercitar las defensas del observador cuando el paso normal está bloqueado; no se incorpora como contrato de ejecución del complemento. No se implementa movimiento, control exclusivo ni ejecución de propuestas.

## Comprobaciones y limpieza

- Nueve pruebas de Node correctas, cero fallos.
- Cerrado el navegador temporal; eliminados usuario, actores, tokens, pared, combate y escena de prueba. Restauradas escena activa y vista originales, pausa, ajustes y activación original del módulo.
- Sin cambios de JavaScript ni de esquema. La ampliación cubre los casos concretos anteriores; no pretende certificar todas las combinaciones de visión o combate de terceros.

## Reanudación

Ampliación de jugador, pausa, combate y visión completada. Pendiente únicamente la revisión de distribución, independiente de las funciones aún no implementadas del MVP.
