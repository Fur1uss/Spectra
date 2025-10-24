# Spectra AI Coding Instructions# Spectra AI Coding Instructions# Spectra AI Coding Instructions# Spectra AI Coding Instructions

## Quick Reference**Spectra** is a React 19 + Vite 7 paranormal case reporting platform using React Router v7, Supabase backend, and bcrypt authentication. Built for Spanish-speaking users.


- 📊 **Database Schema**: See `.github/DATABASE.md` for all tables, relationships, queries, and data flows

- 🛣️ **Router Setup**: See `ROUTER_GUIDE.md` for React Router v7 configuration

## Architecture Overview**Spectra** is a React 19 + Vite 7 paranormal case reporting platform using React Router v7, Supabase backend, and bcrypt authentication. Built for Spanish-speaking users.## Project Overview

### React + Vite + Router Setup

- **Framework**: React 19 with Vite 7 for HMR and fast builds### React + Vite + Router Setup**Spectra** is a React + Vite paranormal case collection platform built with React Router for navigation. The project uses pnpm for package management and follows a component-based architecture with page-level routing.

- **Routing**: React Router v7 in `src/main.jsx` (BrowserRouter wrapper) and `src/App.jsx` (route definitions)

- **Package Manager**: pnpm only- **Framework**: React 19 with Vite 7 for HMR and fast builds

- **No TypeScript**: Pure JavaScript/JSX; eslint rule ignores unused capital-letter vars (components)

- **Routing**: React Router v7 in `src/main.jsx` (BrowserRouter wrapper) and `src/App.jsx` (route definitions)## Architecture Overview

### Authentication & State Management

**AuthContext** (`src/context/AuthContext.jsx`) provides global auth state:- **Package Manager**: pnpm only

- `isLoggedIn`, `user`, `loading` state managed via localStorage + custom `sessionChange` event

- `login(userData)` / `logout()` methods dispatch `sessionChange` event for cross-tab sync- **No TypeScript**: Pure JavaScript/JSX; eslint rule ignores unused capital-letter vars (components)## Architecture & Key Patterns

- Protected routes check `isLoggedIn` and redirect to `/login` if needed

- User data stored as JSON in localStorage under `user` key; userId separately under `userId`



**Backend Integration**:### Authentication & State Management### React + Vite + Router Setup

- Supabase client initialized in `src/utils/supabase.js` via `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

- All database operations documented in `.github/DATABASE.md` (tables: User, Case, Case_Type, Location, Files, Comment)**AuthContext** (`src/context/AuthContext.jsx`) provides global auth state:

- Password hashing: bcryptjs (10 salt rounds) in `src/utils/auth.js`

- `isLoggedIn`, `user`, `loading` state managed via localStorage + custom `sessionChange` event- **Framework**: React 19 with Vite 7 for HMR and fast builds### React + Vite Setup

### Routes (defined in `src/App.jsx`)

```- `login(userData)` / `logout()` methods dispatch `sessionChange` event for cross-tab sync

/                 → LandingPage

/login            → LoginPage (NavBar hidden)- Consumers use `useContext(AuthContext)` to access auth and protect routes (see `UploadStepper.jsx` for redirect pattern)- **Routing**: React Router v7 in `src/main.jsx` (BrowserRouter wrapper) and `src/App.jsx` (route definitions)- **Framework**: React 19 with Vite 7 for fast builds and HMR

/registration     → RegistrationPage (NavBar hidden)

/main             → Main page- User data stored as JSON in localStorage under `user` key; userId separately under `userId`

/hub              → Hub (case listing stub)

/upload           → UploadStepper (protected, 4-step form)- **Package Manager**: pnpm only- **Build**: `pnpm dev` for development, `pnpm build` for production

/profile          → ProfilePage

/case/:caseId     → ViewCase**Backend Integration**:

/extra-case       → ExtraCase (stub)

