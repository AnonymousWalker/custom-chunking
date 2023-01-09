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
const db = new DatabaseAccessor()

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

router.get('/:lang/:book/:res', (req, res) => {
    const projectDir = da.getProject(req.params.lang, req.params.res, req.params.book)

    Promise.resolve(true).then(() => {
        if (!fs.existsSync(projectDir)) {
            return db.activateProjectContainers(req.params.lang, req.params.book, req.params.res)
        }
        return true
    }).then(() => {
        const pa = new ProjectAccessor(projectDir)
        const chapters = pa.getChapters()
        res.render("chapters", { params: req.params, chapters: chapters })
    })
})

router.get('/:lang/:book/:res/:chapter', (req, res) => {
    const projectDir = da.getProject(req.params.lang, req.params.res, req.params.book)
    const pa = new ProjectAccessor(projectDir)
    const chapterText = pa.getChapterText(req.params.chapter)
    res.render("chunking", { params: req.params, contents: chapterText })
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