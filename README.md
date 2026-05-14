# Informatics Career Dashboard

INFO capstone career exploration tool for UW Informatics students. The app runs as a local-only demo: sign-in, quiz results, uploaded audit courses, profile edits, and roadmap progress are stored in browser `localStorage`.

**Live site:** (https://s3bast14nd.github.io/UW-iSchool-Dashboard/)  
**Presentation deck:** (https://docs.google.com/presentation/d/1gjW_GhIG0vREslerhsoW-C4SZ9O_s1EgFrV-STmF624/edit?usp=sharing)

---

## Running it locally

Built in plain HTML/CSS/JS. Clone the repo and open `index.html` in your browser.

```bash
git clone https://github.com/S3BAST14ND/INFO-5.git
cd INFO-5
```

If you want live reload while editing, the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VS Code works well.

---

## Demo Accounts

Use the landing page to create a local demo account with any `@uw.edu` email and password. Data stays in that browser only. To reset the demo, clear site data for the local Vite URL or run this in the browser console:

```js
localStorage.removeItem("info5DemoStore");
```

## Making changes

If you're picking this up and want to keep working on it:

- **Career data** (salaries, skills, roadmaps, courses) is all in `js/careers.js` — that's probably the most likely thing you'd want to update
- **Quiz questions or how scoring works** → `js/quiz.js`
- **Styling** → `css/styles.css` (we tried to keep it consistent across pages but it's not perfect)

For adding a new career path, add an entry to the `careerData` object in `careers.js`:

```js
yourCareerKey: {
  title: "Job Title",
  emoji: "💼",
  salary: "$XX,000 – $XX,000",
  salaryMid: 00000,
  education: "Bachelor's Degree",
  skills: ["Skill 1", "Skill 2", "Skill 3"],
  roadmap: [
    "Step 1",
    "Step 2",
    "Step 3",
  ],
  courses: [
    { code: "INFO XXX", title: "Course Title" },
  ],
}
```

Then update the scoring in `quiz.js` so the new career can actually show up as a result.

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

Thank you for your consideration!
