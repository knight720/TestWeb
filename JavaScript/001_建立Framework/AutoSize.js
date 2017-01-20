(function(global){

  var AutoSize = function(canvas){
    console.log("1");
    return new AutoSize.init(canvas);
  }

  AutoSize.prototype = {}

  AutoSize.init = function(canvas){
	console.log("2");
	//console.log("{0},{1}".format(1,2));
	//console.log("window " + window.width + "," + window.height);
	console.log("screen " + screen.width + "," + screen.height);
	console.log("document.body " + document.body.clientWidth + "," + document.body.clientHeight);
	
	var self = this;
	self.Canvas = canvas;
	console.log(self.Canvas);

	$(global).resize(function(){
		console.log("global resize");
		console.log(self.Canvas);
		console.log("document.body " + document.body.clientWidth + "," + document.body.clientHeight);
		console.log("window.height " + $(window).width() + "," + $(window).height());
				
		var width = $(window).width();
		var height = $(window).height()-25;
		var length = ( width < height ) ? width : height;
		console.log(length);
		
		//self.Canvas.width  = document.body.clientWidth;
		//self.Canvas.height = document.body.clientHeight;
		$(self.Canvas).width(length);
		$(self.Canvas).height(length);
	});
	}

 

  AutoSize.init.prototype = AutoSize.prototype;

  global.AutoSize = global.A$ = AutoSize;

})(window)
