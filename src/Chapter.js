const Chunk = require("./Chunk")

class Chapter {
    constructor(slug, chunks) {
        this.slug = slug
        this.chunks = Array.from(chunks).map(c => new Chunk(c))
    }

    getPathName() {
        return this.slug
    }
}

module.exports = Chapter