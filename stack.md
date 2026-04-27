# Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Front-end framework | [Vue 3](https://vuejs.org/) | Reactive component-based UI |
| Build tool | [Vite 5](https://vitejs.dev/) | Fast dev server & production bundler |
| CSS framework | [Tailwind CSS 3](https://tailwindcss.com/) | Utility-first responsive styling |
| Icons | [Tabler Icons](https://tabler.io/icons) via `@tabler/icons-vue` | Consistent SVG icon set |
| Hosting | [GitHub Pages](https://pages.github.com/) | Static file hosting, no server required |
| CI/CD | [GitHub Actions](https://github.com/features/actions) | Automated lint, build, and deploy |
| Local development | [Docker](https://www.docker.com/) | Reproducible local build and serve |
| Linter | [ESLint](https://eslint.org/) + `eslint-plugin-vue` | Code quality and style enforcement |

## Key Design Decisions

- **No backend required** – all data is served as a static JSON file (`web.json`) from the same GitHub Pages origin.
- **Public-domain scripture** – the World English Bible (WEB) translation is used because it carries no copyright restrictions.
- **Wildcard search** – a custom `wildcardToRegex` utility converts glob-style patterns (`*`, `?`, `#`, `[...]`, `[!...]`) to regular expressions for flexible text search.
