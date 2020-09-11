'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ = require('../');

var fullImport = _interopRequireWildcard(_);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

describe('index', function () {
    it('should export everything by default', function () {
        // NOTE: the new object is created to include the "default" key
        //       that exists in fullImport
        fullImport.should.be.deep.equal(_extends({}, fullImport['default'], { 'default': fullImport['default'] }));
    });

    it('should export LOAD', function () {
        _.LOAD.should.be.a.string;
    });

    it('should export SAVE', function () {
        _.SAVE.should.be.a.string;
    });

    it('should export createLoader', function () {
        _.createLoader.should.be.a.func;
    });

    it('should export createMiddleware', function () {
        _.createMiddleware.should.be.a.func;
    });

    it('should export reducer', function () {
        _.reducer.should.be.a.func;
    });
});