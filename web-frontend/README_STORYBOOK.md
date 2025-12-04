# Storybook (local)

Quick notes for running Storybook locally in `web-frontend`.

- Install Storybook and dependencies (the repo uses `npx sb@next init` to scaffold):

```powershell
cd web-frontend
npx sb@next init --type react --yes
npm run build-storybook   # build static Storybook to verify
npm run storybook         # run Storybook locally on :6006
```

If you prefer to run the dev server instead of building, use `npm run storybook`.
