# MB Transfer · Prototipo académico

Aplicación interna para registrar y consultar traslados, corregir horas de recogida e importar servicios de Sacbé desde Excel.

- `apps/webapp-mbt` contiene la interfaz Next.js.
- `apps/mbt-api` contiene la API Express en `/api/v2`.
- `packages/database/prisma` contiene el esquema de PostgreSQL y las migraciones.

## Instalación local

Se necesita Node.js 22, pnpm y una base PostgreSQL de demostración. Configura `DATABASE_URL` y `TEST_DATABASE_URL` en `packages/database/.env` con la conexión a esa base. En `apps/mbt-api/.env`, configura la misma `DATABASE_URL` y un `JWT_SECRET` de al menos 32 caracteres. Para una API en otro host o puerto, configura `MBT_API_URL` en la aplicación web.

```sh
pnpm install --frozen-lockfile
pnpm db:deploy:test
pnpm --filter mbt-api dev
```

En otra terminal, ejecuta `pnpm --filter webapp-mbt dev` y abre `http://localhost:3000`. El acceso requiere un empleado activo con clave almacenada mediante `scrypt`. Para probar el registro y la importación, la base de demostración debe incluir los catálogos correspondientes, entre ellos el aliado Sacbé y el aeropuerto PUJ.

## Documentación

- [Reglas de operación](docs/MBT.md)
- [Diagrama de casos de uso](docs/entrega/anexo-a1-casos-de-uso.svg)
