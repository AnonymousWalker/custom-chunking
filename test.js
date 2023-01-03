const ProjectAccessor = require('./src/ProjectAccessor')

const projectDir = `C:\\Users\\Tony\\AppData\\Local\\BTT-Writer\\library\\resource_containers\\en_eph_ulb`

const pa = new ProjectAccessor(projectDir)
const chapters = pa.getChapters()
console.log(chapters)

const chunks = pa.getChunks('02')
console.log(chunks)

