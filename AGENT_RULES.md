# AGENT INSTRUCTIONS FOR RESTROPLATE FRONTEND

## 1. Project Context & Tech Stack

- **Framework:** React 19 with Vite
- **Language:** TypeScript (`.ts`, `.tsx`)
- **Routing:** React Router DOM v7 (`src/App.tsx`)
- **Networking:** Axios (`src/api/axiosSetup.ts`)
- **Styling:** Tailwind CSS v4 (Migrating towards this)
- **Formatting/Linting:** Biome (`biome.json`) & ESLint

## 2. Global Directives (The Brakes)

- **DO NOT** assume or invent project structure. Always verify the current directory tree.
- **DO NOT** create new root-level folders without explicit permission.
- **NEVER** overwrite GitHub Actions workflows (`.github/workflows/deploy.yml`) or build configs (`vite.config.ts`, `tsconfig.*`) unless explicitly asked.
- **NEVER** run package installations (`npm install`, `npm ci`) without asking the user.

## 3. Directory & Architecture Rules

Keep all files strictly within these boundaries. Do not create nested module folders unless authorized.

- **`/src/components`**: All reusable UI elements (e.g., `Button.tsx`, `Card.tsx`). Use PascalCase.
- **`/src/components/hooks`**: Custom React hooks (e.g., `useReveal.ts`). Use camelCase, prefix with `use`.
- **`/src/pages`**: Full route views (e.g., `Home.tsx`). Use PascalCase.
- **`/src/api`**: Base API configuration and Axios setups.
- **`/src/services`**: Business logic, data fetching, and external integrations (e.g., `authService.ts`, `restaurantService.ts`). Use camelCase.
- **`/src/types`**: Global TypeScript interfaces, types, and enums (e.g., `User.ts`, `ApiResponse.ts`). Use PascalCase.
- **`/public`**: Static assets only (SVGs, static images).

## 4. Coding Style & Formatting (Enforced by Biome)

- **Indentation:** Use **Tabs**, not spaces.
- **Quotes:** Use **Double Quotes** (`"`) for strings and JSX attributes.
- **Types:** Always define strict TypeScript interfaces/types for component props and API responses. Store global types in `/src/types`. Do not use `any`.
- **Imports:** Organize imports cleanly. Biome is configured to auto-organize them.

## 5. Styling Paradigm (CRITICAL)

- **Context:** The project currently contains legacy inline styles (`React.CSSProperties`) and injected `<style>` tags (e.g., in `Hero.tsx`, `CtaSection.tsx`). However, Tailwind CSS v4 is installed and configured.
- **Rule for NEW components:** Strictly use **Tailwind CSS** utility classes via the `className` attribute. Do not write new inline styles.
- **Rule for EXISTING components:** If modifying an existing component, you may maintain its inline `style={{...}}` objects to prevent breaking the layout, UNLESS explicitly instructed to "refactor to Tailwind."

## 6. Routing & API Guidelines

- **API Calls:** Always use the pre-configured Axios instance from `src/api/axiosSetup.ts`. Do not use native `fetch()`. Call APIs through functions defined in `/src/services`.
- **Routing:** Add new routes strictly inside `src/App.tsx` using `<Route />`.
- **Base URL:** Remember this app is configured to deploy to GitHub Pages under the `/RestroPlate/` base path (set in `vite.config.ts`). Do not hardcode absolute root paths (`/`) for assets; rely on Vite's asset handling or the `VITE_API_BASE_URL` env variable.

## 7. Refactoring Limits

- If a user request requires modifying more than 3 files simultaneously, pause and provide a short bulleted architectural summary of your plan before generating code.