```- Supabase tables: `User`, `case`, `Case_Type`, `location`, `files`- **No TypeScript**: Pure JavaScript/JSX; eslint rule ignores unused capital-letter vars (components)- **Linting**: ESLint with React hooks and refresh rules enabled



## Directory Structure- Client initialized in `src/utils/supabase.js` via env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`



```- Password hashing: bcryptjs library (10 salt rounds in `src/utils/auth.js`)- **Key Rule**: Unused variables starting with capital letters (components) are ignored

src/

├── context/AuthContext.jsx        # Global auth state + hooks

├── utils/

│   ├── auth.js                    # loginUser(), registerUser(), hashPassword(), verifyPassword()### Routes (defined in `src/App.jsx`)### Authentication & State Management

│   ├── uploadHandler.js           # validateFiles(), uploadFilesToSupabase(), createCase()

│   └── supabase.js                # Supabase client init```

├── components/

│   ├── NavBar/                    # Navigation (Link + useNavigate)/                 → LandingPage**AuthContext** (`src/context/AuthContext.jsx`) provides global auth state:### Routing Structure

│   ├── LoginForm/                 # Login form submission

│   ├── RegistrationStepper/       # Multi-step registration/login            → LoginPage (NavBar hidden)

│   ├── UploadStepper/             # 4-step case upload

│   ├── SuccessModal/              # Post-action confirmation/registration     → RegistrationPage (NavBar hidden)- `isLoggedIn`, `user`, `loading` state managed via localStorage + custom `sessionChange` eventReact Router v7 is configured in `src/main.jsx` (wraps app with `BrowserRouter`) and `src/App.jsx` defines all routes:

│   └── Other components (ElementCard, RegistrationForm, etc.)

├── pages//main             → Main page

│   ├── LandingPage/

│   ├── Login/ (LoginPage.jsx)/hub              → Hub (case listing stub)- `login(userData)` / `logout()` methods dispatch `sessionChange` event for cross-tab sync

│   ├── Main/ (RegistrationPage.jsx, Main.jsx)

│   ├── Upload/ (UploadPage.jsx)/upload           → UploadStepper (multi-step form)

│   ├── Profile/ (ProfilePage.jsx)

│   └── ViewCase//profile          → ProfilePage- Consumers use `useContext(AuthContext)` to access auth and protect routes (see `UploadStepper.jsx` for redirect pattern)```jsx

├── App.jsx                        # Route definitions

└── main.jsx                       # BrowserRouter + AuthProvider/case/:caseId     → ViewCase (parameterized route)

```

/extra-case       → ExtraCase (stub)- User data stored as JSON in localStorage under `user` key; userId separately under `userId`<Route path="/" element={<LandingPage />} />           // Landing page

**Naming**: PascalCase components (UploadStepper.jsx), kebab-case folders (UploadStepper/)

```

## Key Data Flows

NavBar conditionally shown; hidden on `/login` and `/registration` routes.<Route path="/login" element={<LoginPage />} />        // Authentication

### Registration

RegistrationStepper → collect data → registerUser() → insert into User table → success modal



### Login## Directory & File Structure**Backend Integration**:<Route path="/hub" element={<Hub />} />               // Case listing

LoginForm → loginUser() → verify bcrypt password → save to localStorage + AuthContext → navigate to /hub



### Case Upload (4-step flow)

1. Case Type & Time (case_type_id, timeHour)```- Supabase tables: `User`, `case`, `Case_Type`, `location`, `files`<Route path="/upload" element={<Upload />} />         // Case submission

2. Location (country, region, address → create/fetch Location record)

3. Description (text, min 50 chars)src/

4. Multimedia (validate: 1 video max, unlimited images, 2 audios max)

→ Create Case record → upload files to `multimedia` bucket → save URLs in Files table├── context/AuthContext.jsx        # Global auth provider + hooks- Client initialized in `src/utils/supabase.js` via env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY````



**See `.github/DATABASE.md` for complete schema and relationships**├── utils/



## Development Commands│   ├── auth.js                    # loginUser(), registerUser(), hashPassword(), verifyPassword()- Password hashing: bcryptjs library (10 salt rounds in `src/utils/auth.js`)



```bash│   ├── uploadHandler.js           # validateFiles(), uploadFilesToSupabase(), createCase()

