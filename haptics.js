/*
 * haptics.js (https://github.com/EbookGlue/haptics.js)
 * Copyright (c) Shantanu Bala 2014
 * http://sbala.org/
 * shantanu@sbala.org
 * Available under the MIT License.
 */

;

(function (global) {
    var Haptics = {},
        enabled,
        currentRecording,
        navigatorVibrate,
        log;

    Haptics.resolution = 10; // lower is sharper

    // a console.log wrapper for debugging
    log = function(){
        // store logs to an array for reference
        log.history = log.history || [];
        log.history.push(arguments);

        if(global.console){
            global.console.log(Array.prototype.slice.call(arguments));
        }
    };

    // check for navigator variables from different vendors
    enabled = navigatorVibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

    // calls to navigatorVibrate always bound to global navigator object
    function vibrate() {
        navigatorVibrate.apply(navigator, arguments);
    }

    enabled = !! enabled; // convert to boolean

    // execute two functions timed using the provided durations
    function executeSequence(durations, currentFunc, nextFunc) {
        var d = durations.shift();
        nextFunc = nextFunc || currentFunc;
        currentFunc(d);

        return window.setTimeout(function () {
            executeSequence(durations, nextFunc, currentFunc);
        }, d);
    }

    // create a sequencing pattern function
    function sequenceFactory() {
        var func;

        if (arguments.length == 1) {
            func = arguments[0];
        }
        else {
            func = patternFactory.apply(this, arguments);
        }

        if (typeof func != "function" && func.length) {
            var durations = func, sum = 0, i = 0, len;
            for (i = 0, len = durations.length; i < len; i += 1) {
                sum += durations[i];
            }

            func = function (duration) {
                var d = duration / sum,
                    newVibration = [],
                    i,
                    len;

                for (i = 0, len = durations.length; i < len; i += 1) {
                    newVibration.push(durations[i] * d);
                }

                Haptics.vibrate(newVibration);
            };
        }

        function newSequence(args) {
            if (typeof args == "number") {
                func(args);
            }
            else {
                executeSequence(args, func, emptyFunc);
            }
        }

        return newSequence;
    }

    // expose a wrapped copy of 'vibrate' function
    if (enabled) {
        Haptics.vibrate = function (args) {
            vibrate(args);
            return true;
        };
    }
    else {
        Haptics.vibrate = function () {
            return false;
        };
    }

    // used for timeouts that 'accomplish nothing' in a pattern
    function emptyFunc() {
        // do nothing
    }

    // handle click/touch event
    function onRecord(e) {
        e.preventDefault();
        currentRecording.push(new Date());
    }
    // begin recording a sequence of taps/clicks
    function record() {
        currentRecording = [];
        window.addEventListener("touchstart". onRecord, false);
        window.addEventListener("touchend". onRecord, false);
        window.addEventListener("mousedown", onRecord, false);
        window.addEventListener("mouseup". onRecord, false);
    }
    // complete a recording of a sequence of taps/clicks
    function finish() {
        log(currentRecording);
        window.removeEventListener("touchstart". onRecord);
        window.removeEventListener("touchend". onRecord);
        window.removeEventListener("mousedown", onRecord);
        window.removeEventListener("mouseup". onRecord);

        if (currentRecording.length % 2 != 0)
            currentRecording.push(new Date());

        var vibrationPattern = [],
            i,
            j,
            len;

        for (i = 0; i < len; i += 2) {
            j = i + 1;

            if (! j < len) {
                break;
            }

            vibrationPattern.push(currentRecording[j] - currentRecording[i]);
        }

        return vibrationPattern;
    }

    // EFFECTS: Fade In
    function vibrateFadeIn(duration) {
        var pulses = [Haptics.resolution],
            len = duration / Haptics.resolution,
            resolution = Haptics.resolution,
            i;

        for (i = 1; i <= len; i += 1) {
            pulses.push(resolution);
            pulses.push(i * resolution);
        }

        pulses.reverse();
        vibrate(pulses);
    }

    // EFFECTS: Fade Out
    function vibrateFadeOut(duration) {
        var pulses = [Haptics.resolution],
            len = duration / Haptics.resolution,
            resolution = Haptics.resolution,
            i;

        for (i = 1; i <= len; i += 1) {
            pulses.push(resolution);
            pulses.push(i * resolution);
        }

        vibrate(pulses);
    }

    // EFFECTS: notification
    function vibrateNotification(duration) {
        var pause, dot, dash;
        pause = duration / 27;
        dot = 2*pause;
        dash = 3*pause;
        vibrate([dot, pause, dot, pause, dot, pause*2, dash, pause, dash, pause*2, dot, pause, dot, pause, dot]);
    }

    // EFFECTS: heartbeat
    function vibrateHeartbeat(duration) {
        var pause, dot, dash;
        dot = duration / 60;
        pause = dot * 2;
        dash = dot * 24;
        vibrate([dot, pause, dash, pause * 2, dash, pause * 2, dot]);
    }

    // EFFECTS: heartbeat
    function vibrateClunk(duration) {
        var pause, dot, dash;
        dot = duration * 4 / 22;
        pause = dot * 2;
        dash = dot / 2 * 5;
        vibrate([dot, pause, dash]);
    }

    // EFFECTS: PWM
    function vibratePWM(duration, on, off) {
        var pattern = [on];
        duration -= on;

        while (duration > 0) {
            duration -= off;
            duration -= on;
            pattern.push(off);
            pattern.push(on);
        }

        vibrate(pattern);
    }

    function pwm(args, on, off) {
        if (typeof args == "number") {
            vibratePWM(args, on, off);
        }
        else {
            function newVibratePWM(d) {
                vibratePWM(d, on, off);
            }
            executeSequence(args, newVibratePWM, emptyFunc);
        }
    }

    // a way to quickly create new PWM intensity functions
    function pwmFactory(on, off) {
        return function (args) {
            pwm(args, on, off);
        }
    }

    // a way to quickly create/compose new tactile animations
    function patternFactory() {
        var len = funcs.length,
            funcs = arguments;

        function newPattern(duration) {
            var i = 0,
                d = duration / len;

            function executeCurrentFunc() {
                funcs[i](d);
            }

            for (i = 0; i < len; i += 1) {
                global.setTimeout(executeCurrentFunc, d);
            }
        }

        return function (args) {
            if (typeof args == "number") {
                newPattern(args);
            }
            else {
                executeSequence(args, newPattern, emptyFunc);
            }
        };
    }

    // expose local functions to global API
    Haptics.enabled = enabled;
    Haptics.record = record;
    Haptics.finish = finish;
    Haptics.fadeIn = sequenceFactory(vibrateFadeIn);
    Haptics.fadeOut = sequenceFactory(vibrateFadeOut);
    Haptics.notification = sequenceFactory(vibrateNotification);
    Haptics.heartbeat = sequenceFactory(vibrateHeartbeat);
    Haptics.clunk = sequenceFactory(vibrateClunk);
    Haptics.pwm = pwm;
    Haptics.createPatternPWM = pwmFactory;
    Haptics.createPattern = sequenceFactory;

    // set global object
    global.Haptics = Haptics;
})(this);
