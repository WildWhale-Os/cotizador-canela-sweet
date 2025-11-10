# Feature Specification: Autenticación por correo (email-auth)

**Feature Branch**: `001-email-auth`  
**Created**: 2025-11-09  
**Status**: Draft  
**Input**: User description: "app initial setup - Necesito desarrollar una aplicación web que permita a los usuarios iniciar sesión con correo electrónico y contraseña. En caso de que un usuario olvide su contraseña, debe existir una opción para recuperarla fácilmente mediante una solicitud de restablecimiento. Si el usuario ingresa credenciales incorrectas, el sistema debe mostrar un mensaje de error genérico, indicando que los datos son inválidos, pero sin especificar si el error fue en el correo o en la contraseña, para mantener la seguridad. Cuando el inicio de sesión sea correcto, el sistema debe notificar al usuario que ingresó con éxito y redirigirlo al panel principal (dashboard). En este dashboard se mostrarán las funcionalidades disponibles según el rol del usuario. Por ahora, solo se implementará la gestión de usuarios, que estará disponible únicamente para el usuario administrador, ya que es el único rol con permisos para crear, editar y administrar las cuentas del resto de los usuarios."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Iniciar sesión con correo y contraseña (Priority: P1)

Como usuario registrado, quiero iniciar sesión con mi correo electrónico y contraseña para acceder a mi panel (dashboard).

**Why this priority**: Es la puerta de entrada al producto; sin autenticación no es posible entregar valor ni evaluar roles.

**Independent Test**: En un entorno de pruebas, enviar credenciales válidas a la API de autenticación o al formulario web y verificar que el usuario recibe una confirmación de inicio de sesión y es redirigido al dashboard.

**Acceptance Scenarios**:

1. **Given** un usuario con credenciales válidas, **When** ingresa correo y contraseña correctos y envía el formulario, **Then** el sistema muestra un mensaje de éxito y redirige al usuario al dashboard correspondiente a su rol.
2. **Given** un usuario que ingresa credenciales incorrectas, **When** envía el formulario, **Then** el sistema muestra un mensaje de error genérico: "Las credenciales no son válidas" y no revela si el correo existe ni si la contraseña está equivocada.
3. **Given** un usuario con contraseña correcta, **When** el inicio de sesión es exitoso, **Then** se inicia una sesión válida y el usuario puede acceder a las acciones permitidas por su rol.

---

### User Story 2 - Recuperación de contraseña (Priority: P1)

Como usuario que olvidó su contraseña, quiero solicitar un restablecimiento seguro para poder recuperar el acceso a mi cuenta.

**Why this priority**: Recuperación de acceso es crítica para la experiencia de usuario y soporte; sin ella los usuarios quedan bloqueados.

**Independent Test**: Solicitar restablecimiento con un correo válido y verificar que se genera y envía un token de restablecimiento (por medio de correo simulado en pruebas) y que el flujo permite establecer una nueva contraseña.

**Acceptance Scenarios**:

1. **Given** un usuario que solicita restablecimiento con un correo registrado, **When** confirma la solicitud, **Then** el sistema envía un correo con un enlace/token de restablecimiento y muestra una confirmación (sin revelar si el correo existe en el sistema en la interfaz pública).
2. **Given** un usuario que usa el enlace de restablecimiento dentro del periodo válido, **When** establece una nueva contraseña que cumple la política, **Then** la contraseña se actualiza y se muestra confirmación de éxito.
3. **Given** un token expirado o ya usado, **When** el usuario intenta usarlo, **Then** el sistema muestra un mensaje indicando que el enlace no es válido y sugiere solicitar otro restablecimiento.

---

### User Story 3 - Dashboard y gestión de usuarios (Priority: P2)

Como usuario administrador, quiero acceder a un panel donde pueda crear, editar y administrar cuentas de usuario para gestionar el acceso del resto de los usuarios.

**Why this priority**: Gestión de usuarios es necesaria para administrar permisos y el dominio inicial; sin ella no se puede otorgar acceso administrativo.

**Independent Test**: Iniciar sesión como administrador y verificar la presencia de la sección de gestión de usuarios; crear un usuario nuevo y verificar que posteriormente puede iniciar sesión (flujo end-to-end).

**Acceptance Scenarios**:

1. **Given** un usuario con rol administrador, **When** accede al dashboard, **Then** ve la opción "Gestión de usuarios" y puede crear/editar/inhabilitar cuentas.
2. **Given** un usuario sin rol administrador, **When** accede al dashboard, **Then** no ve ni puede acceder a las funcionalidades de gestión de usuarios.

3. **Given** un administrador crea una nueva cuenta para un usuario, **When** confirma la creación, **Then** el sistema envía un enlace de invitación por correo que permite al nuevo usuario establecer su contraseña y verificar su correo antes de iniciar sesión.

---

### Edge Cases

