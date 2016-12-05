## koa-route-tree
    Path is route, also path is parameter.
    The most fast and efficient route.

Let's see it.

## Install

`npm install koa-route-tree --save`

## Usage

```js
// File: app.js

const Koa = require('koa');
const Route = require('koa-route-tree');

const app = Koa();

const fileRouter = ['robots.txt'];
app.use(Route(__dirname + '/controller', {
    '/appList': '/app/list',
    'favicon.ico': '/index/favicon.ico'
}, function (controller) {
    let pathname = this.path.substring(1);
    
    if (fileRouter.indexOf(pathname) > -1) {
        this.body = 'Allows: *';
        return true;
    }
    
    // console.log(controller);
});
```

```js
// File: controllers/app/list.js

/**
 * Normal Get Request, Support urls:
 * 1. /app/list => page: undefined | second: undefind
 * 2. /app/list/0 => page: 0 | second: undefined
 * 3. /app/list/1.html => page: 1 | second: undefined
 * 4. /app/list/1/a => page: 1 | second: a
 */
exports.index = function *(page, second) {
    this.body = 'Page: ' + page + ' Second: ' + second;
};

/**
 * For POST Request. Support urls:
 * 1. /app/list => page: undefined | second: undefind
 * 2. /app/list/0 => page: 0 | second: undefined
 * 3. /app/list/1.html => page: 1 | second: undefined
 * 4. /app/list/1/a => page: 1 | second: a
 */
exports.postSet = function *(page, second) {
    this.body = 'Page: ' + page + ' Second: ' + second;
};
exports.putSet = function *(page, second) {
    this.body = 'Page: ' + page + ' Second: ' + second;
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
* `withoutRouteHandler(controller)` is a handle function for the request without route handle.

    It will return directly, if `return true` from this function.
    
    It will execute `yield* next`, if `return false` from this function.
    
    It will throw 404 `this.throw(404, 'ROUTE_NOT_FOUND')`, if do not return false or true from this function.
    
    And the context of the function is the current koa context.

### Static Attribute

`route.controller` is a freeze object like a tree. And the value must be a function at the end of the tree.

## Controller

* `index` is default path.

    ```js
    // File: app.js
    
    // GET /app
    exports.index = function *() {
        this.body = 'app';
    };
    // And need be more careful to use the route below.
    // There will not be invoked when GET /app/1.
    // The index function must have more than one arguments when there is no such name function of path
    // So, you should insert a arguments in the index function, if you want to support GET /app/1
    exports.index = function *(id) {
        this.body = id || 'app';
    };
    ```
* Http method is a prefix of function name but `GET`.

    ```js
    // File: index.js
    
    // GET /
    exports.index = function *(id) {
        this.body = id;
    };
    
    // POST /
    exports.postIndex = function *(id) {
        this.body = id;
    };
    
    // PUT /
    exports.putIndex = function *(id) {
        this.body = id;
    };
    
    // DELETE /
    exports.deleteIndex = function *(id) {
        this.body = id;
    };
    ```

## Test

```sh
mocha
# or
npm test # npm run test
```

## The End

Anyway, try to use. And see the example in example directory.

Hope this is useful to you.

And give me your pull request if you have any improvements or suggestions.
