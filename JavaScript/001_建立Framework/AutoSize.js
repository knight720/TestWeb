(function(global){

  var AutoSize = function(){
    console.log("1");
    return new AutoSize.init();
  }

  AutoSize.prototype = {}

  AutoSize.init = function(){
	var self = this;
	   
    console.log("2");
  }

 

  AutoSize.init.prototype = AutoSize.prototype;

  global.AutoSize = global.A$ = AutoSize;

})(window)
