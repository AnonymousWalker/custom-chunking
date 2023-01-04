const ProjectAccessor = require('./src/ProjectAccessor')
const DirectoryAccessor = require('./src/DirectoryAccessor')

const da = new DirectoryAccessor()
const languages = da.getLanguages()
console.log(languages)
const resources = da.getResources("en")
console.log(resources)
const books = da.getBooks("en", "ulb")
console.log(books)

const projectDir = da.getProject("en", "jas", "ulb")
const pa = new ProjectAccessor(projectDir)

const chapters = pa.getChapters()
console.log(chapters)

const chunks = pa.getChunks('02')
console.log(chunks)

