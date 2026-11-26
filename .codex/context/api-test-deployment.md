# Test API deployment

## Topology

The production and test API deployments share a VPS but must remain isolated:

| Target     | Branch | Release root                                          | Environment file              | Service       | Port   |
| ---------- | ------ | ----------------------------------------------------- | ----------------------------- | ------------- | ------ |
| Production | `main` | GitHub secret `APP_DIR` (`/var/www/mbtapi` currently) | `/etc/mbtapi/mbtapi.env`      | `mbtapi`      | `3001` |
| Test       | `test` | `/var/www/mbt-api-test`                               | `/etc/mbtapi/mbtapi-test.env` | `mbtapi-test` | `3002` |

NGINX terminates TLS for `api-test.mbtransferpuntacana.com` and proxies it to `127.0.0.1:3002`. The test database is a production replica with a distinct `DATABASE_URL`. Never deploy the `test` branch through the production directory, environment file, service, or database.

## Workflow behavior

`.github/workflows/deploy-api.yml` accepts `main` and lowercase `test`. It maps each branch explicitly to its deployment target, rejects manual runs from other branches, serializes deployments per branch, applies migrations using the selected runtime `DATABASE_URL`, and restarts only the selected systemd service.

The workflow path filter intentionally excludes frontend-only changes. Use a manual workflow run from `test` for the initial API deployment when no API, database, workspace, or workflow file changed.

## Frontend connection

A test deployment of `apps/webapp-mbt` should set:

```dotenv
MBT_API_URL=https://api-test.mbtransferpuntacana.com
```

The test frontend origin is configured in the VPS test environment's `CORS_ORIGINS`. Keep browser frontend origins there rather than substituting the API's own hostname. The current operations webapp proxies browser requests through its Next.js backend, but recording the frontend origin keeps the API configuration correct for direct browser access as well.

## VPS prerequisites

- `/var/www/mbt-api-test` is owned by `deploy:deploy`.
- `/etc/mbtapi/mbtapi-test.env` uses `NODE_ENV=production` and `PORT=3002`.
- `mbtapi-test.service` is enabled and remains inactive until its first release is deployed.
- `deploy` has passwordless permission only to restart and inspect `mbtapi` and `mbtapi-test`.
- The test DNS record and Let's Encrypt certificate resolve to and exist on the VPS.
