/**
 * Created by yss on 9/6/16.
 */
'use strict';
/**
 * Normal Get Request, Support urls:
 * 1. /app/list => page: undefined | second: undefind
 * 2. /app/list/0 => page: 0 | second: undefined
 * 3. /app/list/1.html => page: 1 | second: undefined
 * 4. /app/list/1/a => page: 1 | second: a
 */
exports.index = function (page, second) {
    this.body = 'Page: ' + page + ' Second: ' + second;
};

/**
 * For POST Request. Support urls:
 * 1. /app/list => page: undefined | second: undefind
 * 2. /app/list/0 => page: 0 | second: undefined
 * 3. /app/list/1.html => page: 1 | second: undefined
 * 4. /app/list/1/a => page: 1 | second: a
 */
exports.postSet = function (page, second) {
    this.body = 'Page: ' + page + ' Second: ' + second;
};
exports.putSet = function (page, second) {
    this.body = 'Page: ' + page + ' Second: ' + second;
};