pnpm dev       # Dev server http://localhost:5173 with HMR

pnpm build     # Production build → /dist│   └── supabase.js                # Supabase client init**Navigation Patterns**:

pnpm lint      # ESLint check (ignores unused vars starting with capital letters)

pnpm preview   # Preview production build├── components/

```

│   ├── NavBar/                    # Navigation with <Link> and programmatic navigate()### Routes (defined in `src/App.jsx`)- Use `<Link to="/path">` for navigation UI in NavBar and components

## Critical Patterns

│   ├── LoginForm/                 # Form submission → auth.js loginUser()

**Protected Routes:**

```jsx│   ├── RegistrationStepper/       # Multi-step registration```- Use `useNavigate()` hook for programmatic navigation after actions

const UploadStepper = () => {

  const { isLoggedIn } = useContext(AuthContext)│   ├── UploadStepper/             # 4-step case upload (type/time, location, description, files)

  useEffect(() => {

    if (!isLoggedIn) navigate('/login')│   ├── SuccessModal/              # Post-upload confirmation/                 → LandingPage- Example in NavBar: `<Link to="/hub">Casos</Link>`

  }, [isLoggedIn, navigate])

}│   └── ElementCard/, RegistrationForm/  # Other UI components

```

├── pages//login            → LoginPage (NavBar hidden)

**Multi-Step Forms**: Use state for current step + per-step validation (UploadStepper example)

│   ├── LandingPage/

**File Validation**: `validateFiles(files)` returns `{ isValid, errors, counts }`

│   ├── Login/ (LoginPage.jsx)/registration     → RegistrationPage (NavBar hidden)### Directory Structure & Naming

**Supabase Operations:**

```javascript│   ├── Main/ (RegistrationPage.jsx, Main.jsx)

// Select

const { data, error } = await supabase│   ├── Upload/ (UploadPage.jsx)/main             → Main page```

  .from('TableName').select('*').eq('column', value)

│   ├── Profile/ (ProfilePage.jsx)

// Insert

const { data, error } = await supabase│   └── ViewCase//hub              → Hub (case listing stub)src/

  .from('TableName').insert([{ ...data }]).select()

├── App.jsx                        # Route definitions

// Storage

const { error } = await supabase.storage└── main.jsx                       # BrowserRouter + AuthProvider wrapper/upload           → UploadStepper (multi-step form)├── components/        # Reusable UI components (Button, Card, etc.)

  .from('multimedia').upload(`caso_${id}/fotos/${file}`, file)

``````



**Co-located CSS**: Every component has matching .css file (no inline styles)/profile          → ProfilePage│   ├── NavBar/       # Navigation with Links to routes



## Important Conventions**Naming Convention**: PascalCase components (e.g., `UploadStepper.jsx`), kebab-case folders (e.g., `UploadStepper/`)



- **Spanish UI**: All text in Spanish (Casos, Ingresar, Subir Caso, etc.)/case/:caseId     → ViewCase (parameterized route)│   └── ElementCard/  # Info card components using .map() for lists

- **Public Assets**: Store images in `public/`, reference as `/filename.webp`

- **LocalStorage Keys**: `user`, `userId` (don't change without updating AuthContext)## Key Data Flows

- **Environment Variables**: Prefix with `VITE_` for Vite access

- **Supabase Env Required**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`/extra-case       → ExtraCase (stub)├── pages/            # Page components (one per route)

- **Error Handling**: All async operations use try/catch + loading state + user messaging

### Registration

## What To Avoid

