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
        log,
        durations;

    // string-integer mapping of durations for more readable code
    durations = {
        'slow': 250,
        'medium': 500,
        'fast': 750
    };

    // simple mapper function for getting string durations
    function getDuration (d) {
        return durations[d] || d;
    }

    // a console.log wrapper for debugging
    log = function(){
        // store logs to an array for reference
        log.history = log.history || [];
        log.history.push(arguments);
        if(this.console){
            console.log( Array.prototype.slice.call(arguments) );
        }
    };

    // check for navigator variables from different vendors
    enabled = vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

    // expose a wrapped copy of 'vibrate' function
    if (enabled) {
        Haptics.vibrate = function (args) {
            var params = [], i, len;
            if (typeof args == "number") {
                vibrate(args);
                return true;
            }

            if (args.length) {
                for (i = 0, len = args.length; i < len; i += 1) {
                    params.push(getDuration(args[i]));
                }
                vibrate.apply(this, params);
                return true;
            }

            return false;
        };
    }
    else {
        Haptics.vibrate = function () {
            return false;
        };
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

    // expose local functions to global API
    Haptics.enabled = enabled;
    Haptics.record = record;
    Haptics.finish = finish;
    Haptics.durations = durations;

    // set global object
    global.Haptics = Haptics;
})(this);
