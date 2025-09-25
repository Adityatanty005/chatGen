## Frontend Deployment (Vercel)

1) Environment variables (Vercel → Project Settings → Environment Variables):

```
VITE_API_URL=https://your-backend.onrender.com
# Optional, defaults to VITE_API_URL
# VITE_SOCKET_URL=https://your-backend.onrender.com
```

2) Build settings (Vercel):
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

3) SPA routing:
- `vercel.json` is included to rewrite all routes to `index.html`.

4) Local run:
```
npm install
npm run dev
```

5) Backend CORS:
- Ensure your backend allows your Vercel domain as an origin for CORS and Socket.IO.