`RegistrationStepper` → collect user data → `registerUser()` (auth.js) → Supabase `User` table → Success modal```│   ├── LandingPage/

- Importing images (use `/path` instead)

- Class components (all functional + hooks)

- Inline CSS (co-locate in .css files)

- TypeScript without full toolchain update### LoginNavBar conditionally shown; hidden on `/login` and `/registration` routes.│   ├── Login/

- Changing localStorage keys without AuthContext update

- Long-term placeholder stubs (e.g., `const Hub = () => <h1>Hub</h1>`)`LoginForm` → `loginUser()` → verify password via bcrypt → store user in localStorage + AuthContext → navigate to `/hub`

- Hardcoded table names (check DATABASE.md for exact names and FK relationships)

│   └── Main/

## Reference Files

### Case Upload (UploadStepper)

- **Full Database Documentation**: `.github/DATABASE.md` (schema, relationships, queries, constraints)

- **Auth Example**: `src/utils/auth.js` + `src/components/LoginForm/LoginForm.jsx`1. 4-step form: case type/time → location → description → files## Directory & File Structure├── assets/           # Images, icons (reference as `/filename.webp`)

- **Protected Route Example**: `src/components/UploadStepper/UploadStepper.jsx`

- **Navigation Example**: `src/components/NavBar/NavBar.jsx`2. Validate files: 1 video max, unlimited images, 2 audios max

- **File Upload Example**: `src/utils/uploadHandler.js`

- **Context Usage**: `src/context/AuthContext.jsx`3. Create location (or fetch existing) → insert `case` row → upload multimedia to Supabase Storage (`multimedia` bucket) → save file URLs in `files` table└── App.jsx          # Route definitions


4. Show success modal with caseId

``````

### NavBar Conditional Rendering

- Show NavBar on all routes except `/login` and `/registration` (uses `useLocation()`)src/

- Display "SUBIR CASO" button + profile icon only if `isLoggedIn === true`

- Use `<Link>` for static navigation; `useNavigate()` after actions (e.g., after login form submit)├── context/AuthContext.jsx        # Global auth provider + hooks**File Naming**: PascalCase for components (ElementCard.jsx), kebab-case for folders (ElementCard/)



## Development Commands├── utils/



```bash│   ├── auth.js                    # loginUser(), registerUser(), hashPassword(), verifyPassword()### Component Patterns

pnpm dev       # Start dev server (http://localhost:5173, HMR enabled)

pnpm build     # Production build to /dist│   ├── uploadHandler.js           # validateFiles(), uploadFilesToSupabase(), createCase()

pnpm lint      # ESLint check (ignores unused vars starting with capital letter)

pnpm preview   # Preview production build│   └── supabase.js                # Supabase client init**Stateless Functional Components**: All components use arrow functions with no class syntax.

```

├── components/

## Critical Patterns

│   ├── NavBar/                    # Navigation with <Link> and programmatic navigate()**Array Mapping**: ElementCard demonstrates the pattern for rendering lists:

**Protected Routes**: Wrap component logic with auth check:

```jsx│   ├── LoginForm/                 # Form submission → auth.js loginUser()```jsx

