'use strict';

var _reducer = require('../reducer');

var _reducer2 = _interopRequireDefault(_reducer);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

describe('reducer', function () {
    it('should do nothing for non LOAD actions', function () {
        var spy = sinon.spy();
        var oldState = {};
        var action = { type: 'SOMETHING', payload: {} };

        (0, _reducer2['default'])(spy)(oldState, action);

        spy.should.have.been.calledWith(oldState, action);
    });

    it('should have a default merger in place', function () {
        var spy = sinon.spy();
        var oldState = { x: 0, y: 0 };
        var action = { type: _constants.LOAD, payload: { y: 42 } };

        (0, _reducer2['default'])(spy)(oldState, action);

        spy.should.have.been.calledWith({ x: 0, y: 42 }, action);
    });

    it('should allow me to change the merger', function () {
        var spy = sinon.spy();
        var oldState = { x: 0, y: 0 };
        var action = { type: _constants.LOAD, payload: { y: 42 } };

        var merger = function merger(a, b) {
            a.should.equal(oldState);
            b.should.deep.equal({ y: 42 });
            return { c: 1 };
        };

        (0, _reducer2['default'])(spy, merger)(oldState, action);

        spy.should.have.been.calledWith({ c: 1 }, action);
    });
});