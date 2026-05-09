# 💎 Itera Angular - Estándares de Ingeniería y Buenas Prácticas

Este documento define las normativas estrictas para el desarrollo en el proyecto `itera-angular`. El cumplimiento de estas reglas es obligatorio para mantener la calidad, legibilidad y escalabilidad del sistema.

---

## 🚀 1. Flujo de Trabajo (Git)

- **Sincronización:** Antes de iniciar cualquier tarea, es obligatorio ejecutar:
  ```bash
  git pull origin dev
  ```
  Esto asegura que trabajes sobre la versión más reciente y minimiza conflictos de integración.
- **Ramas:** Todo desarrollo nuevo debe nacer de `dev` y enviarse a `dev` mediante Pull Requests.
- **Commits:** Seguir la convención de [Conventional Commits](https://www.conventionalcommits.org/) (ej: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`).

---

## 🏗️ 2. Arquitectura de Componentes

- **Encapsulamiento Total:** Cada componente debe residir en su propio directorio y contener sus tres archivos base:
  - `nombre.component.ts` (Lógica)
  - `nombre.component.html` (Template)
  - `nombre.component.css` (Estilos específicos)
- **Componentes Standalone:** Se prioriza el uso de componentes `standalone: true`.
- **Detección de Cambios:** Usar siempre `changeDetection: ChangeDetectionStrategy.OnPush` para optimizar el rendimiento.
- **Inputs/Outputs:** Utilizar las nuevas APIs de Signals (`input()`, `output()`, `model()`) en lugar de los decoradores tradicionales cuando sea posible.

---

## 📏 3. Límites y Legibilidad (Anti-GOD Classes)

- **Límite de Líneas:** Ninguna clase (`.ts`) debe exceder las **250 líneas** de código.
- **Responsabilidad Única (SRP):** Si una clase crece demasiado, debe ser refactorizada:
  - Extraer lógica compleja a **Services**.
  - Mover funciones puras a **Utils** o **Helpers**.
  - Dividir componentes grandes en sub-componentes más pequeños y especializados.
- **Complejidad Ciclomática:** Evitar anidamientos profundos de `if/else` o `switch`.

---

## 🛠️ 4. Reutilización y DRY (Don't Repeat Yourself)

- **Utilities & Helpers:** Antes de escribir una lógica genérica (formateo de fechas, manipulación de strings, cálculos), verifica si ya existe en `src/app/shared/utils`.
- **Servicios Compartidos:** La comunicación con APIs y la gestión de estado global deben residir en servicios inyectables.
- **Interfaces:** Definir interfaces estrictas para todos los modelos de datos en `src/app/shared/interfaces`. **El uso de `any` está estrictamente prohibido.**

---

## 🧪 5. Calidad y Validación

- **Build Obligatorio:** Ningún cambio será aceptado si rompe la compilación del proyecto. Es responsabilidad del desarrollador asegurar que `npm run build` sea exitoso antes de realizar cualquier commit.
- **Testing Obligatorio:** Cada componente o servicio nuevo **debe** incluir su archivo `.spec.ts` con una cobertura mínima que valide su comportamiento principal.
- **Pre-commit Check:** Es obligatorio ejecutar el script de validación local antes de realizar un push (este script incluye build y tests):
  ```bash
  ./verify-ci.sh
  ```
- **Linting & Formatting:** No se aceptarán cambios que no pasen el check de Prettier (`npm run format` o el plugin de editor configurado).

---

## 🎨 6. Estilos y UI

- **CSS Local:** Evitar estilos globales siempre que sea posible. Usar variables CSS para temas y colores consistentes.
- **Responsive Design:** Todo componente debe ser mobile-first y utilizar clases de Tailwind/CSS Grid/Flexbox para adaptabilidad.

---

## 📝 7. Documentación

- **Comentarios:** Comentar el "por qué" de decisiones complejas, no el "qué" hace el código (el código limpio se explica solo).
- **README/GEMINI.md:** Mantener actualizados estos archivos si se introducen nuevas herramientas o cambios en la arquitectura.
