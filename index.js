const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser');
const path = require('path')
const fs = require('fs')

const port = 3000
const ProjectAccessor = require('./src/ProjectAccessor')
const DirectoryAccessor = require('./src/DirectoryAccessor')
const DatabaseAccessor = require('./src/DatabaseAccessor')

const da = new DirectoryAccessor()
const db = new DatabaseAccessor(da)

app.set("view engine", "pug")
app.set("views", path.join(__dirname, "src/views"))

router.get('/', (req, res) => {
    db.getSourceLanguages().then(languages => {
        res.render("languages", { languages: languages })
    })
})

router.get('/:lang', (req, res) => {
    db.getProjects(req.params.lang).then(books => {
        res.render("books", { params: req.params, books: books })
    })
})

router.get('/:lang/:book', (req, res) => {
    db.getSourcesByProject(req.params.lang, req.params.book).then(resources => {
        res.render("resources", { params: req.params, resources: resources })
    })
})

router.get('/:lang/:book/:res/check', (req, res) => {
    const projectDir = da.getProject(req.params.lang, req.params.res, req.params.book)
    da.init()

    Promise.resolve(true).then(() => {
        if (!fs.existsSync(projectDir)) {
            if (!da.isAppPathExists()) {
                // request user to select the install dir 
                res.sendStatus(303)
            } else {
                // activates RC and responds 'ready' 
                console.log('activating project... ' + projectDir)
                db.activateProjectContainers(req.params.lang, req.params.book, req.params.res)
                    .finally(() => res.sendStatus(204))
                    .catch(e => {
                        console.error(e)
                    })
                
            }
        } else {
            res.sendStatus(204)
        }
    })
})

router.get('/:lang/:book/:res/select-app-dir', (req, res) => {
    res.render("setapp", { params: req.params })
})

router.get('/:lang/:book/:res', (req, res) => {
    const projectDir = da.getProject(req.params.lang, req.params.res, req.params.book)
    const pa = new ProjectAccessor(projectDir)
    const chapters = pa.getChapters()
    res.render("chapters", { params: req.params, chapters: chapters })
})

router.get('/:lang/:book/:res/:chapter', (req, res) => {
    const projectDir = da.getProject(req.params.lang, req.params.res, req.params.book)
    const pa = new ProjectAccessor(projectDir)
    const chapterText = pa.getChapterText(req.params.chapter)

    db.getTargetLanguages().then(languages => {
        const lang = languages.filter(lang => {
            return lang.slug === req.params.lang
        })
        if (lang.length === 1) {
            return Promise.resolve(lang[0].direction)
        } else {
            return Promise.resolve("ltr")
        }
    }).then(direction => {
        res.render("chunking", { params: req.params, contents: chapterText, direction: direction })
    })
})

router.post('/:lang/:book/:res/:chapter', (req, res) => {
    const projectDir = da.getProject(req.params.lang, req.params.res, req.params.book)
    const pa = new ProjectAccessor(projectDir)
    const chunks = req.body

    pa.saveChunks(chunks, req.params.chapter)
    res.json({"message": "Saved!"})
})

app.use(express.static(path.join(__dirname, 'src/public')))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/", router)

app.listen(port, () => {
  console.log(`app listening on http://localhost:${port}`)
})