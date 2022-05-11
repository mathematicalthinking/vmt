/*
	jQuery tinyDraggable v1.0.2
    Copyright (c) 2014 Simon Steinberger / Pixabay
    GitHub: https://github.com/Pixabay/jQuery-tinyDraggable
    More info: https://pixabay.com/blog/pelLocts/p-52/
	License: http://www.opensource.org/licenses/mit-license.php
	Modified by Scott Steketee to support touch events
*/

(function($){
	$.fn.tinyDraggable = function(options){
		var settings = $.extend({ handle: 0, exclude: 0 }, options),
				isTouch;	// true if a touch event intiates a drag, set in pressed()
				
		return this.each(function(){
				var dx, dy, el = $(this), handle = settings.handle ? $(settings.handle, el) : el;
	
			function getTouchLoc (e) {  	// pageX for mouse events is e.touches[e.which].pageX for touch events
				var loc = isTouch ? e.touches[e.which] : e,
					retVal = {x: loc.pageX, y: loc.pageY};
				return retVal;
			}
			
			function pressed (e) {
				var eventName, elLoc, touchLoc;
				if (settings.exclude && ~$.inArray(e.target, $(settings.exclude, el)))
					return;
				isTouch = e.type.includes ("touch");
				// e.preventDefault() prevents the undesired full-page scrolling, but also prevents the touch from reaching the target!
				// if (isTouch) e.preventDefault();
				if (isTouch) e.stopPropagation();
				eventName = isTouch ? "touchmove.drag" : "mousemove.drag";
				elLoc = el.offset();
				touchLoc = getTouchLoc (e);
				dx = touchLoc.x - elLoc.left; dy = touchLoc.y - elLoc.top;
				$(document).on(eventName, function(e){
					var newCoords = getTouchLoc (e);
					e.preventDefault();
					e.stopPropagation();
					el.offset({top: newCoords.y-dy, left: newCoords.x-dx});
					return true;
				});
				if (isTouch) {
					$(document).on("mousemove.drag", function(e){
						e.preventDefault();
						e.stopPropagation();
					});
				}
			}
			
			function released (e) {
				var eventName = (e.type==="mouseup") ? "mousemove.drag" : "touchmove.drag";
				$(document).off(eventName);
				if (isTouch) $(document).off("mousemove.drag");
			}
			
			handle.on({
					mousedown: pressed,
					touchstart: pressed,
					mouseup: released,
					touchend: released
			});
		});
	};
}(jQuery));
