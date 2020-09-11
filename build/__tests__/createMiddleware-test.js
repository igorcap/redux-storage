'use strict';

var _createMiddleware = require('../createMiddleware');

var _createMiddleware2 = _interopRequireDefault(_createMiddleware);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

describe('createMiddleware', function () {
    var oldEnv = void 0;
    beforeEach(function () {
        oldEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
    });

    afterEach(function () {
        process.env.NODE_ENV = oldEnv;
    });

    function describeConsoleWarnInNonProduction(msg, cb, msgCheck) {
        describe(msg, function () {
            var warn = void 0;

            beforeEach(function () {
                warn = sinon.stub(console, 'warn');
            });

            afterEach(function () {
                warn.restore();
            });

            it('should warn if NODE_ENV != production', function () {
                process.env.NODE_ENV = 'develop';
                cb();
                warn.should.have.been.called;
                if (msgCheck) {
                    msgCheck(warn.firstCall.args[0]);
                }
            });

            it('should NOT warn if NODE_ENV == production', function () {
                process.env.NODE_ENV = 'production';
                cb();
                warn.should.not.have.been.called;
            });
        });
    }

    it('should call next with the given action', function () {
        var engine = { save: sinon.stub().resolves() };
        var store = { getState: sinon.spy() };
        var next = sinon.spy();
        var action = { type: 'dummy' };

        (0, _createMiddleware2['default'])(engine)(store)(next)(action);

        next.should.have.been.calledWith(action);
    });

    it('should return the result of next', function () {
        var engine = { save: sinon.stub().resolves() };
        var store = { getState: sinon.spy() };
        var next = sinon.stub().returns('nextResult');
        var action = { type: 'dummy' };

        var result = (0, _createMiddleware2['default'])(engine)(store)(next)(action);

        result.should.equal('nextResult');
    });

    it('should ignore blacklisted actions', function () {
        var engine = { save: sinon.spy() };
        var store = {};
        var next = sinon.spy();
        var action = { type: 'IGNORE_ME' };

        (0, _createMiddleware2['default'])(engine, ['IGNORE_ME'])(store)(next)(action);

        engine.save.should.not.have.been.called;
    });

    it('should ignore non-whitelisted actions', function () {
        var engine = { save: sinon.spy() };
        var store = {};
        var next = sinon.spy();
        var action = { type: 'IGNORE_ME' };

        (0, _createMiddleware2['default'])(engine, [], ['ALLOWED'])(store)(next)(action);

        engine.save.should.not.have.been.called;
    });

    it('should process whitelisted actions', function () {
        var engine = { save: sinon.stub().resolves() };
        var store = { getState: sinon.spy() };
        var next = sinon.spy();
        var action = { type: 'ALLOWED' };

        (0, _createMiddleware2['default'])(engine, [], ['ALLOWED'])(store)(next)(action);

        engine.save.should.have.been.called;
    });

    it('should allow whitelist function', function () {
        var engine = { save: sinon.stub().resolves() };
        var store = { getState: sinon.spy() };
        var next = sinon.spy();
        var action = { type: 'ALLOWED' };
        var whitelistFn = function whitelistFn() {
            return true;
        };

        (0, _createMiddleware2['default'])(engine, [], whitelistFn)(store)(next)(action);

        engine.save.should.have.been.called;
    });

    it('should ignore actions if the whitelist function returns false', function () {
        var engine = { save: sinon.stub().resolves() };
        var store = { getState: sinon.spy() };
        var next = sinon.spy();
        var action = { type: 'ALLOWED' };
        var whitelistFn = function whitelistFn() {
            return false;
        };

        (0, _createMiddleware2['default'])(engine, [], whitelistFn)(store)(next)(action);

        engine.save.should.not.have.been.called;
    });

    it('should pass the whole action to the whitelist function', function (done) {
        var engine = { save: sinon.stub().resolves() };
        var store = { getState: sinon.spy() };
        var next = sinon.spy();
        var action = { type: 'ALLOWED' };
        var whitelistFn = function whitelistFn(checkAction) {
            checkAction.should.deep.equal(action);
            done();
        };

        (0, _createMiddleware2['default'])(engine, [], whitelistFn)(store)(next)(action);
    });

    describeConsoleWarnInNonProduction('should not process functions', function () {
        var engine = { save: sinon.stub().resolves() };
        var store = { getState: sinon.spy() };
        var next = sinon.spy();
        var action = function action() {};

        (0, _createMiddleware2['default'])(engine)(store)(next)(action);

        engine.save.should.not.have.been.called;
    }, function (msg) {
        msg.should.contain('ACTION IGNORED!');
        msg.should.contain('but received a function');
    });

    describeConsoleWarnInNonProduction('should not process strings', function () {
        var engine = { save: sinon.stub().resolves() };
        var store = { getState: sinon.spy() };
        var next = sinon.spy();
        var action = 'haha';

        (0, _createMiddleware2['default'])(engine)(store)(next)(action);

        engine.save.should.not.have.been.called;
    }, function (msg) {
        msg.should.contain('ACTION IGNORED!');
        msg.should.contain('but received: haha');
    });

    describeConsoleWarnInNonProduction('should not process objects without a type', function () {
        var engine = { save: sinon.stub().resolves() };
        var store = { getState: sinon.spy() };
        var next = sinon.spy();
        var action = { noType: 'damn it' };

        (0, _createMiddleware2['default'])(engine)(store)(next)(action);

        engine.save.should.not.have.been.called;
    }, function (msg) {
        msg.should.contain('ACTION IGNORED!');
        msg.should.contain('objects should have a type property');
    });

    describeConsoleWarnInNonProduction('should warn about action on both black- and whitelist', function () {
        var engine = {};
        (0, _createMiddleware2['default'])(engine, ['A'], ['A']);
    });

    it('should pass the current state to engine.save', function () {
        var engine = { save: sinon.stub().resolves() };
        var state = { x: 42 };
        var store = { getState: sinon.stub().returns(state) };
        var next = sinon.spy();
        var action = { type: 'dummy' };

        (0, _createMiddleware2['default'])(engine)(store)(next)(action);

        engine.save.should.have.been.calledWith(state);
    });

    it('should trigger a SAVE action after engine.save', function (done) {
        var engine = { save: sinon.stub().resolves() };
        var state = { x: 42 };
        var store = {
            getState: sinon.stub().returns(state),
            dispatch: sinon.spy()
        };
        var next = sinon.spy();
        var action = { type: 'dummy' };

        (0, _createMiddleware2['default'])(engine)(store)(next)(action);

        setTimeout(function () {
            var saveAction = { payload: state, type: _constants.SAVE };
            store.dispatch.should.have.been.calledWith(saveAction);
            done();
        }, 5);
    });

    it('should add the parent action as meta.origin to the saveAction', function (done) {
        process.env.NODE_ENV = 'develop';

        var engine = { save: sinon.stub().resolves() };
        var state = { x: 42 };
        var store = {
            getState: sinon.stub().returns(state),
            dispatch: sinon.spy()
        };
        var next = sinon.spy();
        var action = { type: 'dummy' };

        (0, _createMiddleware2['default'])(engine)(store)(next)(action);

        setTimeout(function () {
            var saveAction = { payload: state, type: _constants.SAVE, meta: { origin: action } };
            store.dispatch.should.have.been.calledWith(saveAction);
            done();
        }, 5);
    });

    it('should do nothing if engine.save fails', function () {
        var engine = { save: sinon.stub().rejects() };
        var store = { getState: sinon.spy() };
        var next = sinon.spy();
        var action = { type: 'dummy' };

        (0, _createMiddleware2['default'])(engine)(store)(next)(action);
    });

    it('should always ignore SAVE action', function () {
        var engine = { save: sinon.spy() };
        var store = {};
        var next = sinon.spy();
        var action = { type: _constants.SAVE };

        (0, _createMiddleware2['default'])(engine)(store)(next)(action);

        engine.save.should.not.have.been.called;
    });

    it('should always ignore LOAD action', function () {
        var engine = { save: sinon.spy() };
        var store = {};
        var next = sinon.spy();
        var action = { type: _constants.LOAD };

        (0, _createMiddleware2['default'])(engine)(store)(next)(action);

        engine.save.should.not.have.been.called;
    });
});