const ProjectAccessor = require('./src/ProjectAccessor')
const DirectoryAccessor = require('./src/DirectoryAccessor')

const da = new DirectoryAccessor()
const languages = da.getLanguages()
console.log(languages)
const resources = da.getResources("en")
console.log(resources)
const books = da.getBooks("en", "ulb")
console.log(books)

const projectDir = da.getProject("en", "ulb", "eph")
const pa = new ProjectAccessor(projectDir)

const chapters = pa.getChapters()
console.log(chapters)

const text = pa.getChapterText('01')
console.log(text)

