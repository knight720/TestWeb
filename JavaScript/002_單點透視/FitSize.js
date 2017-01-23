(function(global){

  var FitSize = function(canvas){
    return new FitSize.init(canvas);
  }

  FitSize.prototype = {
	  
	  onResize: function(){
		  console.log("onResize");
		var width = $(window).width()-25;
		var height = $(window).height()-25;
		var length = ( width < height ) ? width : height;

		$(this.Canvas).width(length);
		$(this.Canvas).height(length);
	  },
	  
  }

  FitSize.init = function(canvas){
	var self = this;
	self.Canvas = canvas;
	console.log(self);
	
	self.onResize();

	$(global).resize(function(){
		self.onResize();
	 });
	
	
	}
	
  FitSize.init.prototype = FitSize.prototype;

  global.FitSize = global.A$ = FitSize;

})(window)
