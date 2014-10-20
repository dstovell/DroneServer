

function drawSprite(pgame, x, y, id, options, inputCB) {
	options = options || {};

	var s = pgame.add.sprite(x, y, id);
	if (options.scale != null) {
		s.scale.setTo(options.scale, options.scale);
	}
	s.anchor.setTo(0.5, 0.5);
	if (options.color != null) {
		s.tint = parseInt(options.color, 16);
	}
	if (options.alpha != null) {
		s.alpha = options.alpha;
	}
	if (inputCB) {
		s.inputEnabled = true;
		s.gameObject = options.gameObject;
		s.events.onInputDown.add(inputCB, options.gameObject);
	}

	return s;
}
