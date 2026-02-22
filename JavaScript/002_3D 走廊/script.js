var _Canvas = document.getElementById('myCanvas');
var _Context = _Canvas.getContext('2d');
var information = document.getElementById('info');

_Canvas.addEventListener('mousemove', onMouseMove, false);
_Canvas.addEventListener('wheel', onMouseWheel, { passive: false });
_Canvas.addEventListener('mousewheel', onMouseWheel, false);
_Canvas.addEventListener('mousedown', onMouseDown, false);

var _TimerID = setInterval(onDraw, 33 );
var _Frame = new Frame(_Canvas.width,_Canvas.height,25);
var _BulletManager = new BulletManager();
var _MouseX = _Frame.X;
var _MouseY = _Frame.Y;
var _Text = 0;

function onMouseMove(e) {
  _MouseX = e.clientX - _Canvas.offsetLeft;
  _MouseY = e.clientY - _Canvas.offsetTop;
}

function onMouseWheel(e) {
  var delta = 0;
  if (typeof e.deltaY === 'number') {
    delta = -e.deltaY / 100;
  } else if (typeof e.wheelDelta === 'number') {
    delta = e.wheelDelta / 120;
  }

  _Frame.Move(delta);
  if (e.preventDefault) {
    e.preventDefault();
  }
}

function onMouseDown(e) {
  //_Bullet.Move();
  //_BulletManager.Move();
}

function onDraw() {
  // change
  _BulletManager.Move();
  // clear
  clearCanvas(_Context);
  // draw
  _Frame.Draw(_Context);
  _BulletManager.Draw(_Context);
  //DrawText(_Context);
}

function clearCanvas(context) {
  context.clearRect(0,0,_Canvas.width,_Canvas.height);  
}

function Frame(w,h,d) {
  // frame
  this.Width = w;
  this.Height = h;
  this.Depth = d;
  this.CenterX = w/2;
  this.CenterY = h/2;
  // view
  this.X = this.Width/2;
  this.Y = this.Height/2;
  this.Z = 0;  
  this.WallCenterX = this.X;
  this.WallCenterY = this.Y;
  this.WallScale = this.MaxScale;
  this.WallX = this.X * this.WallScale;
  this.WallY = this.Y * this.WallScale;
  // Factory
  this.MaxScale = 0.4;
  
  this.Draw = function(context) {
    var w = this.Width * this.WallScale;
    var h = this.Height * this.WallScale;
    var w2 = w / 2;
    var h2 = h / 2;
    
    var dx = this.CenterX - _MouseX;
    var dy = this.CenterY - _MouseY;
    this.WallCenterX = dx + this.CenterX;
    this.WallCenterY = dy + this.CenterY;
    
    this.WallX = this.WallCenterX - w2;
    this.WallY = this.WallCenterY - h2;
    var p2x = this.WallCenterX + w2;
    var p2y = this.WallY;
    var p3x = p2x;
    var p3y = this.WallCenterY + h2;
    var p4x = this.WallX;
    var p4y = p3y;
    
    context.beginPath();
    context.lineJoin="round"; 
  
    // wall
    context.moveTo(this.WallX,this.WallY);
    context.lineTo(p2x,p2y);
    context.lineTo(p3x,p3y);
    context.lineTo(p4x,p4y);
    context.lineTo(this.WallX,this.WallY);
  
    // line
    context.moveTo(0,0);
    context.lineTo(this.WallX,this.WallY);
    context.moveTo(this.Width,0);
    context.lineTo(p2x,p2y);
    context.moveTo(this.Width,this.Height);
    context.lineTo(p3x,p3y);
    context.moveTo(0,this.Height);
    context.lineTo(p4x,p4y);
  
    context.stroke();
  };
  
  this.GetScale = function(z) {
    //var scale = this.MaxScale + ( 1 - this.MaxScale) *(z / this.Depth);
    //var scale = this.MaxScale*(this.Depth - this.Z)/(z - this.Z);
    //var scale = this.MaxScale*z/(this.Depth - this.Z);
    var scale = this.MaxScale + (1 - this.MaxScale)*(this.Depth - this.Z - z - this.Z)/(this.Depth - this.Z);
    return scale;
  };
  
  this.UpdateWallScale = function() {
    //this.WallScale = this.MaxScale + ( 1 - this.MaxScale) *(this.Z / this.Depth);
    //this.WallScale = this.GetScale(this.Z);
    this.WallScale = this.GetScale(this.Depth - this.Z);
    //ShowInformation(this.WallScale);
  };
  
  this.UpdateWallScale();
  
  this.Move = function(value) {
    this.Z += value;
    if (this.Z < 0) this.Z = 0;
    //else if (this.Z > this.Depth) this.Z = this.Depth;
    else if (this.Z > 6) this.Z = 6;
    
    this.UpdateWallScale();
    //_Text = this.Z;
    ShowInformation(this.Z);
  };
  
  this.D3ToD2 = function(x,y,z) {
    //ShowInformation(this.WallX+","+this.WallY+","+this.WallScale);
    var wallx = this.WallX + x * this.WallScale;
    var wally = this.WallY + y * this.WallScale;
    var scale = (z-this.Z) / (this.Depth - this.Z);
    //ShowInformation(z+","+this.Z+","+this.Depth+","+scale);
    //ShowInformation(wallx+","+wally+","+x+","+y+","+scale);
    //DrawText2(_Context, z);
        
    return {
      //D2X: x,
      //D2Y: y
      //D2X: wallx,
      //D2Y: wally
      //D2X: Math.abs(x - z0x) * z / this.Z,
      //D2Y: Math.abs(y - z0y) * z / this.Z
      //D2X: Math.min(x,wallx) + Math.abs(wallx - x) * scale,
      //D2Y: Math.min(y,wally) + Math.abs(wally - y) * scale
      //D2X: wallx + (wallx - x) * scale,
      //D2Y: wally + (wally - y) * scale
      D2X: x + (wallx-x) * scale,
      D2Y: y + (wally-y) * scale
    };
  };
  
 
}