const UploadStepper = () => {

  const { isLoggedIn } = useContext(AuthContext)│   ├── RegistrationStepper/       # Multi-step registrationconst infoObjectArray = [{icon: "/ic01.webp", text: "..."}, ...]

  useEffect(() => {

    if (!isLoggedIn) navigate('/login')│   ├── UploadStepper/             # 4-step case upload (type/time, location, description, files){infoObjectArray.map((item, index) => (

  }, [isLoggedIn, navigate])

```│   ├── SuccessModal/              # Post-upload confirmation  <div key={index}>{item.text}</div>



**Multi-Step Forms**: Use state for current step + validation per step (UploadStepper, RegistrationStepper exemplify this)│   └── ElementCard/, RegistrationForm/  # Other UI components))}



**File Validation**: Use `validateFiles()` from uploadHandler.js before upload; returns `{ isValid, errors, counts }`├── pages/```



**Async Operations**: All auth/upload/DB ops are async; use try/catch with loading state + error messaging│   ├── LandingPage/



**Co-located CSS**: Every component folder has matching `.css` file; no inline styles│   ├── Login/ (LoginPage.jsx)**CSS Imports**: Each component has co-located CSS (e.g., `ElementCard.jsx` with `ElementCard.css`).



## Important Conventions│   ├── Main/ (RegistrationPage.jsx, Main.jsx)



- **Spanish Labels**: All UI text in Spanish (Casos, Ingresar, Subir Caso, etc.) — maintain consistency│   ├── Upload/ (UploadPage.jsx)## Developer Workflows

- **Public Assets**: Images in `public/` folder, referenced as `/filename.webp` (no imports)

- **LocalStorage Keys**: `user`, `userId` — don't change without updating AuthContext│   ├── Profile/ (ProfilePage.jsx)

- **Environment Variables**: Prefix with `VITE_` for Vite access via `import.meta.env`

- **Supabase Env**: Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`│   └── ViewCase/### Commands



## What To Avoid├── App.jsx                        # Route definitions- `pnpm dev` - Start dev server with HMR at http://localhost:5173



- Importing images (use `/path` in public folder instead)└── main.jsx                       # BrowserRouter + AuthProvider wrapper- `pnpm build` - Create optimized production build in `/dist`

- Class components (all functional + hooks)

- Inline CSS (co-locate in .css files)```- `pnpm lint` - Check for linting errors (ESLint)

- TypeScript without updating entire toolchain

- Changing localStorage keys without updating AuthContext- `pnpm preview` - Preview production build locally

- Placeholder stubs in App.jsx long-term (e.g., `const Hub = () => <h1>Hub</h1>`)

**Naming Convention**: PascalCase components (e.g., `UploadStepper.jsx`), kebab-case folders (e.g., `UploadStepper/`)

## Reference Implementations

### Adding a New Page

- **Auth Flow**: `src/components/LoginForm/LoginForm.jsx` + `src/utils/auth.js`

- **Protected Route Pattern**: `src/components/UploadStepper/UploadStepper.jsx` (useEffect check)## Key Data Flows1. Create page folder in `src/pages/PageName/`

- **Multi-Step Form**: `src/components/UploadStepper/UploadStepper.jsx` (4 steps with validation)

- **Navigation**: `src/components/NavBar/NavBar.jsx` (Link + useNavigate)2. Add `PageName.jsx` and `PageName.css`

- **File Upload**: `src/utils/uploadHandler.js` (validation + Supabase Storage)

- **Context Usage**: `src/context/AuthContext.jsx` + any component with `useContext(AuthContext)`### Registration3. Import in `src/App.jsx` and add route definition


`RegistrationStepper` → collect user data → `registerUser()` (auth.js) → Supabase `User` table → Success modal4. Update NavBar if it's a primary navigation target



### Login### Adding a New Component

`LoginForm` → `loginUser()` → verify password via bcrypt → store user in localStorage + AuthContext → navigate to `/hub`1. Create folder in `src/components/ComponentName/`

2. Add `ComponentName.jsx` and `ComponentName.css`

### Case Upload (UploadStepper)3. Import and use in pages

1. 4-step form: case type/time → location → description → files4. Export as default export

2. Validate files: 1 video max, unlimited images, 2 audios max

3. Create location (or fetch existing) → insert `case` row → upload multimedia to Supabase Storage (`multimedia` bucket) → save file URLs in `files` table## Important Conventions

4. Show success modal with caseId

- **Assets**: Store images in `public/` folder and reference as `/filename.webp` (avoids import statements)

### NavBar Conditional Rendering- **Styling**: Avoid inline styles; use co-located CSS files for maintainability

- Show NavBar on all routes except `/login` and `/registration` (uses `useLocation()`)- **Placeholder Pages**: Temporary pages (Hub, Registration, Upload, ViewCase, ExtraCase) use simple `<h1>` headers in `App.jsx` - replace with actual components as features are implemented

- Display "SUBIR CASO" button + profile icon only if `isLoggedIn === true`- **No TypeScript**: Project uses JavaScript with JSX; type safety not enforced at compile time

- Use `<Link>` for static navigation; `useNavigate()` after actions (e.g., after login form submit)- **Language**: Project uses Spanish naming conventions (Casos, Ingresar, Registro) - maintain consistency



## Development Commands## Spanish Context

The project targets a Spanish audience. Key domain terms:

```bash- **Casos**: Paranormal cases

pnpm dev       # Start dev server (http://localhost:5173, HMR enabled)- **Ufología**: UFO-logy

pnpm build     # Production build to /dist- **Criptozoología**: Cryptozoology

pnpm lint      # ESLint check (ignores unused vars starting with capital letter)- **Subir**: Upload

pnpm preview   # Preview production build

```## Integration Points



## Critical Patterns- **NavBar Navigation**: Always wraps route links; shared across all pages via App.jsx

- **Data Flow**: No global state visible yet (no Context/Redux) - components receive data via props

**Protected Routes**: Wrap component logic with auth check:- **External APIs**: No external services configured yet

```jsx- **Public Assets**: Images stored in `public/` with `/` prefix paths

const UploadStepper = () => {

  const { isLoggedIn } = useContext(AuthContext)## What To Avoid

  useEffect(() => {

    if (!isLoggedIn) navigate('/login')- Adding TypeScript without updating the entire toolchain

  }, [isLoggedIn, navigate])- Importing images directly (use `public/` + path instead)

```- Class components (codebase uses functional components)

- Inline CSS (co-locate in .css files)

**Multi-Step Forms**: Use state for current step + validation per step (UploadStepper, RegistrationStepper exemplify this)- Committing temporary component stubs - replace them with real implementations



**File Validation**: Use `validateFiles()` from uploadHandler.js before upload; returns `{ isValid, errors, counts }`## Reference Files



**Async Operations**: All auth/upload/DB ops are async; use try/catch with loading state + error messaging- **Routing Guide**: See `ROUTER_GUIDE.md` for detailed React Router documentation

- **NavBar Example**: `src/components/NavBar/NavBar.jsx` - demonstrates Link usage

**Co-located CSS**: Every component folder has matching `.css` file; no inline styles- **List Rendering**: `src/components/ElementCard/ElementCard.jsx` - shows .map() pattern

- **Page Structure**: `src/pages/LandingPage/LandingPage.jsx` - example complete page

## Important Conventions

- **Spanish Labels**: All UI text in Spanish (Casos, Ingresar, Subir Caso, etc.) — maintain consistency
- **Public Assets**: Images in `public/` folder, referenced as `/filename.webp` (no imports)
- **LocalStorage Keys**: `user`, `userId` — don't change without updating AuthContext
- **Environment Variables**: Prefix with `VITE_` for Vite access via `import.meta.env`
- **Supabase Env**: Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`

## What To Avoid

- Importing images (use `/path` in public folder instead)
- Class components (all functional + hooks)
- Inline CSS (co-locate in .css files)
- TypeScript without updating entire toolchain
- Changing localStorage keys without updating AuthContext
- Placeholder stubs in App.jsx long-term (e.g., `const Hub = () => <h1>Hub</h1>`)

## Reference Implementations

- **Auth Flow**: `src/components/LoginForm/LoginForm.jsx` + `src/utils/auth.js`
- **Protected Route Pattern**: `src/components/UploadStepper/UploadStepper.jsx` (useEffect check)
- **Multi-Step Form**: `src/components/UploadStepper/UploadStepper.jsx` (4 steps with validation)
- **Navigation**: `src/components/NavBar/NavBar.jsx` (Link + useNavigate)
- **File Upload**: `src/utils/uploadHandler.js` (validation + Supabase Storage)
- **Context Usage**: `src/context/AuthContext.jsx` + any component with `useContext(AuthContext)`
