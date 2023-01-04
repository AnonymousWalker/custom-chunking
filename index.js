const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require("body-parser");
const path = require("path")

const port = 3000
const ProjectAccessor = require('./src/ProjectAccessor')
const DirectoryAccessor = require('./src/DirectoryAccessor')

const da = new DirectoryAccessor()

app.set("view engine", "pug")
app.set("views", path.join(__dirname, "src/views"))

router.get('/', (req, res) => {
    const languages = da.getLanguages()
    res.render("languages", { languages: languages })
})

router.get('/:lang', (req, res) => {
    const resources = da.getResources(req.params.lang)
    res.render("resources", { params: req.params, resources: resources })
})

router.get('/:lang/:res', (req, res) => {
    const books = da.getBooks(req.params.lang, req.params.res)
    res.render("books", { params: req.params, books: books })
})

router.get('/:lang/:res/:book', (req, res) => {
    const projectDir = da.getProject(req.params.lang, req.params.res, req.params.book)
    const pa = new ProjectAccessor(projectDir)
    const chapters = pa.getChapters()
    res.render("chapters", { params: req.params, chapters: chapters })
})

router.get('/:lang/:res/:book/:chapter', (req, res) => {
    const projectDir = da.getProject(req.params.lang, req.params.res, req.params.book)
    const pa = new ProjectAccessor(projectDir)
    const chunks = pa.getChunks(req.params.chapter)
    res.render("chunks", { params: req.params, chunks: chunks })
})

router.post('/save_chunks', (req, res) => {
    // Save chunks and send repsonse
    res.status(201).json(req.body)
})

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/", router)

app.listen(port, () => {
  console.log(`app listening on http://localhost:${port}`)
})