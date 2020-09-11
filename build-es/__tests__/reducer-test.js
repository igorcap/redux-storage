'use strict';

import reducer from '../reducer';
import { LOAD } from '../constants';

describe('reducer', function () {
    it('should do nothing for non LOAD actions', function () {
        var spy = sinon.spy();
        var oldState = {};
        var action = { type: 'SOMETHING', payload: {} };

        reducer(spy)(oldState, action);

        spy.should.have.been.calledWith(oldState, action);
    });

    it('should have a default merger in place', function () {
        var spy = sinon.spy();
        var oldState = { x: 0, y: 0 };
        var action = { type: LOAD, payload: { y: 42 } };

        reducer(spy)(oldState, action);

        spy.should.have.been.calledWith({ x: 0, y: 42 }, action);
    });

    it('should allow me to change the merger', function () {
        var spy = sinon.spy();
        var oldState = { x: 0, y: 0 };
        var action = { type: LOAD, payload: { y: 42 } };

        var merger = function merger(a, b) {
            a.should.equal(oldState);
            b.should.deep.equal({ y: 42 });
            return { c: 1 };
        };

        reducer(spy, merger)(oldState, action);

        spy.should.have.been.calledWith({ c: 1 }, action);
    });
});