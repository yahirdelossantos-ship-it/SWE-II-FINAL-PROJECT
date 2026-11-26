# MB Transfer API v2

API v2 is developed incrementally for `webapp-mbt`. Version 1 remains available for the
existing applications. Do not copy a v1 route into v2 unless a new application feature
requires it.

## Contract conventions

- API origin and version are separate: clients configure an origin and request `/api/v2`.
- Request bodies, route parameters, and query parameters are validated with Zod.
- Operational dates use `YYYY-MM-DD` and `America/Santo_Domingo`.
- Instants use ISO 8601 with an explicit offset. A service `pickupAt` must fall on its
  `itineraryDate` in the operational timezone.
- Database records are returned through explicit Prisma selections.
- Authentication uses the existing identifier/access-key credentials and bearer JWT. The
  new webapp will keep that JWT in its server-owned HttpOnly session rather than browser
  storage.

Success responses:

```json
{
	"success": true,
	"data": {}
}
```

Failure responses:

```json
{
	"success": false,
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "Request validation failed"
	}
}
```

## Initial endpoints

Public:

- `POST /api/v2/auth/login`
- `GET /api/v2/public/catalog`
- `GET /api/v2/public/booking-options`
- `POST /api/v2/public/bookings/availability`
- `GET /api/v2/public/tours/:slug`
- `POST /api/v2/public/bookings/quote`

Website BFF (`X-MBT-Website-Key`):

- `POST /api/v2/customer/session`
- `POST /api/v2/customer/bookings`
- `POST /api/v2/customer/tour-registrations`
- `GET /api/v2/customer/me` (also requires a customer bearer token)

Authenticated:

- `GET /api/v2/auth/me`
- `GET /api/v2/itineraries/:date`
- `GET /api/v2/itineraries/calendar?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `GET /api/v2/imports/viatovia?date=YYYY-MM-DD`
- `POST /api/v2/imports/preflight`
- `POST /api/v2/flights/check`
- `PUT /api/v2/services/:id`
- `PATCH /api/v2/services/:id/pickup-time`
- `DELETE /api/v2/services/:id`
- `POST /api/v2/services`
- `GET /api/v2/catalog/allies`
- `GET /api/v2/catalog/places`
- `GET /api/v2/catalog/vehicles`
- `POST /api/v2/zones/match`
- `/api/v2/website/tours` and `/api/v2/website/add-ons` CRUD (administrator)
- `/api/v2/website/bookings` read, status, conversion draft, and conversion routes (administrator)
- `/api/v2/website/tour-registrations` read and status routes (administrator)
- `/api/v2/website/users` read-only routes (administrator)

The itinerary lookup deliberately returns `200` with `itinerary: null` and an empty service
list when the date has no itinerary. Creating the first service atomically creates that
date's itinerary.

The calendar lookup returns only each existing itinerary date and its service count. This
powers calendar badges without transferring complete service records.

The ViaToVia import endpoint fetches with the server-only `VIATOVIA_API_TOKEN`, returns
normalized preview rows, and marks codes that are already stored. Creating a service with an
existing external code returns `SERVICE_CODE_EXISTS` rather than inserting another row.
The preflight endpoint accepts normalized import codes and reports those already stored.
Service updates use the same full validation and operational-date lock as creation, reject
conflicting codes, and support both catalog-backed and raw-string locations.
Service deletion uses the same operational-date lock. A service created from a booking or
with a settlement cannot be deleted because those records are durable audit history.

The flight-check endpoint accepts an operational `date` and checks every arrival service
with a flight code for that itinerary. Flight codes are deduplicated before consulting
FlightAware. The server limits provider concurrency to three requests, retries rate limits,
and caches successful responses for ten minutes. Set `FLIGHTAWARE_API_KEY` only on the API
server; it is never exposed to the webapp. Optional `serviceIds` can restrict a check to at
most 100 services, although the primary webapp workflow checks the complete itinerary.

The pickup-time endpoint is intentionally narrow so a confirmed FlightAware discrepancy can
be applied without resubmitting the whole service. It retains the original creation time,
records when the time was modified, and enforces the itinerary date and past-date lock.

## Service creation payload

```json
{
	"itineraryDate": "2026-08-24",
	"type": "ARRIVAL",
	"clientName": "Example Client",
	"pickupAt": "2026-08-24T10:30:00-04:00",
	"passengers": 2,
	"pickup": { "placeId": "place-cuid" },
	"dropoff": { "name": "Hotel supplied by source" },
	"allyId": "ally-cuid",
	"vehicle": { "name": "SUV" }
}
```

A pickup or dropoff name that does not match a database place is preserved in the existing
raw-name fields. Referenced ally, vehicle, route, or place IDs must exist.

Website routes require `WEBSITE_PRICE_TABLE_ID`, `WEBSITE_API_SECRET`, and
`GOOGLE_PLACES_API_KEY` on the API server. Public quotes and booking submissions verify
Google selections and calculate current prices on the server. Customer JWTs use the
`mbt-website` audience and are not valid for employee endpoints.

Public booking availability returns `unavailableReason` as `NO_VEHICLE_CAPACITY`,
`NO_RATE_CONFIGURED`, or `null`. Transfer bookings are temporarily rejected with
`SERVICE_TYPE_UNAVAILABLE` while inter-zone rates are being prepared. Google Places
access failures return a service error rather than an invalid-place error; confirmed
unknown place IDs continue through point-in-zone matching and are persisted on booking
submission.

For server-side Place Details requests, use a separate API key from the browser Maps
key. In Google Cloud Console, restrict that key to **Places API (New)** and use
**IP addresses** for application restrictions, allowing the API host's public outbound
IP (and the developer's public outbound IP when testing locally). Set this key as
`GOOGLE_PLACES_API_KEY` in the API runtime and restart the API after changing it.
Website/HTTP-referrer restrictions belong on browser keys: server requests have no
browser Referer header and Google rejects such a key with
`API_KEY_HTTP_REFERRER_BLOCKED` / `Requests from referer <empty> are blocked.`
Existing database places with a zone skip Place Details, so they can still work while
this configuration is incorrect. See Google's [API key security guidance](https://developers.google.com/maps/api-security-best-practices).

`POST /api/v2/zones/match` accepts a transient `{ "lat": number, "lng": number }`
point and returns `MATCHED`, `OUTSIDE`, or `AMBIGUOUS`. A unique match includes the zone;
ambiguous responses include every overlapping zone so the client can request review.

## Checks

```bash
pnpm --filter mbt-api build
pnpm --filter mbt-api test:v2
```
