class Chunk {
    constructor(slug) {
        this.slug = slug
    }

    getPathName() {
        return this.slug + '.usx'
    }
}

module.exports = Chunk