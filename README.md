## koa-route-tree
    Path is route, also path is parameter.
    The most fast and efficient route.
    Now, it support restful route mode.

Let's see it.

## Install

`npm install koa-route-tree --save`

## Caution!

This is only support for koa@2+!

If you use koa@1, install it with version 1.4.0. `npm install koa-route-tree@1.4.0 --save`

## Usage

```js
// File: app.js

const Koa = require('koa');
const Route = require('koa-route-tree');

const app = new Koa();

const fileRouter = ['robots.txt'];
app.use(Route(__dirname + '/controller', {
    '/appList': '/app/list',
    'favicon.ico': '/index/favicon.ico'
}, async function (ctx, next, controller) {
    let pathname = ctx.path.substring(1);
    
    if (fileRouter.indexOf(pathname) > -1) {
        ctx.body = 'Allows: *';
        return;
    }
    
    // console.log(controller);
    // and do next if you want
    // await next();
}));
```
## Restful mode example

```js
// File: controllers/app/list.js

/**
 * Normal Get Request, Support urls:
 * 1. /app/list => page: undefined | second: undefind
 * 2. /app/list/0 => page: 0 | second: undefined
 * 3. /app/list/1.html => page: 1 | second: undefined
 * 4. /app/list/1/a => page: 1 | second: a
 */
exports.index = function (page, second) {
    this.body = 'Page/' + page + '/Second/' + second;
};

// restful route mode
/**
 * For GET Request. Support urls:
 * 1. GET /app/list/set => page: undefined | second: undefind
 * 2. GET /app/list/0/set => page: 0 | second: undefined
 * 3. GET /app/list/1/set/a => page: 1 | second: a
 * 4. GET /app/list/set/1/a => page: 1 | second: a
 */
exports.set = function (page, second) {
    this.body = 'GET Page/' + page + '/Second/' + second;
};

/**
 * The same as the above GET request
 */
exports.postSet = function (page, second) {
    this.body = 'POST Page/' + page + '/Second/' + second;
};
/**
 * The same as the above GET request
 */
exports.putSet = function (page, second) {
    this.body = 'PUT Page/' + page + '/Second/' + second;
};
```

## Class

`Route(controllerDirectory[, alias][, withoutRouteHandler])`

### Parameters

* `controllerDirectory` is a string of controller directory.
* `alias` is a object for alias to a path or function.

    ```js
    const alias = {
        '/d': '/index/download', // a short download link
        'a/b': 'your/path' // the same link, this is equivalent to /a/b <=> /your/path
    };
    ```
* `withoutRouteHandler *(ctx, next, controller)` is a middleware function for handle the request without route.

    So the context of the function is the current koa context.

### Static Attribute

`route.controller` is a freeze object like a tree. And the value must be a function at the end of the tree.

## Controller

* `index` is default path.

    ```js
    // File: app.js
    
    // GET /app
    exports.index = function () {
        this.body = 'app';
    };
    // And need be more careful to use the route below.
    // There will not be invoked when GET /app/1.
    // The index function must have more than one arguments when there is no such name function of path
    // So, you should insert a arguments in the index function, if you want to support GET /app/1
    exports.index = function (id) {
        this.body = id || 'app';
    };
    ```
* Http method is a prefix of function name but `GET`.

    ```js
    // File: index.js
    
    // GET /
    exports.index = function (id) {
        this.body = id;
    };
    
    // POST /
    exports.postIndex = function (id) {
        this.body = id;
    };
    
    // PUT /
    exports.putIndex = function (id) {
        this.body = id;
    };
    
    // DELETE /
    exports.deleteIndex = function (id) {
        this.body = id;
    };
    ```

## Test

```sh
./node_modules/.bin/mocha
# or
npm test # npm run test
```

## The End

Anyway, try to use. And see the example in example directory.

Hope this is useful to you.

And give me your pull request if you have any improvements or suggestions.
