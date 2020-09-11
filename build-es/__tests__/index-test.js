'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

import defaultImport from '../';
import * as fullImport from '../';
import { LOAD, SAVE, createLoader, createMiddleware, reducer } from '../';

describe('index', function () {
    it('should export everything by default', function () {
        // NOTE: the new object is created to include the "default" key
        //       that exists in fullImport
        fullImport.should.be.deep.equal(_extends({}, defaultImport, { 'default': defaultImport }));
    });

    it('should export LOAD', function () {
        LOAD.should.be.a.string;
    });

    it('should export SAVE', function () {
        SAVE.should.be.a.string;
    });

    it('should export createLoader', function () {
        createLoader.should.be.a.func;
    });

    it('should export createMiddleware', function () {
        createMiddleware.should.be.a.func;
    });

    it('should export reducer', function () {
        reducer.should.be.a.func;
    });
});