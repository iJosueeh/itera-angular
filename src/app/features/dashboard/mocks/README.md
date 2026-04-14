# Dashboard Mocks

Este directorio contiene datos mock para que frontend, backend y QA compartan el mismo contrato de campos.

## Archivos
- `navigation.mock.ts`: marca y elementos de navegación.
- `hero.mock.ts`: bloque hero con texto principal, placeholder y tendencias.
- `highlights.mock.ts`: tarjetas funcionales y estado de progreso.
- `mentor.mock.ts`: recomendación del mentor.
- `footer.mock.ts`: enlaces de pie de página.
- `career-snapshot.mock.ts`: comparativos de carrera (salario, demanda, crecimiento, ruta y perfil).
- `dashboard.mock.ts`: composición final del modelo completo para la pantalla.

## API mock
- `../services/dashboard-api.mock.service.ts` simula endpoints con latencia para flujo real de UI.
- `getDashboardViewModel()`: carga inicial del dashboard.
- `getCareerSnapshot(query)`: simula respuesta de comparativo al buscar carrera.

## Uso recomendado
1. Mantener aquí todo dato de ejemplo, no en componentes.
2. Si cambia la interfaz, ajustar primero `dashboard.interface.ts` y luego estos mocks.
3. Evitar lógica de negocio en mocks; solo estructura y contenido de muestra.
