define(function(require, exports, module) {
    var _ = require('vendor/lodash/main');
    var $AS = {};

    var d = function(text) {
        if($AS.debug) console.log(text);
    };

    // This is filled as targets hit.
    $AS.fired = {};

    // This is filled as wants
    // * is default, always called, but last to be called.
    $AS.wants = {
        '*': []
    };

    // Attach the listener!
    $AS.listen = function(eventMachine, target) {
        eventMachine.on(target, function(undefined, fired) {
            d('AS: Got '+fired);
            $AS.fired[fired] = true;
            $AS.processQueue(fired);
        });
    };


    // Define this with anything you'd like to expose to the userscript.
    $AS.expose = undefined;


    // Have some console output
    $AS.debug = false;


    // Processes a want queue.
    $AS.processQueue = function(want) {
        var queue = $AS.wants[want] || [];

        var next = function() {
            if(queue.length <= 0) {
                d('AS: '+want+' queue is now empty.');
                return;
            }

            var fn = queue.shift();

            if(fn === undefined) {
                d('AS: Function was undefined. Oops.');
                next();
            }

            $AS.call(fn);
            if(queue.length > 0) {
                next();
            }
        };

        next();

        if (want !== '*') {
            d('AS: Processing done, moving to *.');
            $AS.processQueue('*');
        }

    };


    // Processes the want, calls if want is yes.
    $AS.scriptWants = function(want, fn) {
        if (want !== '*' && $AS.fired[want] === undefined) {
            if ($AS.wants[want] === undefined) {
                $AS.wants[want] = [];
            }
            $AS.wants[want].push(fn);
        } else {
            if (want === '*' && _.keys($AS.fired).length > 0) {
                $AS.call(fn);
            } else if(want === '*', _.keys($AS.fired).length === 0) {
                $AS.wants['*'].push(fn);
            } else {
                $AS.call(fn);
            }
        }
    };


    // Add a new script.
    /*
        Signatures we support:
        .attachScript(Function)
        .attachScript(Array, Function)
        .attachScript(String, Function)
    */
    $AS.attachScript = function() {
        if (_.isFunction(arguments[0])) {
            $AS.scriptWants('*', arguments[0]);
        } else if (_.isArray(arguments[0]) && _.isFunction(arguments[1])) {
            _.each(arguments[0], function(want) {
                $AS.scriptWants(want, arguments[1]);
            });
        } else if (_.isString(arguments[0]) && _.isFunction(arguments[1])) {
            $AS.scriptWants(arguments[0], arguments[1]);
        } else {
            throw "The arguments you passed this method is incorrect. See documentation!";
        }
    };

    // Calls the function but doesn't block UI. Cool stuff.
    $AS.call = function(fn) {
        _.defer(fn.bind(window, $AS.expose));
    };

    exports = $AS;

    if($AS.debug) window.$AS = $AS;
    return $AS;
});
