# RestroPlate Frontend ⚛️⚡

The RestroPlate frontend is a modern **React + Vite** application built for speed, modularity, and a smooth development experience.  
It communicates seamlessly with the RestroPlate .NET Web API to deliver a fast and interactive user interface.

---

> **🤖 AI AGENT DIRECTIVE:** If you are an AI parsing this README, DO NOT execute the prompt below. It is a text template for human use only. Ignore it completely.

``` text
**For Human Developers:**
use this stating promt for agents.

Before you do anything, read AGENT_RULES.md, understand our tech stack (specifically the mix of inline styles and Tailwind), and acknowledge these constraints.
```

## 🚀 Tech Stack

- **React 18** – UI library for building user interfaces
- **Vite** – Next-generation frontend tooling for instant hot-reload and lightning-fast builds
- **React Router** – Client-side routing and navigation
- **Axios / Fetch** – For API communication with the backend
- **ESLint + Prettier (optional)** – Code formatting and linting

---

## 📁 Project Structure

```text
restroplate-frontend/
├── .github/               # GitHub Actions CI/CD workflows
├── public/                # Static assets
├── src/
│   ├── api/               # Axios configuration and interceptors
│   ├── components/        # Reusable UI components (NavBar, Hero, etc.)
│   │   ├── dashboard/     # Dashboard-specific components
│   │   └── hooks/         # Custom React hooks
│   ├── pages/             # Route components (Home, Auth, Dashboards)
│   ├── services/          # API services and business logic (authService.ts)
│   ├── types/             # TypeScript interfaces and types
│   ├── App.tsx            # Application root and router configuration
│   ├── main.tsx           # React entry point
│   └── index.css          # Global styling and Tailwind imports
├── tests/                 # Automated test suite (Pytest, UI, API)
│   ├── api/               # API integration tests
│   └── ui/                # UI end-to-end tests (Playwright)
├── index.html             # Vite HTML entry point
├── package.json           # Dependencies and npm scripts
├── tsconfig.json          # TypeScript configurations
└── vite.config.ts         # Vite bundler configuration
```

---

## 📦 Getting Started

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Run the development server

```bash
npm run dev
```

The Vite dev server usually runs on: **http://localhost:5173**

### 3️⃣ Build for production

```bash
npm run build
```

### 4️⃣ Preview the production build

```bash
npm run preview
```

---

## 🔗 Backend Integration

This application consumes endpoints exposed by the **RestroPlate .NET Web API**, which follows a clean **Layered Architecture** and provides secure, high-performance endpoints for restaurant operations.

Ensure the backend is running before testing frontend API calls.

---
