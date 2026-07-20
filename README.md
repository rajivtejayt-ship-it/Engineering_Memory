# Engineering Memory

**Reconstruct intent, map decisions, and index human reasoning.**

Engineering Memory is a powerful frontend application designed to reconstruct the underlying intent behind codebase changes. It ingests historical engineering artifacts (commits, PRs, architecture decisions) and presents them in a highly interactive, timeline-driven workspace that gives developers the "why" behind the code.

> **Note**: This is the Stage 8 Hardened Release. The frontend architecture is complete and currently runs entirely on mock data. It is designed so that backend integration requires simply swapping the data layer.

## 🏗 Project Architecture

The architecture emphasizes strict separation between layout components, presentation layers, data access layers, and mock data.

- **App Router (`src/app`)**: Contains all entry points. Marketing and application workspaces are partitioned (`/(marketing)` vs `/(app)`).
- **Component Layer (`src/components`)**:
  - `ui/`: Core design system primitives (buttons, cards, dropdowns).
  - `layout/`: Macro-layout structures (AppShell, Navigation).
  - `repository/`: Domain-specific components for codebase visualization.
  - `timeline/`: Historical event visualization.
  - `feedback/`: Loaders, toasts, badges.
- **State Layer (`src/components/providers`)**: React Context bounds the application state (Theme, Repository Data).
- **Data Layer (`src/mock-data`)**: All backend simulations and JSON fixture data.
- **Design System (`src/design-system`)**: All semantic tokens, motion curves, and custom icons.

## 📂 Folder Structure

```
├── src/
│   ├── app/                # Next.js App Router (Pages, Layouts, Globals)
│   │   ├── (app)/          # Authorized Application Routes (/dashboard, /import)
│   │   └── (marketing)/    # Public Routes (/login, landing)
│   ├── components/         # React Components
│   │   ├── feedback/       # Badges, Loaders, Spinners
│   │   ├── landing/        # Marketing Page Components
│   │   ├── layout/         # AppShell, Sidebar, TopNav
│   │   ├── markdown/       # Safe Markdown Renderers
│   │   ├── navigation/     # Nav links, sections
│   │   ├── providers/      # Theme, Repository Context
│   │   ├── repository/     # Code Viewer, File Explorer
│   │   ├── shared/         # Command Palette, Search
│   │   ├── timeline/       # Historical Spine, Event Nodes
│   │   └── ui/             # Reusable UI Primitives (Radix/Tailwind)
│   ├── constants/          # Application Constants
│   ├── design-system/      # Tokens, Motion Curves, Icons
│   ├── lib/                # Utility Functions (cn)
│   ├── mock-data/          # Mock data for demonstration mode
│   └── types/              # Domain-specific TypeScript Interfaces
├── next.config.ts          # Turbopack-enabled configuration
└── tailwind.config.ts      # Tailwind Configuration
```

## 🎨 Design System

The application uses the Engineering Memory Design System which defines:

- **Tokens**: Strictly semantic CSS variables mapping to a premium dark-mode aesthetic (e.g., `var(--bg-panel)`, `var(--accent)`).
- **Motion**: Defined in `src/design-system/motion.ts` using `framer-motion` for unified transition curves and interaction states.
- **Typography**: Inter (sans) and JetBrains Mono (code/meta), defined in `globals.css`.

> **Rule**: Do not hardcode Hex or RGB values in components. Always use semantic CSS tokens.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Bundler**: Turbopack
- **Styling**: Tailwind CSS + Native CSS Variables
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Primitives**: Radix UI (accessible component roots)

## 🚀 Development Commands

This project uses `npm` as its package manager.

- **Start Dev Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Start Prod Server**: `npm run start`
- **Run Linting**: `npm run lint`

## 🏁 Frontend Stages

The project was built over 8 sequential stages, each hardening a specific layer of the application:
1. **Architecture**: Project setup and foundational directories.
2. **Component Library**: Primitive UI elements and design tokens.
3. **Application Shell**: Navigation, Sidebars, Context Panes.
4. **Landing Experience**: Marketing and Login flows.
5. **Dashboard**: Repository selection and overview.
6. **Core Workspace**: Timeline, Code Viewer, File Explorer, Markdown rendering.
7. **Demo Integration**: End-to-end user flow using strictly typed Mock Data.
8. **Production Hardening**: Accessibility audits, XSS mitigation, syntax fixes, and layout polishing.

## 🤝 Contribution Guidelines

1. **No External Dependencies**: Do not introduce new component libraries unless absolutely necessary. Build on the established Radix/Tailwind primitives.
2. **Strict Accessibility (a11y)**: Ensure all interactive elements use semantic HTML tags (`<button>`, `<a href>`). Support keyboard navigation (`Focus-Visible`).
3. **Security**: Never inject raw HTML. Use safe React component parsing for rich text and syntax highlighting.
4. **Mock Data Separation**: Do not leak mock data logic into standard component definitions. Isolate mock state in Context Providers.
