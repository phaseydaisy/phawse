const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const slugify = require('slugify')

const TEMPLATE_PATH = path.join(__dirname, 'template.html')
const UPLOADV_ROOT = path.join(__dirname)
const TMP_DIR = path.join(require('os').tmpdir(), 'phawse-uploads')
mkdirp.sync(TMP_DIR)
const storage = multer.diskStorage({destination: TMP_DIR,filename: (req,file,cb)=>{cb(null, Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)+path.extname(file.originalname).toLowerCase())}})
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } })

const app = express()
const SITE_URL = (process.env.SITE_URL || 'https://phawse.lol').replace(/\/$/, '')

function randStr(n){return Math.random().toString(36).slice(2,2+n)}

app.post('/uploadv/api/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumb', maxCount: 1 }]), async (req, res) => {
  try {
    const title = (req.body.title || '').slice(0, 200)
    const description = (req.body.description || '').slice(0, 500)
    const videoFile = req.files && req.files.video && req.files.video[0]
    const thumbFile = req.files && req.files.thumb && req.files.thumb[0]
    if (!videoFile) return res.status(400).send('Missing video file')

    const randomSuffix = randStr(8)
    const slugBase = title ? slugify(title, { lower: true, strict: true }).slice(0, 60) : ''
    const slug = slugBase ? (slugBase + '-' + randomSuffix) : randomSuffix

    const destFolder = path.join(UPLOADV_ROOT, slug)
    mkdirp.sync(destFolder)

    const videoExt = path.extname(videoFile.originalname).toLowerCase()
    const videoName = 'video' + videoExt
    fs.renameSync(videoFile.path, path.join(destFolder, videoName))

    if (thumbFile) {
      const thumbExt = path.extname(thumbFile.originalname).toLowerCase()
      const thumbName = 'thumb' + thumbExt
      fs.renameSync(thumbFile.path, path.join(destFolder, thumbName))
    }

    let template = fs.readFileSync(TEMPLATE_PATH, 'utf8')
    const page = template
      .replace(/\{SITE_URL\}/g, SITE_URL)
      .replace(/\{TITLE\}/g, escapeHtml(title || 'Untitled'))
      .replace(/\{DESCRIPTION\}/g, escapeHtml(description || ''))
      .replace(/\{slug\}/g, slug)

    fs.writeFileSync(path.join(destFolder, 'index.html'), page, 'utf8')
    const meta = { url: SITE_URL + '/uploadv/' + slug + '/', slug, title, description, created: new Date().toISOString() }
    fs.writeFileSync(path.join(destFolder, '.generated'), JSON.stringify(meta))

    return res.json(meta)
  } catch (err) {
    return res.status(500).send('Server error')
  }
})

app.use('/', express.static(path.join(__dirname)))
app.use('/', express.static(path.join(__dirname, '..')))

const CLEANUP_INTERVAL = 1000*60*60
const MAX_AGE = 1000*60*60*24*7
function cleanupOld(){const entries=fs.readdirSync(UPLOADV_ROOT,{withFileTypes:true});for(const d of entries){if(!d.isDirectory())continue;const folder=path.join(UPLOADV_ROOT,d.name);const gen=path.join(folder,'.generated');if(!fs.existsSync(gen))continue;try{const st=fs.statSync(gen);if(Date.now()-st.mtimeMs>MAX_AGE)fs.rmSync(folder,{recursive:true,force:true})}catch(e){}}}
cleanupOld();setInterval(cleanupOld,CLEANUP_INTERVAL)

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