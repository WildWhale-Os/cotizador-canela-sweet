<!--
Sync Impact Report

Version change: template (no prior version) → 1.0.0

Modified principles:
- [PRINCIPLE_1_NAME] -> I. Calidad de Código
- [PRINCIPLE_2_NAME] -> II. Estándares de Pruebas
- [PRINCIPLE_3_NAME] -> III. Coherencia de Experiencia de Usuario
- [PRINCIPLE_4_NAME] -> IV. Rendimiento y Escalabilidad
- [PRINCIPLE_5_NAME] -> V. Observabilidad, Versionado y Documentación

Added sections:
- Requisitos y Restricciones (performance, accesibilidad, cobertura de tests)
- Flujo de Desarrollo y Puertas de Calidad (CI gates, code review, versioning)

Removed sections: none

Templates reviewed / impact:
- .specify/templates/plan-template.md ✅ reviewed — "Constitution Check" present and aligned
- .specify/templates/spec-template.md ✅ reviewed — User Scenarios & Testing already mandatory and aligned
- .specify/templates/tasks-template.md ⚠ pending — tasks-template treats tests as OPTIONAL; recommend update so test tasks are REQUIRED for P1 features per constitution
- .specify/templates/checklist-template.md ✅ reviewed — no immediate changes required
- .specify/templates/agent-file-template.md ✅ reviewed — no immediate changes required

Follow-up TODOs:
- TODO(RATIFICATION_DATE): Fecha de ratificación original no encontrada; por favor indicar la fecha de ratificación histórica si existe.
- Update `.specify/templates/tasks-template.md` to require test tasks for P1/P2 items and document coverage thresholds.
-->

# Cotizador Canela Sweet Constitution

## Core Principles

### I. Calidad de Código
El código DEBE (MUST) ser legible, consistente y verificable. Reglas concretas:

- El repositorio DEBE usar linters y formateadores configurados en el proyecto (por ejemplo: ESLint/Prettier, flake8/black, rubocop). Los resultados del linter/formateador DEBEN ejecutarse automáticamente en CI y fallar el pipeline si no se corrigen.
- Los cambios de código DEBEN pasar code review por al menos un revisor con privilegios de mantenimiento. Los PRs DEBEN describir el propósito, riesgos y pruebas realizadas.
- La complejidad ciclomática de funciones críticas DEBE mantenerse razonable; las funciones con complejidad alta DEBEN refactorizarse o justificarse en la PR.
- El código DEBE incluir comentarios y documentación mínima para APIs públicas y comportamientos no triviales. Los cambios que alteren la interfaz pública DEBEN actualizar la documentación correspondiente.

Rationale: Mantener calidad reduce deuda técnica y facilita revisiones, despliegues seguros y mantenimiento a largo plazo.

### II. Estándares de Pruebas
Las pruebas SON MANDATORIAS y forman parte del contrato de entrega.

- El proyecto DEBE adoptar un enfoque Test-First (TDD) para las piezas críticas: tests escritos primero → tests fallan → implementación → tests pasan (Red-Green-Refactor). Esto se aplica especialmente a componentes de negocio, contratos API y lógica de cálculo.
- Tipos mínimos requeridos: unitarias, contract (cuando hay APIs entre componentes), integración para flujos entre componentes y end-to-end para los journey P1 críticos. Cada historia de usuario P1 DEBE incluir al menos un test que la verifique end-to-end o de integración.
- Cobertura objetivo: cobertura de pruebas unitarias de referencia del 80% para componentes no experimentales; si se baja ese umbral, la PR DEBE contener una justificación explícita y un plan de pruebas alternativo. (Coverage DEBE medirse automáticamente en CI.)
- Todas las pruebas DEBEN ser automatizadas y ejecutarse en CI en cada push/PR. Las pruebas DEBEN fallar en CI para PRs que rompan criterios de aceptación.

Rationale: Tests obligatorios reducen regresiones y permiten refactorizaciones seguras.

### III. Coherencia de Experiencia de Usuario
La experiencia de usuario DEBE ser coherente, accesible y medible.

- Se DEBE mantener una guía de estilos o sistema de diseño para UI (nombres, tokens, spacing). Los componentes compartidos DEBEN residir en una librería reutilizable cuando sea apropiado.
- Accesibilidad: las interfaces DEBEN cumplir al menos WCAG 2.1 AA en las áreas de producto visibles a usuarios finales, salvo excepciones justificadas en una PR.
- Las decisiones de UX que afecten flujos principales DEBEN incluir criterios de aceptación y pruebas de usuario o métricas de éxito en la especificación.
- Las interfaces DEBEN incluir tests automatizados (component/unit/integration) que verifiquen las interacciones críticas y estados de borde.

Rationale: Coherencia y accesibilidad mejoran la satisfacción del usuario y reducen soporte y retrabajo.

