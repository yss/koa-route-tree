/**
 * Created by yss on 9/5/16.
 */
'use strict';
const Path = require('path');
//const Request = require('supertest');
//const Koa = require('koa');
const CO = require('co');
const controllerDirname = Path.join(__dirname, '../example/controllers/');

function simulator(obj, callback) {
    CO(function *() {
        const Route = require('../route.js');
        obj = obj || {};
        let ctx = Object.assign({
            path: '/',
            method: 'GET'
        }, obj.ctx || {});
        let route = Route(controllerDirname, obj.alias, obj.withoutRouteHandler);
        yield* route.call(ctx, (obj.next || function *(){})());
        if (callback) {
            callback(ctx);
        }
    });
}

describe('Koa-route-tree', function () {
    describe('Alias feature', function () {
        it('should be the same with GET /app/list/1/a when GET /test/1/a', function (done) {
            simulator({
                ctx: {
                    path: '/test/1/a'
                },
                alias: {
                    test: '/app/list'
                }
            }, function (ctx) {
                ctx.body.should.be.equal('Page: 1 Second: a');
                done();
            });
        });
        it('should be the same with GET /app/list/1/a when GET /a/b/1/a', function (done) {
            simulator({
                ctx: {
                    path: '/a/b/1/a'
                },
                alias: {
                    'a/b': 'app/list'
                }
            }, function (ctx) {
                ctx.body.should.be.equal('Page: 1 Second: a');
                done();
            });
        });
    });

    describe('Head request', function () {
        it('should be with status 200', function (done) {
            simulator({
                ctx: {
                    method: 'HEAD'
                }
            }, function (ctx) {
                ctx.status.should.be.equal(200);
                done();
            });
        });

        it('should be with status 404', function (done) {
            simulator({
                ctx: {
                    method: 'HEAD',
                    path: '/route',
                    'throw': function (status, text) {
                        status.should.be.equal(404);
                        text.should.be.equal('ROUTE_NOT_FOUND');
                        done();
                    }
                }
            });
        });
    });

    describe('Options request', function () {
        it('should be return with HEAD,GET when OPTIONS /app/list', function (done) {
            simulator({
                ctx: {
                    method: 'OPTIONS',
                    path: '/app/list'
                }
            }, function (ctx) {
                ctx.body.should.be.equal('HEAD,GET');
                done();
            });
        });

        it('should be return with HEAD,GET,PUT,DELETE when OPTIONS /', function (done) {
            simulator({
                ctx: {
                    method: 'OPTIONS'
                }
            }, function (ctx) {
                ctx.body.should.be.equal('HEAD,GET,PUT,DELETE');
                done();
            });
        });
    });

    describe('GET,POST,PUT,DELETE Request', function () {
        it('should be return a welcome string when GET /', function (done) {
            simulator({

            }, function (ctx) {
                ctx.body.should.be.equal('Hello, this is index page.');
                done();
            });
        });

        it('should be throw a text with status 404', function (done) {
            simulator({
                ctx: {
                    method: 'POST',
                    'throw': function (status, text) {
                        status.should.be.equal(404);
                        text.should.be.equal('ROUTE_NOT_FOUND');
                        done();
                    }
                }
            });
        });

        it('should be return id when PUT /index/id', function (done) {
            simulator({
                ctx: {
                    method: 'PUT',
                    path: '/index/id'
                }
            }, function (ctx) {
                ctx.body.should.be.equal('id');
                done();
            });
        });

        it('should be return id when DELETE /index/id', function (done) {
            simulator({
                ctx: {
                    method: 'DELETE',
                    path: '/index/id'
                }
            }, function (ctx) {
                ctx.body.should.be.equal('id');
                done();
            });
        });
    });

    describe('Path as parameters', function () {
        it('should be throw a `ROUTE_NOT_FOUND` text with status 404 when GET /index/xx', function (done) {
            simulator({
                ctx: {
                    path: '/index/xx',
                    'throw': function (status, text) {
                        status.should.be.equal(404);
                        text.should.be.equal('ROUTE_NOT_FOUND');
                        done();
                    }
                }
            });
        });
    });

    describe('WithoutRouteHandler', function () {
        it('should be invoke withoutRouteHandler and go next when GET /xx', function (done) {
            simulator({
                ctx: {
                    path: '/xx'
                },
                withoutRouteHandler: function *(next, controller) {
                    controller.should.be.an.Object();
                    yield next;
                },
                next: function *() {
                    done();
                }
            });
        });
    });
});
