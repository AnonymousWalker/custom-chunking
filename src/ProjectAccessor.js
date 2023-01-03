const path = require('path')
const fs = require('fs')
const YAML = require('yaml')
const Chapter = require('./Chapter')

class ProjectAccessor {
    constructor(path) {
        this.projectDir = path
    }

    getContentDir() {
        return path.join(this.projectDir, 'content')
    }

    getMetadata() {
        const metadataFile = path.join(this.projectDir, 'package.json')
        if (fs.existsSync(metadataFile)) {
            const raw = fs.readFileSync(metadataFile, 'utf-8')
            return JSON.parse(raw)
        }
        return null
    }

    getToc() {
        const tocFile = path.join(this.projectDir, 'content', 'toc.yml')
        if (fs.existsSync(tocFile)) {
            const raw = fs.readFileSync(tocFile, 'utf8')
            return YAML.parse(raw)
        }
        return null
    }

    getChapters() {
        const contents = Array.from(this.getToc())
        return contents.map(c => new Chapter(c['chapter'], c['chunks']))
    }

    getChunks(chapterSlug) {
        const chapter = this.getChapters().find(c => c.slug === chapterSlug)
        return chapter != null ? chapter.chunks : null
    }
}

module.exports = ProjectAccessor;