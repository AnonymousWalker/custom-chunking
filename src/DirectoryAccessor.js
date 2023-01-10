const os = require('os')
const path = require('path')
const fs = require("fs");
const Store = require('electron-store')
const store = new Store()

class DirectoryAccessor {
    constructor() {
        this.init()
    }

    init() {
        const platform = os.platform()
        const homeDir = os.homedir()
        let appRootPath, appPath, appConfigPath

        let ap = store.get("app_path")
        if (ap && fs.existsSync(ap)) {
            appRootPath = ap
        }

        switch (platform) {
            case "win32":
                appRootPath = appRootPath || "C://ProgramFiles/BTT-Writer"
                appPath = path.join(appRootPath, "app")
                appConfigPath = "AppData/Local"
                break
            case "darwin":
                appRootPath = appRootPath || "/Applications/BTT-Writer.app"
                appPath = path.join(appRootPath, "Contents/Resources/app")
                appConfigPath = "Library/Application Support"
                break
            case "linux":
                appRootPath = appRootPath || "/opt/BTT-Writer"
                appPath = path.join(appRootPath, "app")
                appConfigPath = ".config"
                break
        }
        this.appRcPath = path.join(appPath, "src/index/resource_containers")
        this.appConfigPath = path.join(homeDir, appConfigPath, "BTT-Writer")
        this.libraryPath = path.join(this.appConfigPath, "library")
        this.configRcPath = path.join(this.libraryPath, "resource_containers")
    }

    isAppPathExists() {
        return fs.existsSync(this.getAppRcPath())
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