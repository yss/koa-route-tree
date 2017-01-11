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
        let filepath = Path.join(dirname, item);
        if (isDirectory(filepath)) {
            if (!controller[item]) {
                controller[item] = {};
            }
            initController(controller[item], filepath);
        } else if (/\.js$/.test(item) && item.indexOf('.') !== 0) { // js file and not hidden file
            let pathname = item.slice(0, -3);
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

        let aliasController = controller,
            keyArr = key.split('/');

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

/**
 * koa-route-tree
 * @param {String} dirname
 * @param {Object} [alias]
 * @param {Function} [withoutRouteHandler]
 * @return {Function}
 */
function Route(dirname, alias, withoutRouteHandler) {
    var controller = {};
    if (typeof alias === TYPE_FUNCTION) {
        withoutRouteHandler = alias;
        alias = null;
    }
    initController(controller, dirname);
    addAlias(alias, controller);
    // prevent the controller object to be modified.
    Object.freeze(controller);
    function *router(ctx, next) {
        var pathArr = ctx.path.substring(1).split('/'),
            app = controller,
            reqMethod = ctx.method,
            isGet = reqMethod === METHOD_GET || reqMethod === METHOD_HEAD,
            path,
            method;

        if (pathArr[0] && !app[pathArr[0]]) {
            if (typeof withoutRouteHandler === TYPE_FUNCTION) {
                return yield* withoutRouteHandler(ctx, next, controller);
            }
            return ctx.throw(404, 'ROUTE_NOT_FOUND');
        }
        while (true) { /*eslint no-constant-condition:0*/
            // path== "0"
            path = pathArr.shift() || PATH_DEFAULT;
            if (typeof app[path] === TYPE_OBJECT) {
                app = app[path];
                continue;
            }
            if (reqMethod === METHOD_HEAD) {
                Route.headRequestHandler(ctx, app, path);
                break;
            }
            if (reqMethod === METHOD_OPTIONS) {
                Route.optionsRequestHandler(ctx, app, path);
                break;
            }
            method = isGet ? path : reqMethod.toLowerCase() + path.substring(0, 1).toUpperCase() + path.substring(1);
            if (typeof app[method] === TYPE_FUNCTION) {
                yield* app[method].apply(ctx, pathArr);
            } else {
                pathArr.unshift(path.replace('.html', ''));
                method = isGet ? PATH_DEFAULT : reqMethod.toLowerCase() + 'Index';
                if (typeof app[method] === TYPE_FUNCTION && app[method].length > 0) { // the index function must contains more than 1 arguments
                    yield* app[method].apply(ctx, pathArr);
                } else {
                    ctx.throw(404, 'ROUTE_NOT_FOUND');
                }
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
 */
Route.optionsRequestHandler = function(ctx, app, path) {
    var methods = [];

    if (typeof app[path] === TYPE_FUNCTION || typeof app.index === TYPE_FUNCTION) {
        methods.push(METHOD_HEAD, METHOD_GET);
    }

    METHODS.forEach(function(method) {
        if (typeof app[method + path.substring(0, 1).toUpperCase() + path.substring(1)] === TYPE_FUNCTION
            || typeof app[method + 'Index'] === TYPE_FUNCTION) {
            methods.push(method.toUpperCase());
        }
    });

    ctx.set('Allow', methods.join(','));
    ctx.body = methods.join(',');
};

/**
 * for HEAD /
 * @param ctx
 * @param {Object} app the last controller object
 * @param {String} method
 */
Route.headRequestHandler = function(ctx, app, method) {
    if (typeof app[method] === TYPE_FUNCTION || typeof app.index === TYPE_FUNCTION) {
        ctx.status = 200;
    } else {
        ctx.status = 404;
    }
};

module.exports = Route;
