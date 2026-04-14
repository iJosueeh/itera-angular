<div align="center">

# Itera AI Mentor

Plataforma web de orientacion profesional para comparar carreras por salario, demanda y crecimiento con acompanamiento de un mentor IA.

![Angular](https://img.shields.io/badge/Angular-21.2-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)
![Build](https://img.shields.io/badge/Build-Passing-22C55E?style=for-the-badge)
![Idioma](https://img.shields.io/badge/Idioma-Espanol-2563EB?style=for-the-badge)

</div>

---

## Tabla de contenidos

- Vision
- Caracteristicas
- Stack tecnologico
- Arquitectura
- Rutas
- Puesta en marcha
- Scripts
- UI y diseño
- Roadmap

---

## Vision

Itera esta pensado para ayudar a estudiantes y profesionales a tomar decisiones de carrera con mejor informacion y una experiencia guiada.

Objetivos del producto:

- Comparar opciones profesionales en un solo flujo.
- Traducir datos a decisiones practicas.
- Ofrecer una experiencia clara, rapida y visual.

---

## Caracteristicas

| Area | Implementacion actual |
| --- | --- |
| Landing | Dashboard principal en `/` |
| Comparador | Snapshot por carrera con datos mock |
| Autenticacion | Login y Registro con formularios reactivos |
| Social login UI | Google y LinkedIn |
| Servicios mock | Dashboard + Auth con latencia simulada (`delay`) |
| Navegacion | Lazy loading por feature |
| Fallback | Pagina 404 para rutas no encontradas |
| Shared UI | BaseLayout, Header y Footer reutilizables |

---

## Stack tecnologico

- Angular 21.2 (arquitectura standalone)
- Tailwind CSS 4.1
- RxJS 7.8
- Bootstrap Icons
- Vitest
- Tipografias: Sora y Nunito Sans

---

## Arquitectura

```text
src/
  app/
    features/
      dashboard/
      auth/
        login/
        register/
    shared/
      components/
        base-layout/
        header/
        footer/
        not-found-page/
```

Patron principal:

- `features`: dominio funcional.
- `shared/components`: piezas reutilizables de interfaz.
- `services`: mock API y logica de acceso a datos.
- `interfaces`: contratos tipados para cada feature.

---

## Rutas

| Ruta | Comportamiento |
| --- | --- |
| `/` | Dashboard principal |
| `/auth/login` | Inicio de sesion |
| `/auth/register` | Registro de usuario |
| `/dashboard` | Redireccion a `/` |
| `**` | Vista 404 |

---

## Puesta en marcha

### 1. Instalar dependencias

```bash
npm install
```

### 2. Ejecutar en desarrollo

```bash
npm run start
```

Aplicacion disponible en `http://localhost:4200`.

### 3. Generar build

```bash
npm run build
```

### 4. Ejecutar tests

```bash
npm run test
```

---

## Scripts

| Script | Descripcion |
| --- | --- |
| `npm run start` | Levanta servidor de desarrollo |
| `npm run build` | Compila build de produccion |
| `npm run watch` | Compila en modo observacion |
| `npm run test` | Ejecuta pruebas |

---

## UI y diseño

Base visual definida en variables globales:

- `--page-bg`
- `--text-color`
- `--brand`
- `--accent`
- `--title-font` (Sora)
- `--body-font` (Nunito Sans)

Lineamientos aplicados:

- Contenido en espanol orientado a mentoring de carrera.
- Identidad consistente entre dashboard y auth.
- Composicion responsive con Tailwind y componentes reutilizables.

---

## Roadmap

- Guard de autenticacion para rutas protegidas.
- Flujo de recuperacion de contrasena.
- Comparativa multi-carrera en paralelo.
- Mayor cobertura de pruebas para formularios y servicios.

---

## Creditos

Proyecto generado con Angular CLI 21.2.2 y evolucionado a una arquitectura modular basada en features y shared components.
