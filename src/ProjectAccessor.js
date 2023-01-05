const path = require('path')
const fs = require('fs')
const fsExtra = require('fs-extra')
const YAML = require('yaml')
const Chapter = require('./Chapter')
const Chunk = require('./Chunk')
const utils = require('./utils')

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
        const tocFile = path.join(this.getContentDir(), 'toc.yml')
        if (fs.existsSync(tocFile)) {
            const raw = fs.readFileSync(tocFile, 'utf8')
            return YAML.parse(raw)
        }
        return null
    }

    getChapters() {
        const toc = this.getToc()
        const contents = Array.from(toc)
        return contents.filter(c => c['chapter'] !== 'front')
            .map(c => new Chapter(c['chapter'], c['chunks']))
    }

    getChapterPath(chapterSlug) {
        return path.join(
            this.getContentDir(), 
            chapterSlug
        )
    }

    getChunks(chapterSlug) {
        const chapter = this.getChapters().find(c => c.slug === chapterSlug)
        return chapter != null ? chapter.chunks : null
    }

    getChapterText(chapterSlug) {
        const chapter = this.getChapters().find(c => c.slug === chapterSlug)
        const chunkFiles = [];
        chapter.chunks
        .filter(c => c.slug !== 'title')
        .forEach(chunk => {
            const chunkFile = path.join(
                this.getChapterPath(chapterSlug), 
                chunk.getPathName()
            )
            chunkFiles.push(chunkFile)
        })

        let text = '';
        chunkFiles.forEach(f => text += fs.readFileSync(f, 'utf-8'))

        return text
    }

    saveChunks(chunks, chapterSlug) {
        if (!fs.existsSync(this.projectDir)) {
            return
        }

        const outputDir = path.join(
            this.getContentDir(), 
            chapterSlug
        )
        fs.mkdirSync(outputDir, { recursive: true })

        const chunkIds = Object.keys(chunks)
        this._updateToc(chapterSlug, chunkIds.map(c => utils.formatPaddedInt(utils.toInt(c))))

        chunkIds.forEach(key => {
            const fileName = utils.formatPaddedInt(utils.toInt(key))
            const chunkFile = path.join(outputDir, `${fileName}.usx`)
            fs.writeFileSync(chunkFile, chunks[key])
        })
    }

    _updateToc(chapterSlug, newChunks) {
        const tocFile = path.join(this.getContentDir(), 'toc.yml')
        const raw = fs.readFileSync(tocFile, 'utf8')
        const toc = YAML.parse(raw)
        
        const chapterIndex = Array.from(toc).findIndex(item => item['chapter'] == chapterSlug)
        if (chapterIndex < 0) return

        let chunkArray = Array.from(toc[chapterIndex].chunks)
        this._deleteOldChunks(chunkArray, chapterSlug)
        const hasTitle = chunkArray.includes('title')

        if (hasTitle) {
            chunkArray = ['title'].concat(newChunks)
        } else {
            chunkArray = newChunks
        }

        toc[chapterIndex].chunks = chunkArray

        // write toc.yml
        const ymlContent = YAML.stringify(toc)
        fs.writeFileSync(tocFile, ymlContent)
    }

    _deleteOldChunks(chunkNames, chapter) {
        const chapterDir = this.getChapterPath(chapter)
        chunkNames.filter(name => name !== 'title').forEach(name => {
            fs.unlinkSync(path.resolve(chapterDir, `${name}.usx`))
        })
    }
}

module.exports = ProjectAccessor;