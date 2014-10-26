function hasClass(element, cls) {
	return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function getFirstParentElement(obj, parentClassName) {
	var wellBaseMultiplier = 1.0;

	var parent = obj;
	var foundParent = null;
	while(!foundParent)
	{
		if (parent.parentElement == null) {
			break;
		}

		if (hasClass(parent, parentClassName)) {
			foundParent = parent;
		}
		else {
			parent = parent.parentElement;
		}
	}
	
	return foundParent;
}


function resizeElement(element){
	if (!element || !hasClass(element, 'resize-to-container')) {
		return;
	}

    var container = getFirstParentElement(element, "resize-container");

	var targetHeight = window.innerHeight * element.getAttribute('rheight');
	var targetWidth = container.clientWidth - 30;

	if (element.getAttribute('rwidth') != null) {
		targetWidth = window.innerHeight * element.getAttribute('rwidth');
	}

    if (element.width != targetWidth)
    {
        element.width = targetWidth + 500;
    }

    if (element.clientWidth != targetWidth)
    {
        element.clientWidth = targetWidth;
    }

    //alert("targetWidth=" + targetWidth + " element.clientWidth=" + element.clientWidth + " element.width=" + )

    if (element.height != targetHeight)
    {
        element.height = targetHeight;
    }

    if (element.clientHeight != targetWidth)
    {
        element.clientHeight = targetWidth;
    }
}

function resizeAllElements(){
	var elementArray = document.getElementsByClassName("resize-to-container")

	for (var i=0; i < elementArray.length; i++) {
	     resizeElement( elementArray[i] );
	}
}

function isStorageAvailable() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}

var serverSyncDeltaTime = 0;

function setServerTime(t) {
	var currentTime = new Date().getTime();
	serverSyncDeltaTime = t - currentTime;
}

function getServerTime_s() {
	return getServerTime_ms() / 1000;
}

function getServerTime_ms() {
	var currentTime = new Date().getTime();
	return (currentTime + serverSyncDeltaTime);
}

function vector2(x, y) {
	return {x:x, y:y};
}

function diffVector2(v1, v0) {
	var x = v1.x - v0.x;
	var y = v1.y - v0.y;
	return vector2(x, y);
}

function sumVector2(v1, v0) {
	var x = v1.x + v0.x;
	var y = v1.y + v0.y;
	return vector2(x, y);
}

function multVector2(m, v) {
	var x = m * v.x;
	var y = m * v.y;
	return vector2(x, y);
}

function lengthVector2(v) {
	var lengthSquared = v.x*v.x + v.y*v.y;
	return Math.sqrt(lengthSquared);
}

function distanceVector2(v1, v0) {
	var vDiff = diffVector2(v1, v0);
	return lengthVector2(vDiff);
}

function normalizeVector2(v) {
	var length = lengthVector2(v);
	var x = v.x / length;
	var y = v.y / length;
	return vector2(x, y);
}

function radiansToDegrees(rad) {
	var twoPI = 2 * Math.PI;
	return (rad / twoPI) * 360;
}

function degreesToRadians(deg) {
	var twoPI = 2 * Math.PI;
	return (deg / 360) * twoPI;
}

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
