# API de MB Transfer

API Express para sesiones de empleados, consulta de catálogos, itinerarios, traslados e importación de Sacbé. Las rutas se montan bajo `/api/v2`.

Consulta el [README del proyecto](../../README.md) para instalar y configurar el entorno. Ejecuta `pnpm --filter mbt-api build` antes de `pnpm --filter mbt-api test:v2`.

Las rutas HTTP en `src/routes/v2` validan las solicitudes y devuelven las respuestas. Los servicios en `src/modules` aplican las reglas de operación y los repositorios consultan PostgreSQL mediante Prisma. Los catálogos son consultas de lectura directa desde su repositorio.

El [generador de comprobantes](src/pdf-service/README.md) se conserva como código independiente. La API del prototipo no ofrece una ruta de generación.
