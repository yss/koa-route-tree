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
    this.body = 'Page/' + page + '/Second/' + second;
};

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
