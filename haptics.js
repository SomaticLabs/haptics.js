/*
 * haptics.js (https://github.com/EbookGlue/haptics.js)
 * Copyright (c) Shantanu Bala 2014
 * http://sbala.org/haptics.js
 * shantanu@sbala.org
 * Available under an MIT License.
 *
 */

;

(function () {
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
        Haptics.vibrate = function () {
            var params = [], i, len;
            for (i = 0, len = arguments.length; i < len; i += 1) {
                params.push(getDuration(arguments[i]));
            }
            vibrate.apply(this, params);
            return true;
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
        return currentRecording;
    }

    // expose local functions to global API
    Haptics.enabled = enabled;
    Haptics.record = record;
    Haptics.finish = finish;
    Haptics.durations = durations;

    // set global object
    this.Haptics = Haptics;
    if (window) {
        window.Haptics = Haptics;
    }
})();
