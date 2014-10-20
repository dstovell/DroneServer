
function preloadCircleMenu(pgame) {
	pgame.load.image('hex', '/game/starmap/hex.png');
	pgame.load.image('outlineHex', '/game/starmap/outlineHex.png');
}

function openCircleMenu(pgame, startX, startY, items, options) {
	var twoPI = 2 * Math.PI;

	options = options || {};
	options.itemRadius = options.itemRadius || 40;
	options.menuRadius = options.menuRadius || 80;
	options.menuRadialSpace = options.menuRadialSpace || (options.itemRadius * 2);
	options.maxItems = options.maxItems || 8;
	options.startAngle = options.startAngle || Math.PI;
	options.endAngle = options.endAngle || (options.startAngle + twoPI);
	options.color = options.color || 0x2980B9;
	
	var inc = twoPI / options.maxItems;

	var menu = {circleMenuItems:[], circleMenuTexts:[]}

	var angle = options.startAngle;
	var radius = options.menuRadius;
	var countThisRow = 0;
	for (var i in items) {
		if (countThisRow >= options.maxItems) { radius += options.menuRadialSpace; angle = options.startAngle; countThisRow = 0; inc /= 2;}
		if (angle >= options.endAngle) { radius += options.menuRadialSpace; angle = options.startAngle; countThisRow = 0; inc /= 2;}
		var x = startX + radius * Math.cos(angle);
		var y = startY + radius * Math.sin(angle);
		menu = addCircleMenuItem(pgame, menu, items[i].name, items[i].cb, items[i].ctx, options.itemRadius, options.color, startX, startY, x, y);
		angle+=inc;
		countThisRow++;
	}

	return menu;
}

function closeCircleMenu(pgame, menu, closedCB) {
	for (var i in menu.circleMenuItems) {
		pgame.add.tween(menu.circleMenuItems[i].scale).to({ x:0.001, y:0.001}, 500, Phaser.Easing.Quadratic.InOut, true);
		setTimeout(function(){ menu.circleMenuItems[i].kill(); }, 500);	
	}
	setTimeout(function(){ menu.circleMenuItems = []; menu = null; if (closedCB) {closedCB()} }, 600);

	for (var i in menu.circleMenuTexts) {
		menu.circleMenuTexts[i].destroy();
	}
	menu.circleMenuTexts = [];
}

function addCircleMenuItem(pgame, menu, text,  cb, ctx, radius, color, x, y, finalX, finalY) {
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
		item.events.onInputDown.add(cb, ctx);
	}

	var subScale = radius / 40;

	//This needs to take radius into account
	pgame.add.tween(item).to({ x:finalX, y:finalY }, 500, Phaser.Easing.Quadratic.InOut, true);
	pgame.add.tween(item.scale).to({ x:0.06*subScale, y:0.06*subScale}, 500, Phaser.Easing.Quadratic.InOut, true);
	pgame.add.tween(itemOutline).to({ x:finalX, y:finalY }, 500, Phaser.Easing.Quadratic.InOut, true);
	pgame.add.tween(itemOutline.scale).to({ x:0.06*subScale, y:0.06*subScale}, 500, Phaser.Easing.Quadratic.InOut, true);

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

function addButton(pgame, text, cb, ctx, radius, color, x, y) {
	var button = {items:[], texts:[]};
	var scale = radius / 40;

	var item = drawSprite(pgame, x, y, 'hex', {scale:0.06*scale, color:color, alpha:0.4, gameObject:ctx}, cb);
	var itemOutline = drawSprite(pgame, x, y, 'outlineHex', {scale:0.06*scale, color:color, gameObject:ctx}, cb);

	button.items.push(item);
	button.items.push(itemOutline);

	//This needs to take radius into account
	var text = pgame.add.text(x, y, text, { font: "15px Arial", fill: "#ffffff", align: "center" });
	text.scale.setTo(1, 1);
	text.anchor.setTo(0.5, 0.5);

	button.texts.push(text);

	return button;
}

function setButtonSelected(button, selected) {
	var a = selected ? 1.0 : 0.4;
	button.items[0].alpha = a;
}

function moveCameraTo(pgame, x, y) {
	var cam = pgame.camera;
	cam.follow(null);
	pgame.add.tween(cam).to(	{ x: x - (cam.width / 2), y: y - (cam.height / 2) }, 
								750, Phaser.Easing.Quadratic.InOut, true );
}