### IV. Rendimiento y Escalabilidad
Los requisitos no funcionales relacionados con rendimiento son parte del contrato.

- Cada feature DEBE declarar sus objetivos de rendimiento (p.ej. p95 < 200ms para endpoints UX críticos, throughput objetivo, límites de memoria). Si no se declaran, aplicar valores por defecto acordados en Requisitos.
- Las pruebas de rendimiento (benchmarks, stress tests) DEBEN ejecutarse antes de cambios que puedan afectar latencias o throughput significativas. Resultados representativos DEBEN adjuntarse a la PR cuando corresponda.
- Los cambios que introduzcan degradación mayor al 10% en métricas clave DEBEN ser revertidos o acompañados de un plan de mitigación.

Rationale: Garantizar que el producto cumple los acuerdos de nivel de servicio y evita regresiones de rendimiento.

### V. Observabilidad, Versionado y Documentación
Proveer visibilidad y gobernanza operacional es obligatorio.

- Instrumentación mínima: logs estructurados, métricas clave (latencia, errores, saturación) y trazas para flujos distribuidos cuando aplique. Esta señalización DEBE estar disponible en entornos de staging y producción.
- Versionado: las APIs públicas y librerías internas DEBEN usar semantic versioning (MAJOR.MINOR.PATCH). Cambios que rompan compatibilidad incrementan MAJOR; nuevas capacidades backward-compatible incrementan MINOR; aclaraciones/errores incrementan PATCH.
- Las políticas de deprecación DEBEN documentarse: anunciar, mantener compatibilidad por un periodo razonable y proporcionar migración clara.
- Documentación mínima exigida: README de componente, quickstart para ejecutar localmente, guía de pruebas y runbook para incidentes críticos.

Rationale: Observabilidad y versionado reducen el tiempo de resolución de fallos y facilitan evoluciones seguras.

## Requisitos y Restricciones

1. Cobertura de pruebas objetivo: 80% (unit) salvo justificación documentada.
2. Accesibilidad: WCAG 2.1 AA para interfaces de usuario públicas.
3. Performance por defecto (si no indicado por feature): p95 < 200ms para endpoints UI, p99 < 1s salvo casos especiales.
4. CI/PR gates obligatorios: linting, tests unitarios, tests de integración/contract para cambios relevantes, comprobación de coverage, y escaneo de seguridad estático.
5. Tech stack: respetar dependencias principales del repositorio; cualquier cambio mayor de stack DEBE ser aprobado en governance review.

## Flujo de Desarrollo y Puertas de Calidad

1. Workflow de PR:
	- Crear rama con nombre descriptivo.
	- Incluir descripción con propósito, riesgos, instrucciones de verificación y checklist de cumplimiento constitucional.
	- Ejecutar linters y tests localmente; CI ejecutará gates automáticamente.
	- Revisión: mínimo 1 revisor; cambios sensibles o de infra requieren 2 revisores.

2. Gates automáticos (CI) — TODOS DEBEN PASAR antes de merge:
	- Lint / formatting
	- Unit tests
	- Contract/integration tests (si la PR toca contratos o integraciones)
	- Coverage no inferior al umbral acordado o justificación presente
	- Escaneo de seguridad básico

3. Releases & Versioning:
	- Semantic Versioning obligatorio para APIs y librerías.
	- Las releases DEBEN ir acompañadas de changelog y notas de migración si aplica.

4. Excepciones:
	- Cualquier excepción a estas reglas DEBE documentarse en la PR y ser aprobada explícitamente por los mantenedores designados.

## Governance

1. Enmiendas:
	- Propuestas de cambio a esta Constitución SEDEBEN realizarse vía Pull Request que modifique `.specify/memory/constitution.md` y documente: qué cambia, por qué, impacto, y plan de migración.
	- Aprobación: mínimo 2 mantenedores o mayoría de Code Owners en la carpeta afectada.
	- Si la enmienda cambia principios de forma incompatible, incrementar MAJOR en la versión y publicar notas claras de migración.

2. Versioning policy:
	- MAJOR para redefinición o eliminación de principios o cambios incompatibles.
	- MINOR para nuevas políticas o principios añadidos.
	- PATCH para clarificaciones, correcciones de redacción y ajustes menores.

3. Revisión de cumplimiento:
	- Revisiones de cumplimiento automáticas deberán ejecutarse en CI (Constitution Check en `plan-template.md`).
	- Revisión de gobernanza manual cada 6 meses o cuando se proponga una enmienda mayor.

4. Responsabilidades:
	- Los autores de PRs son responsables de demostrar cumplimiento con esta Constitución en la PR.
	- Los mantenedores son responsables de aplicar las puertas de calidad y aprobar excepciones.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Fecha original desconocida — indicar fecha de ratificación si existe | **Last Amended**: 2025-11-09
