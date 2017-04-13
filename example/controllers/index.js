/**
 * Created by yss on 9/5/16.
 */
'use strict';

exports.index = function () {
    this.body = 'Hello, this is index page.';
};

exports.putIndex = function (id) {
    this.body = id;
};

exports.deleteIndex = function (id) {
    this.body = id;
};