function Bullet() {
  var Colors = new Array("Red","Orange","Yellow","Green","Blue","Indigo","Purple");
  this.Color = Colors[Math.floor(Math.random() * Colors.length)];
  //this.X = 200;
  //this.Y = 200;
  this.X = Math.round(Math.random()*_Canvas.width);
  this.Y = Math.round(Math.random()*_Canvas.height);
  //this.Z = 25;
  this.Z = _Frame.Depth;
  this.Size = 20;
  //this.DZ = 0.1;
  this.DZ = 0.25*Math.random();
  
  //_Text = "Create";
  
  this.Move = function(){
    this.Z -= this.DZ;
    if (this.Z < _Frame.Z) {
      //this.X = 200;
      //this.Y = 200;
      this.X = Math.random()*_Canvas.width;
      this.Y = Math.random()*_Canvas.height;
      this.Z = _Frame.Depth;
    }
    //ShowInformation(this.Z+","+_Frame.Z +","+ _Frame.Depth);
    
  };
  
  this.Draw = function(context){
    //_Text = this.Z;
    //ShowInformation(this.Z + "," + _Frame.Z);
    if (this.Z >= _Frame.Z){
      //DrawText2(context, this.X+","+this.Y+","+this.Z);
      
      var position = _Frame.D3ToD2(this.X,this.Y,this.Z);
      
      //DrawText2(context, position.D2X+","+position.D2Y);
      
      //ShowInformation(this.X+","+this.Y+","+this.Z);
      
      //context.fillStyle = 'red';
      context.fillStyle = this.Color;
      context.beginPath();
      //context.arc(position.D2X, position.D2Y, 5, 0, 2 * Math.PI);
      //context.arc(this.X, this.Y, this.Size* this.Z, 0, 2 * Math.PI);
      //var scale = _Frame.GetScale(this.Z-_Frame.Z);
      var scale = _Frame.GetScale(this.Z);
      //ShowInformation(this.Z + "," + _Frame.Z +"," + scale);
      //ShowInformation(this.Z-_Frame.Z);
      //ShowInformation(this.Z + "," +scale);
      context.arc(position.D2X, position.D2Y, this.Size * scale, 0, 2 * Math.PI);
      context.fill();
      }
  };
  
}

function BulletManager() {
  this.Count = 10;
  var ary = [];
  
  for (var i =0; i<this.Count; i++)
  {
    ary.push(new Bullet());
    //ShowInformation("Build");
  }
  
  this.Sort = function() {
    ary.sort(function(a, b) {
      return b.Z - a.Z;
    });
  };
  
  this.Draw = function(context) {
    //ShowInformation("BeforeDraw");
    this.Sort();
    for (var i=0; i< ary.length;i++)
    {
      ary[i].Draw(context);
    }
    //ShowInformation("AfterDraw");
  };
  
  this.Move = function() {
    for (var i=0; i< ary.length;i++)
    {
      ary[i].Move();
      //ShowInformation("Move");
    }
  };
  
}

function DrawText(context) {
  context.fillStyle = 'lime';
  context.font="10px Arial";
  context.fillText(_Text,0,_Canvas.height);
}

function DrawText2(context,text) {
  context.fillStyle = 'red';
  context.font="10px Arial";
  context.fillText(text,0,10);
}

function DrawPoint(context,x,y) {
  context.fillStyle = 'blue';
  context.beginPath();
  context.arc(x, y, 10, 0, 2 * Math.PI);
  context.fill();
}

function ShowInformation(message) {
  information.value = message;
}