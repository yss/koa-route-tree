/**
 * Created by yss on 9/5/16.
 */
'use strict';
const Path = require('path');
//const Request = require('supertest');
//const Koa = require('koa');
const controllerDirname = Path.join(__dirname, '../example/controllers/');

async function simulator(obj, callback) {
    const Route = require('../route.js');
    obj = obj || {};
    let ctx = Object.assign({
        path: '/',
        method: 'GET',
        set (){} // for options request
    }, obj.ctx || {});
    let route = Route(controllerDirname, obj.alias, obj.withoutRouteHandler);
    await route(ctx, obj.next || async function (){});
    if (callback) {
        callback(ctx);
    }
}

describe('Koa-route-tree', function () {

    describe('Restful Route', function () {
        it('should be return correct value when GET /app/list/1/set/a', function (done) {
            simulator({
                ctx: {
                    path: '/app/list/1/set/a'
                }
            }, function (ctx) {
                ctx.body.should.be.equal('GET Page/1/Second/a');
                done();
            });
        });
        it('should be return correct value when POST /app/list/1/set/a', function (done) {
            simulator({
                ctx: {
                    path: '/app/list/1/set/a',
                    method: 'POST'
                }
            }, function (ctx) {
                ctx.body.should.be.equal('POST Page/1/Second/a');
                done();
            });
        });
        it('should be return correct value when PUT /app/list/1/set/a', function (done) {
            simulator({
                ctx: {
                    path: '/app/list/1/set/a',
                    method: 'PUT'
                }
            }, function (ctx) {
                ctx.body.should.be.equal('PUT Page/1/Second/a');
                done();
            });
        });
        it('should be return correct value when PUT /app/list/1/a', function (done) {
            simulator({
                ctx: {
                    path: '/app/list/1/a',
                    method: 'PUT'
                }
            }, function (ctx) {
                ctx.body.should.be.equal('PUT Page/1/Second/a');
                done();
            });
        });

        it('should be throw 404 when DELETE /app/list/1/set/a', function (done) {
            simulator({
                ctx: {
                    path: '/app/list/1/set/a',
                    method: 'DELETE',
                    'throw': function (status, text) {
                        status.should.be.equal(404);
                        text.should.be.equal('ROUTE_NOT_FOUND');
                        done();
                    }
                }
            })
        });
    });


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
                ctx.body.should.be.equal('Page/1/Second/a');
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
                ctx.body.should.be.equal('Page/1/Second/a');
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
                ctx.body.should.be.equal('HEAD,GET,PUT');
                done();
            });
        });

        it('should be return with HEAD,GET,POST,PUT when OPTIONS /app/list/1/set', function (done) {
            simulator({
                ctx: {
                    path: '/app/list/1/set',
                    method: 'OPTIONS'
                }
            }, function (ctx) {
                ctx.body.should.be.equal('HEAD,GET,POST,PUT');
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

    describe('WithoutRouteHandler', function () {
        it('should be invoke withoutRouteHandler', function (done) {
            simulator({
                ctx: {
                    path: '/xx'
                },
                withoutRouteHandler: async function (ctx, next, controller) {
                    controller.should.be.an.Object();
                    await next();
                },
                next: function () {
                    done();
                }
            });
        });
    });
});
