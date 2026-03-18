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
}

function onDraw() {
  _BulletManager.Move();
  clearCanvas(_Context);
  _Frame.Draw(_Context);
  _BulletManager.Draw(_Context);
}

function clearCanvas(context) {
  context.clearRect(0,0,_Canvas.width,_Canvas.height);  
}

function Frame(w,h,d) {
  this.Width = w;
  this.Height = h;
  this.Depth = d;
  this.CenterX = w/2;
  this.CenterY = h/2;
  this.X = this.Width/2;
  this.Y = this.Height/2;
  this.Z = 0;  
  this.WallCenterX = this.X;
  this.WallCenterY = this.Y;
  this.WallScale = this.MaxScale;
  this.WallX = this.X * this.WallScale;
  this.WallY = this.Y * this.WallScale;
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

    context.moveTo(this.WallX,this.WallY);
    context.lineTo(p2x,p2y);
    context.lineTo(p3x,p3y);
    context.lineTo(p4x,p4y);
    context.lineTo(this.WallX,this.WallY);

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
    var scale = this.MaxScale + (1 - this.MaxScale)*(this.Depth - this.Z - z - this.Z)/(this.Depth - this.Z);
    return scale;
  };
  
  this.UpdateWallScale = function() {
    this.WallScale = this.GetScale(this.Depth - this.Z);
  };
  
  this.UpdateWallScale();
  
  this.Move = function(value) {
    this.Z += value;
    if (this.Z < 0) this.Z = 0;
    else if (this.Z > 6) this.Z = 6;
    
    this.UpdateWallScale();
    ShowInformation(this.Z);
  };
  
  this.D3ToD2 = function(x,y,z) {
    var wallx = this.WallX + x * this.WallScale;
    var wally = this.WallY + y * this.WallScale;
    var scale = (z-this.Z) / (this.Depth - this.Z);
        
    return {
      D2X: x + (wallx-x) * scale,
      D2Y: y + (wally-y) * scale
    };
  };
  
 
}

function Bullet() {
  var Colors = new Array("Red","Orange","Yellow","Green","Blue","Indigo","Purple");
  this.Color = Colors[Math.floor(Math.random() * Colors.length)];
  this.X = Math.round(Math.random()*_Canvas.width);
  this.Y = Math.round(Math.random()*_Canvas.height);
  this.Z = _Frame.Depth;
  this.Size = 20;
  this.DZ = 0.25*Math.random();
  
  this.Move = function(){
    this.Z -= this.DZ;
    if (this.Z < _Frame.Z) {
      this.X = Math.random()*_Canvas.width;
      this.Y = Math.random()*_Canvas.height;
      this.Z = _Frame.Depth;
    }
  };
  
  this.Draw = function(context){
    if (this.Z >= _Frame.Z){
      var position = _Frame.D3ToD2(this.X,this.Y,this.Z);

      context.fillStyle = this.Color;
      context.beginPath();
      var scale = _Frame.GetScale(this.Z);
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
  }
  
  this.Sort = function() {
    ary.sort(function(a, b) {
      return b.Z - a.Z;
    });
  };
  
  this.Draw = function(context) {
    this.Sort();
    for (var i=0; i< ary.length;i++)
    {
      ary[i].Draw(context);
    }
  };
  
  this.Move = function() {
    for (var i=0; i< ary.length;i++)
    {
      ary[i].Move();
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