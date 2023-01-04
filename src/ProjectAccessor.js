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
        const toc = this.getToc()
        const contents = Array.from(toc)
        return contents.map(c => new Chapter(c['chapter'], c['chunks']))
    }

    getChunks(chapterSlug) {
        const chapter = this.getChapters().find(c => c.slug === chapterSlug)
        return chapter != null ? chapter.chunks : null
    }

    getChapterText(chapterSlug) {
        const chapter = this.getChapters().find(c => c.slug === chapterSlug)
        const chunkFiles = [];
        chapter.chunks
        .filter(c => c.slug != 'title')
        .forEach(chunk => {
            const chunkFile = path.join(
                this.getContentDir(), 
                chapter.getPathName(), 
                chunk.getPathName()
            )
            chunkFiles.push(chunkFile)
        })

        let text = '';
        chunkFiles.forEach(f => text += fs.readFileSync(f, 'utf-8'))

        return text
    }
}

module.exports = ProjectAccessor;