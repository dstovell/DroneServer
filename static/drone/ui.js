
function preloadCircleMenu(pgame) {
	pgame.load.image('hex', '/game/starmap/hex.png');
	pgame.load.image('outlineHex', '/game/starmap/outlineHex.png');
}

function openCircleMenu(pgame, startX, startY, items, options) {
	var twoPI = 2 * Math.PI;

	options = options || {};
	options.itemRadius = options.itemRadius || 40;
	options.menuRadius = options.menuRadius || 80;
	options.menuRadialSpace = options.menuRadialSpace || (options.itemRadius * 1.5);
	options.maxItems = options.maxItems || 8;
	options.startAngle = options.startAngle || Math.PI;
	options.endAngle = options.endAngle || (options.startAngle + twoPI);
	options.color = options.color || 0x2980B9;
	
	var inc = twoPI / options.maxItems;

	var menu = {circleMenuItems:[], circleMenuTexts:[]}

	var angle = options.startAngle;
	var radius = options.menuRadius;
	for (var i in items) {
		if (i >= options.maxItems) { radius += options.menuRadialSpace; angle = options.startAngle; }
		if (angle >= options.endAngle) { radius += options.menuRadialSpace; angle = options.startAngle; }
		var x = startX + radius * Math.cos(angle);
		var y = startY + radius * Math.sin(angle);
		menu = addCircleMenuItem(pgame, menu, items[i].name, items[i].cb, options.itemRadius, options.color, startX, startY, x, y);
		angle+=inc;
	}

	return menu;
}

function closeCircleMenu(menu) {
	for (var i in menu.circleMenuItems) {
		phaserGame.add.tween(menu.circleMenuItems[i].scale).to({ x:0.001, y:0.001}, 500, Phaser.Easing.Quadratic.InOut, true);
		setTimeout(function(){ menu.circleMenuItems[i].kill(); }, 500);	
	}
	setTimeout(function(){ menu.circleMenuItems = []; menu = null;}, 600);

	for (var i in menu.circleMenuTexts) {
		menu.circleMenuTexts[i].destroy();
	}
	menu.circleMenuTexts = [];
}

function addCircleMenuItem(pgame, menu, text,  cb, radius, color, x, y, finalX, finalY) {
	var item = pgame.add.sprite(x, y, 'hex');
	var itemOutline = pgame.add.sprite(x, y, 'outlineHex');
	item.alpha = 0.4;
	item.scale.setTo(0.001, 0.001); 
	itemOutline.scale.setTo(0.001, 0.001);
	item.anchor.setTo(0.5, 0.5);
	itemOutline.anchor.setTo(0.5, 0.5);
	item.tint = color;
	itemOutline.tint = color;
	if (cb) {
		item.inputEnabled = true;
		item.events.onInputDown.add(cb);
	}

	//This needs to take radius into account
	pgame.add.tween(item).to({ x:finalX, y:finalY }, 500, Phaser.Easing.Quadratic.InOut, true);
	pgame.add.tween(item.scale).to({ x:0.06, y:0.06}, 500, Phaser.Easing.Quadratic.InOut, true);
	pgame.add.tween(itemOutline).to({ x:finalX, y:finalY }, 500, Phaser.Easing.Quadratic.InOut, true);
	pgame.add.tween(itemOutline.scale).to({ x:0.06, y:0.06}, 500, Phaser.Easing.Quadratic.InOut, true);

	menu.circleMenuItems.push(item);
	menu.circleMenuItems.push(itemOutline);

	//This needs to take radius into account
	var text = pgame.add.text(x, y, text, { font: "15px Arial", fill: "#ffffff", align: "center" });
	text.scale.setTo(0.001, 0.001);
	text.anchor.setTo(0.5, 0.5);
	pgame.add.tween(text).to({ x:finalX, y:finalY }, 500, Phaser.Easing.Quadratic.InOut, true);
	pgame.add.tween(text.scale).to({ x:1, y:1}, 500, Phaser.Easing.Quadratic.InOut, true);

	menu.circleMenuTexts.push(text);

	return menu;
}


function moveCameraTo(pgame, x, y) {
	var cam = pgame.camera;
	cam.follow(null);
	pgame.add.tween(cam).to(	{ x: x - (cam.width / 2), y: y - (cam.height / 2) }, 
								750, Phaser.Easing.Quadratic.InOut, true );
}