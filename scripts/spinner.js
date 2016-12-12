var FULL_PIE = Math.PI * 2;

// Arguments:
// canvas:		The canvas element you would like the spinner painted on
// centerX:		The center of the spinner on x axis
// centerY:		The center of the spinner on y axis
// radius:		The radius of the spinner
// values:		An array of string values to be shown on the spinner
// colors:		An array of hex color strings for the background colors of the spinner sections. An array shorter than values.length will repeat the same pattern.
// spinSound:	The audio element you would like to play each time the spinner switches from one value to the next (typically a short click or something)
// volume:		The volume of the spinner (defaults to 0.5 if undefined)
function Spinner(canvas, centerX, centerY, radius, values, colors, spinSound, volume){
	this.canvas = canvas;
	this.ctx = canvas.getContext('2d');
	this.centerX = centerX;
	this.centerY = centerY;
	this.radius = radius;
	this.values = values;
	this.colors = colors;
	this.sectorCount = values.length;
	this.sectorSize = FULL_PIE / values.length;
	this.rotation = 0;
	this.isSpinning = false;
	this.spinSound = spinSound;
	this.volume = volume;
	this.addRotation = (rotation) => {
		this.rotation = (this.rotation + rotation) % FULL_PIE;
	};
	this.getCurrentValue = () => {
		return this.values[this.getCurrentIndex()];
	};
	this.getCurrentIndex = () => {
		var ratio = this.rotation / FULL_PIE;
		var index = this.values.length - Math.floor(ratio * this.values.length);
		return index - 1;
	};
	this.repaint = () => {
		var ctx = this.ctx;
		var defaultLineWidth = this.radius / 175;
		ctx.lineWidth = defaultLineWidth;
		var fontSize = this.radius / this.sectorCount * 2;
		ctx.font = 'bold ' + fontSize + 'px Arial';

		var ld = (canvas.width > canvas.height)? canvas.width : canvas.height;

		// Clear the canvas (including space off the visible canvas)
		ctx.clearRect(-ld*2,-ld*2, ld*4,ld*4);

		var halfSector = this.sectorSize / 2;

		// Rotates the final canvas by spinners current rotation
		ctx.setTransform(1, 0, 0, 1, centerX, centerY, 0);
		ctx.rotate(this.rotation + halfSector);

		for(var i = 0; i < this.sectorCount; i++){
			// Draw basic sector
			ctx.beginPath();
			ctx.moveTo(0,0);
			ctx.arc(0,0,this.radius, -halfSector, halfSector);
			ctx.closePath();
			ctx.fillStyle = colors[i % this.colors.length];
			ctx.fill();
			ctx.stroke();

			// Determine to draw with black or white text
			var r = parseInt('0x' + ctx.fillStyle.substring(1,3));
			var g = parseInt('0x' + ctx.fillStyle.substring(3,5));
			var b = parseInt('0x' + ctx.fillStyle.substring(5,7));
			var luminosity = 0.21 * r + 0.72 * g + 0.07 * b;
			if(luminosity < 127){
				ctx.fillStyle = '#fff';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 4;
			} else {
				ctx.fillStyle = '#000';
				ctx.strokeStyle = '#fff';
				ctx.lineWidth = 3;
			}

			// Draw text
			var text = this.values[i];
			var textDimensions = ctx.measureText(text);
			var textWidth = textDimensions.width;
			ctx.strokeText(text, this.radius - textWidth - fontSize / 3, fontSize / 2 - fontSize / 5);;
			ctx.fillText(text, this.radius - textWidth - fontSize / 3, fontSize / 2 - fontSize / 5);

			// Add highlight to current value
			if(this.getCurrentIndex() == i){
				// Obnoxiously complicated math to acheive an inner stroke
				ctx.lineJoin = 'miter';
				var desiredStroke = this.radius / 100;
				var y = 0;
				var a = desiredStroke / 2 + defaultLineWidth / 2;
				var b = a / Math.tan(halfSector);
				var c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
				var x = c;

				ctx.strokeStyle = '#000';
				ctx.lineWidth = desiredStroke * 1.7;

				// Draw black layer of highlight
				ctx.beginPath();
				ctx.moveTo(x,y);
				ctx.arc(x,y,this.radius - x - a, -halfSector, halfSector);
				ctx.lineTo(x,y);
				ctx.closePath();
				ctx.stroke();

				ctx.beginPath();
				ctx.moveTo(x,y);
				ctx.arc(x,y,this.radius / 3 - x + a, -halfSector, halfSector);
				ctx.lineTo(x,y);
				ctx.closePath();
				ctx.stroke();

				// Set inner stroke properties
				ctx.strokeStyle = '#0ff';
				ctx.lineWidth = desiredStroke;

				// Draw colored layer of highlight
				ctx.beginPath();
				ctx.moveTo(x,y);
				ctx.arc(x,y,this.radius - x - a, -halfSector, halfSector);
				ctx.lineTo(x,y);
				ctx.closePath();
				ctx.stroke();

				ctx.beginPath();
				ctx.moveTo(x,y);
				ctx.arc(x,y,this.radius / 3 - x + a, -halfSector, halfSector);
				ctx.lineTo(x,y);
				ctx.closePath();
				ctx.stroke();

				// Reset the stroke
				ctx.strokeStyle = '#000';
				ctx.lineWidth = defaultLineWidth;
			}

			// Rotate the canvas for the next sector to be drawn
			ctx.rotate(this.sectorSize);
			ctx.strokeStyle = '#000';
			ctx.lineWidth = defaultLineWidth;
		}

		// Save so we can draw static elements over spinner
		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		// Draw pointer arrow
		ctx.beginPath();
		var size = this.radius / 20;
		var pointerX = this.centerX + this.radius + 2;
		var pointerY = this.centerY;
		ctx.moveTo(pointerX, pointerY);
		ctx.lineTo(pointerX + size, pointerY + size / 2);
		ctx.lineTo(pointerX + size, pointerY - size / 2);
		ctx.closePath();
		ctx.fillStyle = '#f09';
		ctx.fill();
		ctx.stroke();
		
		// Draw center circle
		ctx.beginPath();
		ctx.arc(this.centerX,this.centerY,this.radius / 3,0, FULL_PIE);
		ctx.closePath();
		ctx.fillStyle = '#888';
		ctx.fill();
		ctx.stroke();
		
		ctx.restore();
	};
	this.spin = (initialVelocity, startTime) => {
		this.isSpinning = true;
		if(initialVelocity == undefined){
			initialVelocity = Math.random() * 0.02 + 0.045;
		}
		if(startTime == undefined){
			startTime = Date.now();
		}
		var elapsed = Date.now() - startTime;
		var wheelVel = initialVelocity - elapsed * 0.00001;
		var add = initialVelocity - wheelVel;
		var oldIndex = this.getCurrentIndex();
		this.addRotation(wheelVel);
		var newIndex = this.getCurrentIndex();
		if(oldIndex != newIndex && this.spinSound != undefined){
			var instance = this.spinSound.cloneNode();
			instance.volume = this.volume || 0.5;
			instance.play();
		}
		this.repaint();
		if(wheelVel > 0){
			requestAnimationFrame(() => {
				this.spin(initialVelocity, startTime);
			});
		} else {
			this.isSpinning = false;
			this.spinHandler(this.getCurrentValue());
		}
	};
	// What happens when the spinner lands on something
	this.spinHandler = (value) => {
		console.error('spinHandler has not been overridden');
	};
	this.repaint();
}