- Solicitud de restablecimiento para correo no registrado: la interfaz pública debe responder con el mismo mensaje que para correos registrados para evitar enumeración de cuentas.
- Reintentos de login masivos: el sistema debe permitir medidas defensivas (rate limiting, captchas o bloqueo temporal) documentadas en runbook, pero la estrategia exacta queda como decisión operativa.
- Tokens de restablecimiento duplicados o reutilizados: deben considerarse inválidos después de uso.
- Manejo de correos con mayúsculas/minúsculas: los correos se normalizan al comparar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir a un usuario autenticarse mediante correo electrónico y contraseña.
- **FR-002**: El sistema DEBE mostrar mensajes de error genéricos en fallos de autenticación (no revelar si el correo existe).
- **FR-003**: El sistema DEBE permitir solicitar un restablecimiento de contraseña mediante correo electrónico y enviar un token/ enlace por email sin revelar si la cuenta existe en la respuesta pública.
- **FR-004**: El sistema DEBE validar tokens de restablecimiento y permitir establecer una nueva contraseña dentro de un periodo de validez.
- **FR-005**: El sistema DEBE mantener roles de usuario y mostrar las funcionalidades del dashboard según el rol (p. ej., administración de usuarios sólo para administradores).
- **FR-006**: El sistema DEBE registrar eventos relevantes de seguridad (intentos de login fallidos, uso de token de restablecimiento, creación/edición de usuarios) para auditoría.
- **FR-007**: El sistema DEBE permitir que un administrador cree, edite e inhabilite cuentas de usuario desde el dashboard.
- **FR-008**: Todas las operaciones críticas DEBEN poder verificarse mediante pruebas automatizadas (unitarias e integración/end-to-end para flujos P1).

- **FR-009**: El sistema DEBE manejar sesiones con expiración por defecto (8 horas de inactividad) y soportar una opción "remember me" opcional que permita sesiones persistentes (configurable, p.ej. 30 días) con posibilidad de revocación.
- **FR-010**: Cuando un administrador crea una cuenta, el sistema DEBE enviar un enlace de invitación/establecimiento de contraseña que permita al usuario verificar su correo y establecer su contraseña de forma segura (enlace single-use con expiración).

### Assumptions

- No se integrará SSO en esta fase; el método de autenticación es por correo y contraseña tradicionales.
- Existe un servicio de envío de correo configurado en los entornos de prueba/producción (en pruebas se usará entrega simulada).
- Token de restablecimiento expira por defecto en 1 hora.
- Política de contraseña por defecto: mínimo 8 caracteres; requisitos más estrictos quedan como mejora futura.
- No se definen límites de bloqueo (account lock) en este spec; medidas de mitigación (rate limiting, captchas) serán implementadas según el runbook operativo.

- Sesión por defecto: la sesión expira tras 8 horas de inactividad; se ofrecerá una opción "remember me" opcional para sesiones persistentes (p.ej. 30 días) que debe poder revocarse.
- Cuando un administrador crea una cuenta, el flujo usará un enlace de invitación single-use que expira (por defecto 24 horas) para establecer contraseña y verificar correo.

### Key Entities *(include if feature involves data)*

- **User**: Identificador, email (normalizado), password_hash, roles (e.g., admin, user), is_active, created_at, updated_at.
- **PasswordResetRequest**: token, user_id, created_at, expires_at, used_at, client_ip (optional).
 - **PasswordResetRequest**: token, user_id, created_at, expires_at, used_at, client_ip (optional).
 - **UserInvitation**: token, inviter_id, email, created_at, expires_at, used_at, client_ip (optional).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En pruebas automatizadas, 100% de intentos con credenciales válidas deben resultar en inicio de sesión exitoso y redirección al dashboard (test suite reproducible).
- **SC-002**: En el flujo de restablecimiento, el correo de restablecimiento DEBE generarse y colocarse en la cola de envío en menos de 1 minuto en el entorno de pruebas controlado.
- **SC-003**: Mensajes de error por credenciales inválidas deben ser genéricos y no permitir determinar la existencia de un correo (verificable mediante pruebas de respuestas equivalentes para emails existentes y no existentes).
- **SC-004**: Un administrador puede crear un usuario y ese usuario puede autenticarse exitosamente (end-to-end test).
- **SC-005**: Cobertura de pruebas para componentes críticos del flujo de autenticación y restablecimiento debe alcanzarse al menos al 80% (medido en CI), de acuerdo con la Constitución del proyecto.

- **SC-006**: Las pruebas automatizadas que cubren casos con credenciales válidas deberán pasar de forma consistente en la suite de CI (evitar métricas 100% que puedan ser afectadas por factores externos).

### Non-functional / Operational Criteria

- **OC-001**: Registros de seguridad relevantes (login fallido, restablecimiento, creación de usuarios) deben ser accesibles en el sistema de logging para investigación.

## Notes & Next Steps

- Implementar tests automatizados (unit + integration/e2e) para User Story 1 y 2 antes de la implementación (TDD recomendado).
- Coordinar con el equipo de infraestructura la entrega de correo en entornos de pruebas.
- Decidir políticas de bloqueo y mitigación de abuso en el runbook de operaciones.

