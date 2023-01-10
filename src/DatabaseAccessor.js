const path = require('path')
const Db = require('door43-client')
const utils = require('./utils')

class DatabaseAccessor {
    constructor(directoryAccessor) {
        this.da = directoryAccessor

        const libraryPath = path.join(this.da.getLibraryPath(), "index.sqlite")
        const resourceDir = this.da.getConfigRcPath()

        this.db = new Db(libraryPath, resourceDir)
    }

    getSourceLanguages() {
        const mythis = this
        return Promise.resolve(true).then(() => {
            return mythis.db.indexSync.getSourceLanguages()
        })
    }

    getTargetLanguages() {
        const mythis = this
        return Promise.resolve(true).then(() => {
            return mythis.db.indexSync.getTargetLanguages()
        })
    }

    getProjects(language) {
        const mythis = this
        return Promise.resolve(true).then(() => {
                return mythis.db.indexSync.getProjects(language || "en").filter(p => {
                    return p.category_slug === 'bible-ot' || p.category_slug === 'bible-nt'
                })
            })
    }

    getSourcesByProject(language, project) {
        const mythis = this
        let allres

        try {
            allres = mythis.db.indexSync.getResources(language, project);
        } catch (e) {
            return Promise.resolve(true)
                    .then(() => {
                        return []
                    })
        }

        const filterres = allres.filter((item) => {
            return item.type === 'book' && (item.status.checking_level === "3" || item.imported)
        });

        const mapped = filterres.map(res => {
            return mythis.getSourceDetails(res.project_slug, res.source_language_slug, res.slug);
        });

        return utils.chain(this.validateExistence.bind(this))(mapped);
    }

    getSourceDetails(project_id, language_id, resource_id) {
        let res, lang, id

        try {
            res = this.db.indexSync.getResource(language_id, project_id, resource_id);
            lang = this.db.indexSync.getSourceLanguage(language_id);
            id = language_id + "_" + project_id + "_" + resource_id;
        } catch (e) {
            return null;
        }

        if (!res || !lang) {
            return null;
        }

        return {
            unique_id: id,
            language_id: language_id,
            resource_id: resource_id,
            checking_level: res.status.checking_level,
            date_modified: res.status.pub_date,
            version: res.status.version,
            project_id: project_id,
            resource_name: res.name,
            language_name: lang.name,
            direction: lang.direction
        }
    }

    validateExistence(source) {
        const container = `${source.language_id}_${source.project_id}_${source.resource_id}`
        return this.containerExists(container).then(exists => {
            source.updating = false
            source.exists = exists
            return source
        })
    }

    containerExists(container) {
        const resourcePath = path.join(this.da.getConfigRcPath(), container)
        const sourcePath = path.join(this.da.getAppRcPath(), container + ".tsrc")

        return utils.fs.stat(resourcePath).then(utils.ret(true)).catch(utils.ret(false))
                .then(function (resexists) {
                    return utils.fs.stat(sourcePath).then(utils.ret(true)).catch(utils.ret(false))
                        .then(srcexists => {
                            return resexists || srcexists
                        })
                })
    }

    activateProjectContainers(language, project, resource) {
        const mythis = this;

        return mythis.activateContainer(language, project, resource)
                .then(msg => {
                    if (typeof msg === 'string') {
                        console.log(msg);
                    }
                })
                .then(() => {
                    return mythis.activateContainer(language, project, "tn");
                })
                .then(() => {
                    return mythis.activateContainer(language, project, "tq");
                })
                .then(() => {
                    return mythis.activateContainer(language, "bible", "tw");
                })
                .then(() => {
                    return mythis.activateContainer(language, project, "udb");
                })
    }

    activateContainer(language, project, resource) {
        const mythis = this
        const container = `${language}_${project}_${resource}`;
        const resourcePath = path.join(this.da.getConfigRcPath(), container);
        const tempPath = path.join(this.da.getConfigRcPath(), container + ".tsrc");
        const sourcePath = path.join(this.da.getAppRcPath(), container + ".tsrc");

        return utils.fs.stat(resourcePath).then(utils.ret(true)).catch(utils.ret(false))
                .then(resexists => {
                    if (!resexists) {
                        return utils.fs.stat(sourcePath).then(utils.ret(true)).catch(utils.ret(false))
                            .then(srcexists => {
                                if (srcexists) {
                                    return utils.fs.copy(sourcePath, tempPath, {clobber: true})
                                        .then(() => {
                                            return mythis.db.openResourceContainer(language, project, resource);
                                        })
                                        .then(() => {
                                            return utils.fs.remove(tempPath);
                                        })
                                        .then(() => {
                                            return Promise.resolve(true);
                                        });
                                }
                                return Promise.resolve("Resource container " + container + " does not exist");
                            });
                    }
                    return Promise.resolve(true);
                });
    }
}

module.exports = DatabaseAccessor