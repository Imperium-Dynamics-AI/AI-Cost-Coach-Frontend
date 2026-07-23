# Frontend architecture

The frontend follows a feature-based structure so the cost calculator can grow without turning back into one large component.

```text
frontend/src/
|-- app/                         Application shell
|-- features/cost-estimator/
|   |-- api/                     Backend boundary and placeholder response
|   |-- components/              Feature-specific form and results UI
|   |-- config/                  Options, defaults, scenarios, and help copy
|   |-- hooks/                   Form and request state
|   |-- utils/                   API payload construction
|   `-- CostEstimatorPage.jsx    Feature composition
|-- shared/components/           Reusable accessible UI controls
|-- styles/                      Global design system and responsive styles
`-- main.jsx                     Browser entry point
```

## Design rules

- Pricing calculations never run in the browser.
- The API boundary lives in one file: `costEstimateApi.js`.
- User-facing labels use plain language. Azure terminology is retained as supporting text where it helps implementation teams.
- Every unfamiliar input has contextual help available by mouse hover, keyboard focus, and tap.
- Form state and API request state are kept separate.
- API payload construction is a pure function covered by contract tests against the current backend inputs.

## Adding a field

1. Add its default value in `config/calculatorConfig.js`.
2. Add its plain-language tooltip in `config/helpText.js`.
3. Add the control in `components/CalculatorForm.jsx`.
4. Map it explicitly in `utils/buildEstimatePayload.js`.
5. Update `docs/API_CONTRACT.md`.
