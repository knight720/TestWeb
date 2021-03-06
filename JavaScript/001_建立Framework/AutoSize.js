(function(global){

  var AutoSize = function(canvas){
    return new AutoSize.init(canvas);
  }

  AutoSize.prototype = {
	  
	  onResize: function(){
		  console.log("onResize");
		var width = $(window).width()-25;
		var height = $(window).height()-25;
		var length = ( width < height ) ? width : height;

		$(this.Canvas).width(length);
		$(this.Canvas).height(length);
	  },
	  
  }

  AutoSize.init = function(canvas){
	var self = this;
	self.Canvas = canvas;
	console.log(self);
	
	self.onResize();

	$(global).resize(function(){
		self.onResize();
	 });
	
	
	}
	
  AutoSize.init.prototype = AutoSize.prototype;

  global.AutoSize = global.A$ = AutoSize;

})(window)
