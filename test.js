const ProjectAccessor = require('./src/ProjectAccessor')
const DirectoryAccessor = require('./src/DirectoryAccessor')

const da = new DirectoryAccessor()
const projectDir = da.getProject("en", "ulb", "eph")
const pa = new ProjectAccessor(projectDir)

const chapters = pa.getChapters()

const text = pa.getChapterText('01')

const chunks = {
    "01": `

<verse number="1" style="v" />Paul, an apostle of Christ Jesus through the will of God, to God's holy people in Ephesus, who are faithful in Christ Jesus.

<verse number="2" style="v" />Grace to you and peace from God our Father and the Lord Jesus Christ.</para>

    `,
    "03": `chunk 3`
}

// pa.saveChunks(chunks, '01')

pa._updateToc('01', Object.keys(chunks))