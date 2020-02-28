/**
 * Created by yss on 9/5/16.
 */
'use strict';

const FS = require('fs');
const Path = require('path');

function isDirectory(filepath) {
    if (FS.existsSync(filepath)) {
        return FS.statSync(filepath).isDirectory();
    }
}

function initController(controller, dirname) {
    FS.readdirSync(dirname).forEach(function(item) {
        const filepath = Path.join(dirname, item);
        if (isDirectory(filepath)) {
            if (!controller[item]) {
                controller[item] = {};
            }
            initController(controller[item], filepath);
        } else if (/\.js$/.test(item) && item.indexOf('.') !== 0) { // js file and not hidden file
            const pathname = item.slice(0, -3);
            controller[pathname] = Object.assign(controller[pathname] || {}, require(filepath));
        }
    });
}

function addAlias(alias, controller) {
    if (!alias || typeof alias !== TYPE_OBJECT) {
        return;
    }

    Object.keys(alias).forEach(function(key) {
        let fn = controller;
        alias[key].split('/').forEach(function(method) {
            if (method) {
                fn = fn[method];
            }
        });
        if (typeof fn !== TYPE_FUNCTION && typeof fn !== TYPE_OBJECT) {
            throw new Error('Alias value must be a function or object.');
        }

        let aliasController = controller;
        const keyArr = key.split('/');

        key = keyArr.pop();

        keyArr.forEach(function(method) {
            if (method) {
                aliasController = aliasController[method] = aliasController[method] || {};
            }
        });

        if (aliasController.hasOwnProperty(key)) {
            throw new Error('The key `' + key + '` is exists, and can not be replaced.\nPlease remove it and try again.');
        }

        aliasController[key] = fn;
    });
}

const METHODS = 'post,put,patch,delete'.split(','); // specially for get and head
const TYPE_FUNCTION = 'function';
const TYPE_OBJECT = 'object';
const METHOD_GET = 'GET';
const METHOD_HEAD = 'HEAD';
const METHOD_OPTIONS = 'OPTIONS';
const PATH_DEFAULT = 'index';

function getActionName (app, reqMethod, path, pathArr) {
    let actionName = METHOD_GET === reqMethod ? path : reqMethod.toLowerCase() + path.substring(0, 1).toUpperCase() + path.substring(1);
    if (typeof app[actionName] !== TYPE_FUNCTION) {
        if (!Array.isArray(pathArr) || pathArr.length === 0) {
            return;
        }

        if ((actionName = getActionName(app, reqMethod, pathArr[0]))) {
            pathArr.splice(0, 1, path);
        }
    }

    return actionName;
}

/**
 * koa-route-tree
 * @param {String} dirname
 * @param {Object} [alias]
 * @param {Function} [withoutRouteHandler]
 * @return {Function}
 */
function Route(dirname, alias, withoutRouteHandler) {
    const controller = {};
    if (typeof alias === TYPE_FUNCTION) {
        withoutRouteHandler = alias;
        alias = null;
    }
    initController(controller, dirname);
    addAlias(alias, controller);
    // prevent the controller object to be modified.
    Object.freeze(controller);
    async function router(ctx, next) {
        const pathArr = ctx.path.substring(1).split('/');
        const reqMethod = ctx.method;
        
        let app = controller,
            path,
            method;

        if (pathArr[0] && !app[pathArr[0]]) {
            if (typeof withoutRouteHandler === TYPE_FUNCTION) {
                return await withoutRouteHandler(ctx, next, controller);
            }
            return ctx.throw(404, 'ROUTE_NOT_FOUND');
        }

        while (true) { /*eslint no-constant-condition:0*/
            path = pathArr.shift() || PATH_DEFAULT;
            if (typeof app[path] === TYPE_OBJECT) {
                app = app[path];
                continue;
            }

            if (reqMethod === METHOD_HEAD) {
                Route.headRequestHandler(ctx, app, path, pathArr[0]);
                break;
            }
            if (reqMethod === METHOD_OPTIONS) {
                Route.optionsRequestHandler(ctx, app, path, pathArr[0]);
                break;
            }

            if ((method = getActionName(app, reqMethod, path, pathArr))) {
                await app[method].apply(ctx, pathArr);
            } else if (
                PATH_DEFAULT !== path &&
                (method = getActionName(app, reqMethod, PATH_DEFAULT))
            ) {
                pathArr.unshift(path);
                await app[method].apply(ctx, pathArr);
            } else {
                ctx.throw(404, 'ROUTE_NOT_FOUND');
            }
            break;
        }
    }

    router.controller = controller;

    return router;
}

/**
 * for OPTIONS /
 * @param ctx
 * @param {Object} app the last controller object
 * @param {String} path
 * @param {String} pathExtra
 */
Route.optionsRequestHandler = function(ctx, app, path, pathExtra) {
    const methods = [];

    if (typeof app[path] === TYPE_FUNCTION || typeof app[pathExtra] === TYPE_FUNCTION || typeof app.index === TYPE_FUNCTION) {
        methods.push(METHOD_HEAD, METHOD_GET);
    }

    METHODS.forEach(function(method) {
        [path, pathExtra].some(function (path) {
            if (path
                && (typeof app[method + path.substring(0, 1).toUpperCase() + path.substring(1)] === TYPE_FUNCTION
                    || typeof app[method + 'Index'] === TYPE_FUNCTION)) {
                methods.push(method.toUpperCase());
                return true;
            }
        });
    });

    ctx.set('Allow', methods.join(','));
    ctx.body = methods.join(',');
};

/**
 * for HEAD /
 * @param ctx
 * @param {Object} app the last controller object
 * @param {String} path
 * @param {String} pathExtra
 */
Route.headRequestHandler = function(ctx, app, path, pathExtra) {
    if (typeof app[path] === TYPE_FUNCTION
            || (pathExtra && typeof app[pathExtra] === TYPE_FUNCTION)
            || typeof app.index === TYPE_FUNCTION) {
        ctx.status = 200;
    } else {
        ctx.status = 404;
    }
};

module.exports = Route;
