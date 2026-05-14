# Informatics Career Dashboard

INFO capstone career exploration tool for UW Informatics students. The app runs as a local-only demo: sign-in, quiz results, uploaded audit courses, profile edits, and roadmap progress are stored in browser `localStorage`.

## Running Locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

To test a production build locally:

```bash
npm run build
npm run preview
```

## Demo Accounts

Use the landing page to create a local demo account with any `@uw.edu` email and password. Data stays in that browser only. To reset the demo, clear site data for the local Vite URL or run this in the browser console:

```js
localStorage.removeItem("info5DemoStore");
```

## Hosting on GitHub Pages

This project is configured for fork-friendly GitHub Pages builds:

- Vite uses relative built asset paths with `base: './'`.
- React Router uses hash routes, so direct links work as `https://OWNER.github.io/REPO/#/dashboard`.
- Demo data stays in each visitor's browser through `localStorage`; no Firebase project or secrets are required.

Add this workflow at `.github/workflows/deploy-pages.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

In GitHub, go to **Settings -> Pages -> Build and deployment** and set **Source** to **GitHub Actions**.

## Project Notes

- App entry: `src/main.jsx`
- Routes: `src/App.jsx`
- Local auth/data store: `src/utils/localStore.js`
- Career data: `src/data/careers.js`
- Quiz questions/scoring: `src/data/quizQuestions.js` and `src/utils/quizEngine.js`
- Degree audit parsing: `src/utils/degreeAuditParser.js`

## Team

Created by Celine Chen, Sebastian Downes, Tamara Luu, Jennifer Nguyen, and Cassidy Wong.
