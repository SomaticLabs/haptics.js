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
        currentRecording,
        log;

    log = function(){
		log.history = log.history || [];   // store logs to an array for reference
		log.history.push(arguments);
		if(this.console){
			console.log( Array.prototype.slice.call(arguments) );
		}
	};


    enabled = vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

    if (enabled) {
        Haptics.vibrate = function () {
            navigator.vibrate.apply(this, arguments);
            return true;
        };
    }
    else {
        Haptics.vibrate = function () {
            return false;
        };
    }

    function onRecord(e) {
    	e.preventDefault();
    	currentRecording.push(new Date());
    }
    function record() {
    	currentRecording = [];
    	window.addEventListener("touchstart". onRecord, false);
    	window.addEventListener("touchend". onRecord, false);
    	window.addEventListener("mousedown", onRecord, false);
    	window.addEventListener("mouseup". onRecord, false);
    }
    function finish() {
    	log(currentRecording);
    	window.removeEventListener("touchstart". onRecord);
    	window.removeEventListener("touchend". onRecord);
    	window.removeEventListener("mousedown", onRecord);
    	window.removeEventListener("mouseup". onRecord);
    	return currentRecording;
    }


    Haptics.enabled = enabled;
    Haptics.record = record;
    Haptics.finish = finish;
    this.Haptics = Haptics;
})();
