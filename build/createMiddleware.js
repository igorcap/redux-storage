'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lodash = require('lodash.isfunction');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.isobject');

var _lodash4 = _interopRequireDefault(_lodash3);

var _actions = require('./actions');

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function swallow() {}

function warnAboutConfusingFiltering(blacklist, whitelist) {
    blacklist.filter(function (item) {
        return whitelist.indexOf(item) !== -1;
    }).forEach(function (item) {
        console.warn( // eslint-disable-line no-console
        '[redux-storage] Action ' + item + ' is on BOTH black- and whitelist.' + ' This is most likely a mistake!');
    });
}

function isValidAction(action) {
    var isFunc = (0, _lodash2['default'])(action);
    var isObj = (0, _lodash4['default'])(action);
    var hasType = isObj && action.hasOwnProperty('type');
    if (!isFunc && isObj && hasType) {
        return true;
    }

    if (process.env.NODE_ENV !== 'production') {
        if (isFunc) {
            console.warn( // eslint-disable-line no-console
            '[redux-storage] ACTION IGNORED! Actions should be objects' + ' with a type property but received a function! Your' + ' function resolving middleware (e.g. redux-thunk) must be' + ' placed BEFORE redux-storage!');
        } else if (!isObj) {
            console.warn( // eslint-disable-line no-console
            '[redux-storage] ACTION IGNORED! Actions should be objects' + (' with a type property but received: ' + action));
        } else if (!hasType) {
            console.warn( // eslint-disable-line no-console
            '[redux-storage] ACTION IGNORED! Action objects should have' + ' a type property.');
        }
    }

    return false;
}

function handleWhitelist(action, actionWhitelist) {
    if (Array.isArray(actionWhitelist)) {
        return actionWhitelist.length === 0 ? true // Don't filter if the whitelist is empty
        : actionWhitelist.indexOf(action.type) !== -1;
    }

    // actionWhitelist is a function that returns true or false
    return actionWhitelist(action);
}

exports['default'] = function (engine) {
    var actionBlacklist = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var actionWhitelist = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    var opts = Object.assign({ disableDispatchSaveAction: false }, options);

    // Also don't save if we process our own actions
    var blacklistedActions = [].concat(_toConsumableArray(actionBlacklist), [_constants.LOAD, _constants.SAVE]);
    if (process.env.NODE_ENV !== 'production' && Array.isArray(actionWhitelist)) {
        warnAboutConfusingFiltering(actionBlacklist, actionWhitelist);
    }

    return function (_ref) {
        var dispatch = _ref.dispatch,
            getState = _ref.getState;

        return function (next) {
            return function (action) {
                var result = next(action);

                if (!isValidAction(action)) {
                    return result;
                }

                var isOnBlacklist = blacklistedActions.indexOf(action.type) !== -1;
                var isOnWhitelist = handleWhitelist(action, actionWhitelist);

                // Skip blacklisted actions
                if (!isOnBlacklist && isOnWhitelist) {
                    var saveState = getState();
                    var saveAction = (0, _actions.save)(saveState);

                    if (process.env.NODE_ENV !== 'production') {
                        if (!saveAction.meta) {
                            saveAction.meta = {};
                        }
                        saveAction.meta.origin = action;
                    }

                    var dispatchSave = function dispatchSave() {
                        return dispatch(saveAction);
                    };
                    engine.save({ saveState: saveState, action: action }).then(function () {
                        if (opts.disableDispatchSaveAction === false) {
                            return dispatchSave();
                        }
                    })['catch'](swallow);
                }

                return result;
            };
        };
    };
};