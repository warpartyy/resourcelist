# Resource Directory Admin System

This project is a full-stack community resource directory built with:

* Next.js (App Router)
* Supabase (Postgres + Auth)
* TypeScript
* Tailwind CSS
* mfm-ui

It supports:

* Public-facing resource directory
* Admin dashboard for reviewing and managing submissions

---

## 🚀 Development

Start the dev server:

```bash
npm run dev
```

---

## 📦 Deployment

Standard Git workflow:

```bash
git add .
git commit -m "chat bot improvment"
git push
```

---

## 🛠️ Useful Commands (Personal Dev Notes)

### Supabase

```bash
npx supabase login
npx supabase projects list
```

---

### Dependencies 

```bash
npm update @mfm/ui
```

---

### Fix TypeScript Issues

```bash
# VS Code
Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

---

## 🧠 Notes

* All resource data is dynamic (no hardcoded data)
* Uses a single-table `resources` model
* Admin actions (approve/reject/delete) update existing records — no duplicate inserts
* Routing is slug-based (`/resources/[slug]`)

---
