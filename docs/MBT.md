# Reglas de operación de MB Transfer

## Traslados e itinerarios

- Un itinerario corresponde a una fecha operativa de Santo Domingo y reúne los traslados de ese día.
- Un traslado puede ser una llegada, una salida o una transferencia. La recogida de una llegada y el destino de una salida deben referenciar un lugar clasificado como aeropuerto.
- El código y el tipo identifican un traslado de forma única. El sistema registra el empleado que lo creó.
- Se pueden modificar itinerarios desde el día anterior a la fecha operativa actual. Al cambiar la hora de recogida, el sistema conserva la hora original.
- La vista de horas muestra la hora original y la modificada. Para salidas y transferencias muestra también la hora operativa, que se calcula restando quince minutos a la hora registrada.

## Importación de Sacbé

- El sistema lee la hoja de Excel correspondiente a la fecha seleccionada y permite revisar qué filas se pueden incorporar al itinerario.
- La importación omite los servicios que ya existen con el mismo código y tipo.
- La importación de llegadas y salidas de Sacbé usa PUJ para el extremo aeroportuario. En el registro manual se puede seleccionar otro aeropuerto del catálogo.
- Las ubicaciones no aeroportuarias pueden conservar el texto de origen cuando no coinciden con un lugar del catálogo.
