const ProjectAccessor = require('./src/ProjectAccessor')

const projectDir = `/path/to/project`

const pa = new ProjectAccessor(projectDir)
const chapters = pa.getChapters()
console.log(chapters)

const chunks = pa.getChunks('02')
console.log(chunks)

