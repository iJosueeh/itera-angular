# 💎 Itera Angular - Estándares de Ingeniería y Buenas Prácticas

Este documento define las normativas estrictas para el desarrollo en el proyecto `itera-angular`. El cumplimiento de estas reglas es obligatorio para mantener la calidad, legibilidad y estabilidad del sistema.

---

## 🚀 1. Flujo de Trabajo y Git

- **Sincronización:** Antes de iniciar cualquier tarea, es obligatorio ejecutar:
  ```bash
  git pull origin dev
  ```
- **Commits:** Seguir la convención de [Conventional Commits](https://www.conventionalcommits.org/).
- **Validación Local:** Es **obligatorio** que el código pase el flujo de validación antes de ser subido:
  ```bash
  # Paso 1: Formato
  npx prettier --check "src/**/*.{ts,html,css}"
  # Paso 2: Pruebas
  npm test -- --watch=false
  # Paso 3: Compilación
  npm run build
  ```

---

## 🏗️ 2. Arquitectura de Componentes

- **Encapsulamiento:** Cada componente debe residir en su propio directorio con sus 3 archivos (.ts, .html, .css).
- **Standalone:** Todos los componentes deben ser `standalone: true`.
- **Rendimiento:** Usar obligatoriamente `changeDetection: ChangeDetectionStrategy.OnPush`.
- **APIs Modernas:** Prohibido el uso de `@Input()` y `@Output()` antiguos. Usar las APIs de Signals:
  - `input()`, `input.required()`
  - `output()`
  - `model()`
  - `computed()`, `effect()`

---

## 📏 3. Legibilidad y Organización

- **Límite de Líneas:** Ninguna clase (`.ts`) debe exceder las **250 líneas**.
- **Alias de Rutas:** Prohibido usar rutas relativas complejas (ej: `../../../`). Usar siempre los alias configurados:
  - `@shared/*` -> Componentes de UI, interfaces y utilidades comunes.
  - `@features/*` -> Lógica de negocio y páginas específicas.
  - `@app/*` -> Raíz de la aplicación.
- **UI Atómica:** Extraer elementos visuales repetitivos a `src/app/shared/ui` para maximizar la reutilización (DRY).

---

## 🛡️ 4. Tipado Estricto (No `any`)

- **Prohibición de `any`:** El uso de `any` está **estrictamente prohibido**. 
- **Interfaces:** Todo modelo de datos, respuesta de API o propiedad compleja debe tener una interfaz definida en `@shared/interfaces`.
- **Unknown:** Si el tipo es verdaderamente desconocido, usar `unknown` y realizar un Type Guard.

---

## 🧪 5. Calidad y CI

- **Build Garantizado:** Ningún commit debe romper la compilación (`npm run build`).
- **Tests Mandatory:** Cada nueva funcionalidad o bugfix debe incluir su archivo `.spec.ts` con cobertura de los casos de éxito y error.
- **CI Resilience:** El pipeline de GitHub Actions usa `npm install` para garantizar la sincronización del `package-lock.json` entre entornos (Windows/Linux). No modificar el archivo `.github/workflows/ci.yml` sin previo aviso.

---

## 🎨 6. Estilos y Responsive

- **Tailwind + CSS:** Usar clases de Tailwind para layout y espaciado. CSS local solo para animaciones complejas o estilos muy específicos.
- **Mobile First:** El diseño debe ser responsivo por defecto.

