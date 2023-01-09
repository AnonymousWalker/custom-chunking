const os = require('os')
const path = require('path')
const fs = require('fs')

class DirectoryAccessor {


    constructor() {
        this.setResourcePath()

        this.excludedResources = [
            "tn",
            "tq",
            "tw",
            "vol1",
            "vol2",
            "vol3"
        ]
    }

    setResourcePath() {
        const platform = os.platform()
        const homeDir = os.homedir()
        let appPath
        switch (platform) {
            case "win32":
                appPath = "AppData/Local"
                break
            case "darwin":
                appPath = "Library/Application Support"
                break
            case "linux":
                appPath = ".config"
                break
        }

        this.resourcePath = path.join(homeDir, appPath, "BTT-Writer/library/resource_containers")
    }

    getProjects() {
        const resources = []
        const dirs = fs.readdirSync(this.resourcePath)
        dirs.forEach(dir => {
            const dirPath = path.join(this.resourcePath, dir)
            const stats = fs.statSync(dirPath)
            if (stats.isDirectory()) {
                resources.push(dir)
            }
        })
        return resources
    }

    getLanguages() {
        const resources = this.getProjects()
        return resources.map(res => {
            return res.split("_")[0]
        }).filter((res, i, self) => {
            return self.indexOf(res) === i
        }).sort()
    }

    getResources(lang) {
        const resources = this.getProjects()
        return resources.filter(res => {
            const resLang = res.split("_")[0]
            return lang === resLang
        }).map(res => {
            return res.split("_")[2]
        }).filter((res, i, self) => {
            return self.indexOf(res) === i
        }).filter(res => {
            return !this.excludedResources.includes(res)
        }).sort()
    }

    getBooks(language, resource) {
        const resources = this.getProjects()
        return resources.filter(data => {
            const lang = data.split("_")[0]
            return lang === language
        }).filter(data => {
            const res = data.split("_")[2]
            return res === resource
        }).map(data => {
            return data.split("_")[1]
        }).filter((data, i, self) => {
            return self.indexOf(data) === i
        }).sort()
    }

    getProject(language, resource, book) {
        const slug = [language, book, resource].join("_")
        return path.join(this.resourcePath, slug)
    }
}

module.exports = DirectoryAccessor