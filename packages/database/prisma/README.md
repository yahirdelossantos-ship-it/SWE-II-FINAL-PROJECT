# Base de datos

La migración inicial crea las siete tablas del prototipo académico: `Employee`, `AccessKey`, `Itinerary`, `Service`, `Place`, `Ally` y `Vehicle`.

Cada fecha tiene un solo itinerario. Cada traslado referencia su itinerario y al empleado que lo creó. El código y el tipo identifican un traslado de forma única. Las ubicaciones pueden vincularse al catálogo y conservar un nombre de origen cuando el archivo de Sacbé trae un texto sin coincidencia.

El [README del proyecto](../../../README.md) explica cómo preparar la base local y cargar los datos ficticios.
