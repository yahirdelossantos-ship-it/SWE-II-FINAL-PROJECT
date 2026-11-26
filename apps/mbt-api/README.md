# API de MB Transfer

API Express para sesiones de empleados, consulta de catálogos, itinerarios, traslados e importación de Sacbé. Las rutas se montan bajo `/api/v2`.

Consulta el [README del proyecto](../../README.md) para instalar y configurar el entorno. Ejecuta `pnpm --filter mbt-api build` antes de `pnpm --filter mbt-api test:v2`.

El [generador de comprobantes](src/pdf-service/README.md) se conserva como código independiente. La API del prototipo no ofrece una ruta de generación.
