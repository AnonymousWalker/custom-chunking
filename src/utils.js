const fse = require('fs-extra')

const utils = {
    toInt: (str) => {
        if (str == null) {
            return null
        }
        const n = Number(str)
        return isNaN(n) ? null : parseInt(n)
    },

    formatPaddedInt: (number, digitCount = 2) => {
        return String(number).padStart(digitCount,'0')
    },

    chain: (visit, onFail, opts) => {
        const fail = onFail ? onFail : utils.ret(false),
        config = opts || { compact: true };

        return function (list) {
            let p = Promise.resolve(false),
            results = [];

            list.forEach(function (l) {
                p = p.then(visit.bind(null, l))
                     .catch(function (err) {
                         return fail(err, l);
                     })
                     .then(function (result) {
                         results.push(result);
                     });
            });

            return p.then(function () {
                return config.compact ? results.filter(Boolean) : results;
            });
        };
    },

    ret: (data) => {
        return function () {
            return data;
        };
    },

    promisify: (module, fn) => {
        const hasModule = typeof module !== 'function',
        f = hasModule ? module[fn] : module,
        mod = hasModule ? module : null;

        return function () {
            let args = [],
            i = arguments.length - 1;

            /**
             *  Don't pass an arguments list that has undefined values at the end.
             *      This is so the callback for function gets passed in the right slot.
             *
             *      If the function gets passed:
             *          f(arg1, arg2, undefined, cb)
             *
             *      ...it will think it got an undefined cb.
             *
             *      We instead want it to get passed:
             *          f(arg1, arg2, cb)
             *
             *      Before:    [arg1, null, undefined, arg2, undefined, undefined]
             *      After:     [arg1, null, undefined, arg2]
             */
            while (i >= 0 && typeof arguments[i] === 'undefined') {
                --i;
            }
            while (i >= 0) {
                args.unshift(arguments[i]);
                --i;
            }

            return new Promise(function (resolve, reject) {
                try {
                    f.apply(mod, args.concat(function (err, data) {
                        return err ? reject(err) : resolve(data);
                    }));
                } catch (err) {
                    reject(err);
                }
            });
        };
    },

    promisifyAll: (module, opts) => {
        const config = opts || {},
        isValid = config.isValid || function (f, fn, mod) {
            /**
         * Filter out functions that aren't 'public' and aren't 'methods' and aren't asynchronous.
         *  This is mostly educated guess work based on de facto naming standards for js.
         *
         * e.g.
         *      valid:        'someFunctionName' or 'some_function_name' or 'someFunctionAsync'
         *      not valid:    'SomeConstructor' or '_someFunctionName' or 'someFunctionSync'
         *
         *  As there may be exceptions to these rules for certain modules,
         *   you can pass in a function via opts.isValid which will override this.
         */
            return typeof f === 'function' && fn[0] !== '_' && fn[0].toUpperCase() !== fn[0] && !fn.endsWith('Sync');
        };

        return utils.mapObject(module, function (f, fn, mod) {
            return utils.promisify(mod, fn);
            }, isValid);
    },

    mapObject: (obj, visit, filter) => {
        let keys = Object.getOwnPropertyNames(obj);

        if (filter) {
            keys = keys.filter(function (key) {
                return filter(obj[key], key, obj);
            });
        }

    return keys.reduce(function (a, key) {
        a[key] = visit(obj[key], key, obj);
        return a;
        }, {});
    }
}

utils.fs = utils.promisifyAll(fse)

module.exports = utils