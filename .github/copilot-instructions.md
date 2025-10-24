# Spectra AI Coding Instructions

## Project Overview
**Spectra** is a React + Vite paranormal case collection platform built with React Router for navigation. The project uses pnpm for package management and follows a component-based architecture with page-level routing.

## Architecture & Key Patterns

### React + Vite Setup
- **Framework**: React 19 with Vite 7 for fast builds and HMR
- **Build**: `pnpm dev` for development, `pnpm build` for production
- **Linting**: ESLint with React hooks and refresh rules enabled
- **Key Rule**: Unused variables starting with capital letters (components) are ignored

### Routing Structure
React Router v7 is configured in `src/main.jsx` (wraps app with `BrowserRouter`) and `src/App.jsx` defines all routes:

```jsx
<Route path="/" element={<LandingPage />} />           // Landing page
<Route path="/login" element={<LoginPage />} />        // Authentication
<Route path="/hub" element={<Hub />} />               // Case listing
<Route path="/upload" element={<Upload />} />         // Case submission
```

**Navigation Patterns**:
- Use `<Link to="/path">` for navigation UI in NavBar and components
- Use `useNavigate()` hook for programmatic navigation after actions
- Example in NavBar: `<Link to="/hub">Casos</Link>`

### Directory Structure & Naming
```
src/
├── components/        # Reusable UI components (Button, Card, etc.)
│   ├── NavBar/       # Navigation with Links to routes
│   └── ElementCard/  # Info card components using .map() for lists
├── pages/            # Page components (one per route)
│   ├── LandingPage/
│   ├── Login/
│   └── Main/
├── assets/           # Images, icons (reference as `/filename.webp`)
└── App.jsx          # Route definitions
```

**File Naming**: PascalCase for components (ElementCard.jsx), kebab-case for folders (ElementCard/)

### Component Patterns

**Stateless Functional Components**: All components use arrow functions with no class syntax.

**Array Mapping**: ElementCard demonstrates the pattern for rendering lists:
```jsx
const infoObjectArray = [{icon: "/ic01.webp", text: "..."}, ...]
{infoObjectArray.map((item, index) => (
  <div key={index}>{item.text}</div>
))}
```

**CSS Imports**: Each component has co-located CSS (e.g., `ElementCard.jsx` with `ElementCard.css`).

## Developer Workflows

### Commands
- `pnpm dev` - Start dev server with HMR at http://localhost:5173
- `pnpm build` - Create optimized production build in `/dist`
- `pnpm lint` - Check for linting errors (ESLint)
- `pnpm preview` - Preview production build locally

### Adding a New Page
1. Create page folder in `src/pages/PageName/`
2. Add `PageName.jsx` and `PageName.css`
3. Import in `src/App.jsx` and add route definition
4. Update NavBar if it's a primary navigation target

### Adding a New Component
1. Create folder in `src/components/ComponentName/`
2. Add `ComponentName.jsx` and `ComponentName.css`
3. Import and use in pages
4. Export as default export

## Important Conventions

- **Assets**: Store images in `public/` folder and reference as `/filename.webp` (avoids import statements)
- **Styling**: Avoid inline styles; use co-located CSS files for maintainability
- **Placeholder Pages**: Temporary pages (Hub, Registration, Upload, ViewCase, ExtraCase) use simple `<h1>` headers in `App.jsx` - replace with actual components as features are implemented
- **No TypeScript**: Project uses JavaScript with JSX; type safety not enforced at compile time
- **Language**: Project uses Spanish naming conventions (Casos, Ingresar, Registro) - maintain consistency

## Spanish Context
The project targets a Spanish audience. Key domain terms:
- **Casos**: Paranormal cases
- **Ufología**: UFO-logy
- **Criptozoología**: Cryptozoology
- **Subir**: Upload

## Integration Points

- **NavBar Navigation**: Always wraps route links; shared across all pages via App.jsx
- **Data Flow**: No global state visible yet (no Context/Redux) - components receive data via props
- **External APIs**: No external services configured yet
- **Public Assets**: Images stored in `public/` with `/` prefix paths

## What To Avoid

- Adding TypeScript without updating the entire toolchain
- Importing images directly (use `public/` + path instead)
- Class components (codebase uses functional components)
- Inline CSS (co-locate in .css files)
- Committing temporary component stubs - replace them with real implementations

## Reference Files

- **Routing Guide**: See `ROUTER_GUIDE.md` for detailed React Router documentation
- **NavBar Example**: `src/components/NavBar/NavBar.jsx` - demonstrates Link usage
- **List Rendering**: `src/components/ElementCard/ElementCard.jsx` - shows .map() pattern
- **Page Structure**: `src/pages/LandingPage/LandingPage.jsx` - example complete page
