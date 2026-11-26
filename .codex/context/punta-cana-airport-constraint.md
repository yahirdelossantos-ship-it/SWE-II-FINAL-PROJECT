# Airport place constraint for v2 services

## Status

Implemented and verified on 2026-10-19. The API and webapp changes were committed separately as `6b27230` and `395c195`.

## Approved scope

- Update the operations webapp and v2 service API.
- Do not change v1 routes or `apps/mbt-app`; they are legacy and planned for removal.
- For service types that require an airport, allow any database `Place` whose `kind` is `AIRPORT`.
- Default the UI selection to Punta Cana International Airport.
- Keep `TRANSFER` behavior unchanged unless the user later specifies a rule for it.

The current interpretation is:

- `ARRIVAL`: pickup must reference an `AIRPORT` place.
- `DEPARTURE`: dropoff must reference an `AIRPORT` place.

## Current behavior

- `apps/mbt-api/src/routes/v2/services.ts` defines a hardcoded Punta Cana place ID.
- `resolveServicePlace` silently replaces `ARRIVAL.pickup` and `DEPARTURE.dropoff` with that ID on both POST and PUT.
- The helper does not query that hardcoded record or verify its `Place.kind`.
- `CreateServiceForm.tsx` shows a disabled Punta Cana field and submits the same hardcoded ID.
- `ServiceEditDialog.tsx` renders ordinary place selectors for both sides, but the API silently overwrites the airport side. The UI therefore suggests a choice that is not persisted.
- `GET /catalog/places` already accepts a `kind` query and returns `kind`, `iata`, and `zoneId`, although the webapp's general `Option` type does not model those place-specific fields.
- The catalog default limit is 100, so an airport selector should use an airport-filtered query rather than assuming all airports appear in the general creation-options response.
- Prisma models `Place.kind` with the `PlaceKind.AIRPORT` enum. `Service.pickupId` and `dropoffId` are nullable foreign keys; the database has no cross-table constraint tying service type and place kind together.
- No service route tests currently cover this rule.

## Intended direction

- Let the selected airport-side `placeId` reach v2 unchanged.
- At the v2 boundary, resolve that record and reject it when missing or when `kind !== AIRPORT`; do not silently substitute Punta Cana.
- Require a database-backed place on the airport side rather than accepting a free-form name there.
- Populate airport choices from an airport-filtered catalog request.
- Default new arrivals/departures to the Punta Cana airport while keeping the control editable.
- On edit, initialize from the service's persisted airport and handle service-type changes without retaining an invalid side.
- Use a stable database attribute or configuration for the Punta Cana default. Do not match localized display text. Confirm the final identifier strategy during implementation because `iata` is present but not globally unique in the schema.

## Expected behavioral coverage

- POST and PUT accept an existing `AIRPORT` on the required side.
- POST and PUT reject a non-airport place on the required side with a stable client error.
- POST and PUT reject a missing airport place.
- ARRIVAL validates pickup; DEPARTURE validates dropoff.
- TRANSFER continues resolving both locations normally.
- The create UI defaults to Punta Cana while allowing another airport.
- The edit UI preserves and can change the persisted airport.

Follow the reusable testing guidance in `.codex/skills/mbt-maintenance/references/testing.md`; do not create an endpoint-specific route harness.

## Implemented shape

- `apps/mbt-api/src/routes/v2/core/service-place.ts` owns reusable, dependency-injected service-place resolution and airport validation.
- `apps/mbt-api/src/routes/v2/services.ts` supplies Prisma lookups to that helper for both POST and PUT.
- Airport sides require a database `placeId`; missing places return `PLACE_NOT_FOUND`, while raw names and non-airport records return `AIRPORT_PLACE_REQUIRED`.
- `apps/webapp-mbt/src/features/itinerary/api.ts` loads a dedicated airport catalog with `kind=AIRPORT` and keeps searched airport results filtered.
- `apps/webapp-mbt/src/features/itinerary/servicePlaces.ts` centralizes UI selection, PUJ defaulting by IATA, and request location conversion.
- Both create and edit forms expose editable airport-only comboboxes on the required side. Unrestricted sides retain normal place and raw-name behavior.

## Verification evidence

- `pnpm --filter mbt-api build`: passed.
- `pnpm --filter mbt-api test:v2`: passed, including `service-place.test`.
- `pnpm --filter webapp-mbt lint`: passed with one pre-existing warning in `src/components/layout/Header.tsx` for an unused `Button` import.
- `pnpm --filter webapp-mbt build`: passed outside the sandbox. The sandboxed attempt failed only because Turbopack could not bind its local helper port.
- Commands reported a Node engine warning because the environment used Node 26 while the repository requests Node 22.
