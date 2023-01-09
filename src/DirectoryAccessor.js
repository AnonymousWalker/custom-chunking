const os = require('os')
const path = require('path')

class DirectoryAccessor {
    constructor() {
        this.setPaths()
    }

    setPaths() {
        const platform = os.platform()
        const homeDir = os.homedir()
        let appPath, appConfigPath
        switch (platform) {
            case "win32":
                appPath = ""
                appConfigPath = "AppData/Local"
                break
            case "darwin":
                appPath = "/Applications/BTT-Writer.app/Contents/Resources/app"
                appConfigPath = "Library/Application Support"
                break
            case "linux":
                appPath = ""
                appConfigPath = ".config"
                break
        }
        this.appRcPath = path.join(appPath, "src/index/resource_containers")
        this.appConfigPath = path.join(homeDir, appConfigPath, "BTT-Writer")
        this.libraryPath = path.join(this.appConfigPath, "library")
        this.configRcPath = path.join(this.libraryPath, "resource_containers")
    }

    getLibraryPath() {
        return this.libraryPath
    }

    getAppRcPath() {
        return this.appRcPath
    }

    getConfigRcPath() {
        return this.configRcPath
    }

    getProject(language, resource, book) {
        const slug = [language, book, resource].join("_")
        return path.join(this.configRcPath, slug)
    }
}

module.exports = DirectoryAccessor