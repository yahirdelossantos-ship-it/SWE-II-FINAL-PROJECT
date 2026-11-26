# MB Transfer business rules

This document records stable business rules shared by the maintained MBT applications. It is intentionally short. Feature-specific implementation research belongs in a companion document.

## Services and locations

- A `Service` transports a customer from a pickup location to a dropoff location using a vehicle.
- A service is an `ARRIVAL`, `DEPARTURE`, or `TRANSFER`.
- An arrival's pickup is an airport. A departure's dropoff is an airport.
- Transfers cover location pairs that do not use the airport-side pricing rule.
- A location may reference a canonical database `Place`. Imported services may temporarily retain a raw location name when no canonical place has been resolved.
- A canonical place can belong to one operational `Zone`. A missing zone prevents automatic zone-based pricing.
- The `Place` catalog remains useful even when an external search provider is available: it carries MBT-owned classification, zone assignment, visibility, and operational knowledge.
- A canonical place selected in the maintained v2 workflow stores its Google Place ID as its external identity and the label confirmed by the operator.
- Google-derived coordinates are transient inputs for map display or zone matching; the maintained v2 workflow does not persist them on `Place`.
- A place belongs to a zone automatically only when its transient map point falls inside exactly one configured zone polygon. Points outside every polygon or inside overlapping polygons require human review instead of an arbitrary assignment.

## Partner imports

- Sacbé services may be imported from an Excel sheet for the selected itinerary date.
- The source location text must be preserved for traceability.
- A source label may resolve to a canonical place, but an uncertain match must remain unresolved for human review rather than being silently attached to the wrong place or zone.
- Partner-specific aliases are durable business knowledge and should be reusable across later imports.

## Airport scope

- Punta Cana International Airport is the default airport, not the only valid airport.
- For arrivals and departures, the airport-side location must reference a canonical `Place` classified as `AIRPORT`.
- A selected airport must be persisted as selected. The API must not silently replace it with Punta Cana.
- Transfers keep their two ordinary location sides unless a separate business rule is approved.
