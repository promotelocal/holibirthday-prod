define([], function () {
	return function (dimensions, src, lines) {
		var srcS = Stream.create();
		var canvas = document.createElement('canvas');
		var $canvas = $(canvas);
		$canvas.appendTo($('body'))
			.prop('width', dimensions.width)
			.prop('height', dimensions.height);

		var ctx = canvas.getContext('2d');

		var drawCenteredText = function (p, text, font) {
			ctx.font = font;
			var width = ctx.measureText(text).width;
			ctx.fillText(text, p.x - width / 2, p.y);
		};
		
		var img = new Image();
		img.onload = function() {
			ctx.drawImage(img, 0, 0);
			lines.map(function (line) {
				if (line.center) {
					drawCenteredText(line.center, line.text, line.font);
				}
			});
			setTimeout(function () {
				srcS.push(canvas.toDataURL());
				$canvas.remove();
			});
		};
		img.src = src;
		return srcS;
	};
});
