

## Add vercel.json for SPA routing

**What**: Create a `vercel.json` file in the project root with SPA rewrites so all routes fall back to `index.html`.

**File to create**: `vercel.json`
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

That's it — one file, one change.

