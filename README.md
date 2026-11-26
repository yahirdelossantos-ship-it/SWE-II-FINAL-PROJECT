# MB Transfer · Prototipo académico

Aplicación interna para registrar y consultar traslados, corregir horas de recogida e importar servicios de Sacbé desde Excel.

- `apps/webapp-mbt` contiene la interfaz Next.js.
- `apps/mbt-api` contiene la API Express en `/api/v2`.
- `packages/database/prisma` contiene el esquema y la migración inicial de PostgreSQL.

## Instalación local

Usa Node.js 22, pnpm y una instancia local de PostgreSQL. Crea una base vacía llamada `mbt_academic` y configura en el archivo `.env` de la raíz las credenciales de PostgreSQL y un `JWT_SECRET` de al menos 32 caracteres.

```sh
cp .env.example .env
pnpm install --frozen-lockfile
pnpm db:setup
pnpm dev
```

`pnpm db:setup` aplica la migración inicial, genera el cliente Prisma, compila los paquetes y carga los datos ficticios de la fecha operativa. Repite ese comando cuando quieras preparar los ejemplos de otra fecha. `pnpm dev` inicia la web en `http://localhost:3000` y la API en `http://localhost:3001/api/v2`. Para iniciar solo la API usa `pnpm --filter mbt-api dev`.

## Demostración

Inicia sesión con `operaciones@example.test` y la clave ficticia `mbt-demo-2026`. El itinerario de hoy contiene una llegada y una salida con la hora modificada. También se incluye un traslado de hace tres días para comprobar el bloqueo de edición.

Usa `pnpm demo:sacbe` para generar `sacbe-demo.xlsx` en la raíz. Cárgalo desde **Importar Sacbé** con la fecha de hoy seleccionada. El archivo incluye un servicio nuevo, un duplicado y una fila inválida.

## Documentación

- [Reglas de operación](docs/MBT.md)
- [Diagrama de casos de uso](docs/entrega/anexo-a1-casos-de-uso.svg)
