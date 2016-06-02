var Spinner = (function(opts){
	var sp = {};
	
	if(opts.canvasId == undefined){
		console.log("Could not initialize spinner. No canvasId was provided in the 'opts' object.");
		return;
	}
	
	if(opts.parent == undefined){
		console.log("No parent was provided for spinner initialization. Using document.body as parent.");
		opts.parent = "body";
	}
	
	if(typeof opts.colors === 'string'){
		opts.colors = [opts.colors];
	}
	else if(opts.colors == undefined){
		console.log("No color information provided for spinner initialization. Defaulting to white.");
		opts.colors = ["#FFFFFF"];
	}
	else if(Object.prototype.toString.call(opts.colors) !== '[object Array]'){
		console.log("Color information for spinner was not provided as Array or String. Defaulting to white.");
		opts.colors = ["#FFFFFF"];
	}
	
	opts.radius = opts.radius || 75;
	opts.fontSize = opts.fontSize || 16;
	opts.fontFamily = opts.fontFamily || "Arial";
	
	
	var canvas = document.getElementById(opts.canvasId);
	var parent = $(canvas).parents().find(opts.parent);
	canvas.width = $(parent).width();
	canvas.height = $(parent).height();
	
	if((canvas.height/2 + opts.radius + opts.fontSize + 10) > canvas.height){
		opts.radius = (canvas.height/2) - opts.fontSize - 10;
	}
	
	var running = false;
	
	var context = canvas.getContext("2d");
	
	function convertColor(color){
		var rgb = {};
		if(color.indexOf("#") > -1){
			color = color.substring(color.indexOf("#")+1);
		}
		
		rgb.r = parseInt(color.substring(0,2), 16);
		rgb.g = parseInt(color.substring(2,4), 16);
		rgb.b = parseInt(color.substring(4,6), 16);
		
		return rgb;
	}
	
	sp.render = function(){
		running = true;
		var balls = [];
				
		addBall();
		
		var spinnerText;
		if(opts.text != undefined){
			spinnerText = new Text(context, opts.text, [canvas.width/2, canvas.height/2 + opts.radius + opts.fontSize + 10], opts.colors[0], opts.fontSize, opts.fontFamily, opts.radius);
		}
		
		function addBall(){
			var ball = new Ball(context, [canvas.width/2, canvas.height/2], opts.colors[balls.length%opts.colors.length], opts.radius);
			balls.push(ball);
			
			var segment = 360/balls.length;
			for(var i=0;i<balls.length;i++){
				balls[i].setAngle(segment*i);
			}
		}
				
				
		function draw(){
			var centered = false;
			context.clearRect(0, 0, canvas.width, canvas.height);
				
			for(var i=0;i<balls.length;i++){
				centered = balls[i].render() || centered;
			}
			
			if(spinnerText)
				spinnerText.render();
			
			if(centered){
				centered = false;
				addBall();
				if(spinnerText)
					spinnerText.changeDir();
			}
			
			if(running)
				window.requestAnimationFrame(draw);
		}
			
		window.requestAnimationFrame(draw);
	}
	
	sp.destroy = function(){
		running = false;
	}
	
	var Text = (function(context, text, pos, color, size, family, radius){
		var t = {};
		
		var opacity = 1;
		var dir = (1/(radius*2)) * -1;
		
		var colorRGB = convertColor(color);
		
		t.render = function(){
			context.font = size + "px " + family;
			context.textAlign = "center";
			context.fillStyle = "rgba(" + colorRGB.r + "," + colorRGB.g + "," + colorRGB.b + "," + opacity + ")";
			context.fillText(text, pos[0], pos[1]);
			opacity += dir;
		}
		
		t.changeDir = function(){
			dir *= -1;
		}
		
		return t;
	});
		
	var Ball = (function(context, center, color, maxRadius){
		var b = {};
		
		var radius = 0;
		var radian = 0;
		var angle = 0;
		var gradient;
		var dir = 1;
		
		var position = [0,0];
		var centered = false;
		
		var colorRGB = convertColor(color);
		
		function updateRadius(r){
			if(dir == 1){
				radius++;
				if(radius >= maxRadius){
					dir = 0;
				}
			}
			else {
				radius--;
				if(radius <= 0){
					centered = true;
					dir = 1;
				}
			}
		}
		
		function setRadian(){
			radian = angle * Math.PI/180;
			updatePosition();
		}
		
		function updatePosition(){
			position[0] = radius * Math.cos(radian) + center[0];
			position[1] = radius * Math.sin(radian) + center[1];
			
			gradient = context.createRadialGradient(position[0], position[1], 2, position[0], position[1], 5);
			gradient.addColorStop(0, color);
			gradient.addColorStop(1, "white");
		}
		
		function setAngle(a){
			if(a >= 360){
				a -= 360;
			}
			angle = a;
			
			setRadian();
		};
		
		b.setAngle = setAngle;
		
		b.setCenter = function(c){
			center = c;
			updatePosition();
		}
		
		b.setDir = function(d){
			dir = d;
		}
		
		b.render = function(){
			centered = false;
			context.fillStyle = "rgba(" + colorRGB.r + "," + colorRGB.g + "," + colorRGB.b + ", 0.5)";
			
			context.beginPath();
			context.ellipse(position[0], position[1], 5, 5, 0, 0, 2*Math.PI);
			context.fill();
			
			updateRadius();
			setAngle(angle+5);
			
			return centered;
		}
		
		return b;
	});
	
	return sp;
});