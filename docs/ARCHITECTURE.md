# Frontend architecture

The frontend follows a feature-based structure so the cost calculator can grow without turning back into one large component.

```text
frontend/src/
|-- app/                         Application shell
|-- features/cost-estimator/
|   |-- api/                     Model-catalog and final-comparison boundary
|   |-- components/              Feature-specific form and results UI
|   |-- config/                  Cost categories, defaults, and help copy
|   |-- hooks/                   Form, catalog, and comparison request state
|   |-- utils/                   Live calculation and API payload construction
|   `-- CostEstimatorPage.jsx    Feature composition
|-- shared/components/           Reusable accessible UI controls
|-- styles/                      Global design system and responsive styles
`-- main.jsx                     Browser entry point
```

## Design rules

- The browser fetches `GET /api/v1/models` once, then calculates the selected setup
  immediately as answers change. The pure calculator mirrors the backend constants and
  formulas.
- The final review action calls the planned `POST /api/v1/model-comparisons` endpoint.
  Its request contains one stable selected-model ID and raw user inputs only.
- The backend owns comparison-model discovery, ordering, labels, relationship reasons,
  configurations, and final costs. The frontend renders the returned ordered array.
- The API boundary lives in `modelComparisonApi.js`.
- User-facing labels use plain language. Azure terminology is retained as supporting text where it helps implementation teams.
- Every unfamiliar input has contextual help available by mouse hover, keyboard focus, and tap.
- Form state and API request state are kept separate.
- Guided-form answers and the current step are stored as a versioned browser draft; API results are not persisted.
- API payload construction is a pure function tested to exclude client-generated
  scenarios, model names, catalog prices, and browser totals.
- Browser-side calculation is a pure function covered by formula and missing-price tests.

## Adding a field

1. Add its default value in `config/calculatorConfig.js`.
2. Add its plain-language tooltip in `config/helpText.js`.
3. Add the control in `components/CalculatorForm.jsx`.
4. Map it explicitly in `utils/buildModelComparisonPayload.js`.
5. Update `docs/API_CONTRACT.md`.
