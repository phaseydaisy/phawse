Upload UI and auto-clip pages

1) Start server in the `phawse` folder:
   npm install express multer mkdirp slugify
   SITE_URL=https://phawse.lol npm run start:upload

2) Open the UI:
   http://localhost:3000/uploadv/upload.html

How it works
- Uploads save to `uploadv/<slug>/` with `video.<ext>` and optional `thumb.<ext>`.
- Each upload is automatically deleted after 7 days to keep storage bounded.
- An `index.html` is generated from `uploadv/template.html` with proper Open Graph meta tags so Discord will embed the clip when you paste the URL.

Notes
- Do not commit uploaded files to git. `/uploadv/*` is ignored by `.gitignore` by default.
- For production, use authentication and appropriate storage (S3 or other) instead of local disk if needed.