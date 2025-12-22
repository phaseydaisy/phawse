const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const slugify = require('slugify')

const TEMPLATE_PATH = path.join(__dirname, 'template.html')
const UPLOADV_ROOT = path.join(__dirname)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } })

const app = express()
const SITE_URL = (process.env.SITE_URL || 'https://phawse.lol').replace(/\/$/, '')

function makeSlug(title) {
  if (title && title.trim()) return slugify(title, { lower: true, strict: true }).slice(0, 80) || Date.now().toString(36)
  return Date.now().toString(36)
}

app.post('/uploadv/api/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumb', maxCount: 1 }]), async (req, res) => {
  try {
    const title = (req.body.title || '').slice(0, 200)
    const description = (req.body.description || '').slice(0, 500)
    const videoFile = req.files && req.files.video && req.files.video[0]
    const thumbFile = req.files && req.files.thumb && req.files.thumb[0]
    if (!videoFile) return res.status(400).send('Missing video file')

    const slugBase = makeSlug(title || (videoFile.originalname || 'clip'))
    let slug = slugBase
    for (let i = 0; i < 10; i++) {
      const folder = path.join(UPLOADV_ROOT, slug)
      if (!fs.existsSync(folder)) break
      slug = slugBase + '-' + Math.random().toString(36).slice(2, 6)
    }

    const destFolder = path.join(UPLOADV_ROOT, slug)
    mkdirp.sync(destFolder)

    const videoName = 'video' + path.extname(videoFile.originalname).toLowerCase()
    fs.writeFileSync(path.join(destFolder, videoName), videoFile.buffer)

    if (thumbFile) {
      const thumbName = 'thumb' + path.extname(thumbFile.originalname).toLowerCase()
      fs.writeFileSync(path.join(destFolder, thumbName), thumbFile.buffer)
    }

    let template = fs.readFileSync(TEMPLATE_PATH, 'utf8')
    const page = template
      .replace(/\{SITE_URL\}/g, SITE_URL)
      .replace(/\{TITLE\}/g, escapeHtml(title || 'Untitled'))
      .replace(/\{DESCRIPTION\}/g, escapeHtml(description || ''))
      .replace(/\{slug\}/g, slug)

    fs.writeFileSync(path.join(destFolder, 'index.html'), page, 'utf8')

    const url = SITE_URL + '/uploadv/' + slug + '/'
    return res.json({ url, slug, title, description })
  } catch (err) {
    console.error(err)
    return res.status(500).send('Server error')
  }
})

app.use('/', express.static(path.join(__dirname)))
app.use('/', express.static(path.join(__dirname, '..')))

const port = process.env.PORT || 3000
app.listen(port, () => console.log('Upload server', 'port=' + port, 'SITE_URL=' + SITE_URL))

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}