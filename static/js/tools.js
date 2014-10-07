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
