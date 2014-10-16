

function drawAASprite(pgame, x, y, id, scale, color, gameObj, inputCB, hasConvex) {
	hasConvex = (hasConvex != null) ? hasConvex : true;

	function draw(_scale, alpha) {
		var s = pgame.add.sprite(x, y, id);
		s.scale.setTo(_scale, _scale);
		s.anchor.setTo(0.5, 0.5);
		s.tint = parseInt(color, 16);
		s.alpha = alpha;
		if (inputCB) {
			s.inputEnabled = true;
			s.gameObject = gameObj;
			s.events.onInputDown.add(inputCB);
		}

		return s;
	}

	var objs = [];

	var scaleFallOff = 0.05;
	var alphaFallOff = 0.5;
	if (hasConvex) {
		objs.push( draw(scale*(1-scaleFallOff), alphaFallOff) );
	}
	objs.push( draw(scale*(1+scaleFallOff), alphaFallOff) );
	objs.push( draw(scale, 1.0) );

	return objs;
}
