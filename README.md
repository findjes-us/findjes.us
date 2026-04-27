# FindJes.us

A free, open-source single-page application to browse and search the passages from the **World English Bible (WEB)** that directly quote or describe the teachings and observed actions of Jesus of Nazareth.

## Features

- 📖 **Browse** passages across six books: Matthew, Mark, Luke, John, Acts, and Revelation
- 🔍 **Search** verse text with plain keywords or advanced wildcards (`*`, `?`, `#`, `[a-z]`, `[!abc]`)
- 🗂️ **Filter** by Book, Chapter, and Verse using cascading dropdowns
- ℹ️ **About** page explaining the WEB licence and how to contribute

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) (recommended) **or** [Node.js 20+](https://nodejs.org/) with npm

### Run Locally with Docker

```bash
docker build -t findjes-us .
docker run -p 3000:3000 findjes-us
```

Then open http://localhost:3000 in your browser.

### Run Locally with Node.js

```bash
npm install
npm run dev
```

Then open the URL printed to the terminal (usually http://localhost:5173).

### Build for Production

```bash
npm run build          # outputs to dist/
npm run preview        # preview the production build locally
```

### Lint

```bash
npm run lint
```

## Contributing

Pull requests are welcome! See [CONTRIBUTING](https://github.com/findjes-us/findjes.us) for details.
All content comes from the World English Bible, which is in the public domain.

<!-- original readme content below -->
A website to read about Biblical passages that directly quote or describe Jesus of Nazareth's actions
