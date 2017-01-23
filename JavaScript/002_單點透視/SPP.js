(function(global){

  var SPP = function(canvas){
    return new SPP.init(canvas);
  }

  SPP.prototype = {
	  
	  onResize: function(){
		  console.log("onResize");
		var width = $(window).width()-25;
		var height = $(window).height()-25;
		var length = ( width < height ) ? width : height;

		$(this.Canvas).width(length);
		$(this.Canvas).height(length);
	  },
	  
  }

  SPP.init = function(canvas){
	var self = this;
	self.Canvas = canvas;
	console.log(self);
	
	self.onResize();

	$(global).resize(function(){
		self.onResize();
	 });
	
	
	}
	
  SPP.init.prototype = SPP.prototype;

  global.SPP = global.A$ = SPP;

})(window)
