/**
{ 
"title": "Element Media Queries", 
"type": "selector",
"description": "Provides pseudo-classes for selecting elements based on their width",
"package": "fremycompany.minwidth",
"version": "1"
}
==========
	<h2>Element Media Queries</h2>

	<p>Element Media Queries pseudo-classes provide a mechanism to select elements
	based on their size.</p>
	
	<h2>Table of Contents</h2>
	<ol>
		<li><a href="#minwidth">:-js-min-width</a></li>
		<li><a href="#maxwidth">:-js-max-width</a></li>
	</ol>
	
	
	<h3 class="sectionnumber"><a name="minwidth">1.  The -js-min-width pseudo-class</a></h3>
	<p>The min-width pseudo class <span class="sig">:-js-min-width(<span class="arg">width</span>)</span>,
	is a funtional notation taking one arguments, the pivot size in CSS pixels of the element.
	It represents an element whose width is greater or equal to the numeric value provided.
	</p>

	<div class="example">
		<p>Examples: </p>
		<p>
		The following selector matches all div elements in an HTML document with 
		a width larger than 100px, and colors them in red:
		</p>
		<pre>div:-js-min-width(100){
	background: red;
}</pre>
	</div>
	
	
	<h3 class="sectionnumber"><a name="maxwidth">2.  The -js-max-width pseudo-class</a></h3>

	<p>The max-width pseudo class <span class="sig">:-js-max-width(<span class="arg">width</span>)</span>,
	is a funtional notation taking one arguments, the pivot size in CSS pixels of the element.
	It represents an element whose width is less than the numeric value provided.
	</p>
	<div class="example">
		<p>Examples: </p>
		<p>
		The following selector matches all div elements in an HTML document with 
		a width lesser than 100px, and colors them in green:
		</p>
		<pre>div:-js-max-width(100){
	background: green;
}</pre>
	</div>	
**/


(function() {

	
	function addFlowListener(element, type, fn){
		var flow = type == 'over';
		element.addEventListener('OverflowEvent' in window ? 'overflowchanged' : type + 'flow', function(e){
			if (e.type == (type + 'flow') ||
			((e.orient == 0 && e.horizontalOverflow == flow) ||
			(e.orient == 1 && e.verticalOverflow == flow) ||
			(e.orient == 2 && e.horizontalOverflow == flow && e.verticalOverflow == flow))) {
				e.flow = type;
				return fn.call(this, e);
			}
		}, false);
	};
	
	function fireEvent(element, type, data, options){
		var options = options || {},
			event = document.createEvent('Event');
		event.initEvent(type, 'bubbles' in options ? options.bubbles : true, 'cancelable' in options ? options.cancelable : true);
		for (var z in data) event[z] = data[z];
		element.dispatchEvent(event);
    };
	
	function addResizeListener(element, fn){
		var resize = 'onresize' in element;
		if (!resize && !element._resizeSensor) {
			var sensor = element._resizeSensor = document.createElement('div');
				sensor.className = 'resize-sensor';
				sensor.innerHTML = '<div class="resize-overflow"><div></div></div><div class="resize-underflow"><div></div></div>';
				
			var x = 0, y = 0,
				first = sensor.firstElementChild.firstChild,
				last = sensor.lastElementChild.firstChild,
				matchFlow = function(event){
					var change = false,
						width = element.offsetWidth;
					if (x != width) {
						first.style.width = width - 1 + 'px';	
						last.style.width = width + 1 + 'px';
						change = true;
						x = width;
					}
					var height = element.offsetHeight;
					if (y != height) {
						first.style.height = height - 1 + 'px';
						last.style.height = height + 1 + 'px';	
						change = true;
						y = height;
					}
					if (change && event.currentTarget != element) fireEvent(element, 'resize');
				};
			
			if (getComputedStyle(element).position == 'static'){
				element.style.position = 'relative';
				element._resizeSensor._resetPosition = true;
			}
			addFlowListener(sensor, 'over', matchFlow);
			addFlowListener(sensor, 'under', matchFlow);
			addFlowListener(sensor.firstElementChild, 'over', matchFlow);
			addFlowListener(sensor.lastElementChild, 'under', matchFlow);	
			element.appendChild(sensor);
			matchFlow({});
		}
		var events = element._flowEvents || (element._flowEvents = []);
		if (events.indexOf(fn) == -1) events.push(fn);
		if (!resize) element.addEventListener('resize', fn, false);
		element.onresize = function(e){
			events.forEach(function(fn){
				fn.call(element, e);
			});
		};
	};
	
	function removeResizeListener(element, fn){
		var index = element._flowEvents.indexOf(fn);
		if (index > -1) element._flowEvents.splice(index, 1);
		if (!element._flowEvents.length) {
			var sensor = element._resizeSensor;
			if (sensor) {
				element.removeChild(sensor);
				if (sensor._resetPosition) element.style.position = 'static';
				delete element._resizeSensor;
			}
			if ('onresize' in element) element.onresize = null;
			delete element._flowEvents;
		}
		element.removeEventListener('resize', fn);
	};
	
	Hitch.add({
		name: "-js-min-width",
		base: "*",
		type: "selector",
		filter: function(element, arguments){
			var w = parseInt(arguments); console.log("min"+w);
			if(!element._flowEvents || element._flowEvents.length==0) {
				var currentTimer = 0;
				addResizeListener(element, function() { console.log("onresize"); fireEvent(this, "DOMAttrModified"); });
			}
			return element.offsetWidth>=w;
		}
	});
	
	Hitch.add({
		name: "-js-max-width",
		base: "*",
		type: "selector",
		filter: function(element, arguments){
			var w = parseInt(arguments); console.log("max"+w);
			if(!element._flowEvents || element._flowEvents.length==0) {
				addResizeListener(element, function() { console.log("onresize"); fireEvent(this, "DOMAttrModified"); });
			}
			return element.offsetWidth<w;
		}
	});
	
})();