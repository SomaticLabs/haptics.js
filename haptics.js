/*
 * haptics.js (https://github.com/EbookGlue/haptics.js)
 * Copyright (c) Shantanu Bala 2014
 * http://sbala.org/haptics.js
 * shantanu@sbala.org
 * Available under the MIT License.
 */

;

(function (global) {
    var Haptics = {},
        enabled,
        vibrate,
        currentRecording,
        log;

    Haptics.resolution = 10; // lower is sharper

    // a console.log wrapper for debugging
    log = function(){
        // store logs to an array for reference
        log.history = log.history || [];
        log.history.push(arguments);
        if(global.console){
            global.console.log( Array.prototype.slice.call(arguments) );
        }
    };

    // check for navigator variables from different vendors
    enabled = vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

    function executeSequence(durations, currentFunc, nextFunc) {
        nextFunc = nextFunc || currentFunc;
        var d = durations.shift();
        currentFunc(d);
        return window.setTimeout(function () {
            executeSequence(durations, nextFunc, currentFunc);
        }, d);
    }

    // expose a wrapped copy of 'vibrate' function
    if (enabled) {
        Haptics.vibrate = function (args) {
            vibrate(args);
            return false;
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
            if (! j < len)
                break;
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

    function fadeIn(args) {
        if (typeof args == "number") {
            vibrateFadeIn(args);
        }
        else {
            executeSequence(args, vibrateFadeIn, emptyFunc);
        }
    }

    // expose local functions to global API
    Haptics.enabled = enabled;
    Haptics.record = record;
    Haptics.finish = finish;
    Haptics.durations = durations;

    // set global object
    global.Haptics = Haptics;
})(this);
