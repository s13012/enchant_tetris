"use strict"

enchant();

var gsettings = {                 
  width:320
    ,height:320
    ,fps:10
};

var BLOCKS = [
  [
    [1,1],
    [0,1],
    [0,1]
  ],
  [
    [1,1],
    [1,0],
    [1,0]
  ],	
  [
    [1,1],
    [1,1]
  ],
  [
    [1,0],
    [1,1],
    [1,0]
  ],
  [
    [1,0],
    [1,1],
    [0,1]
  ],
  [
    [0,1],
    [1,1],
    [1,0]
  ],
  [
    [1],
    [1],
    [1],
    [1]
  ]
  ];

  var BLOCK_COLORS = [
    "red", "yellow", "magenta", "green", "blue", "orange", "cyan"
  ];

  var stage, game, blockMap = [];

  var blockMapSettings = {
    width:320
      ,height:320
      ,matrix: blockMap 
      ,color: "gray"
      ,blockMapWidth: 10
      ,blockMapHeight: 20
  };

var blockSettings = {
  width: 100
    ,height: 100
    ,matrix: BLOCKS[random(BLOCKS.length)]
    ,color: BLOCK_COLORS[random(BLOCK_COLORS.length)]
    ,blockSize: gsettings.height / blockMapSettings.blockMapHeight
};

var BlockMap = Class.create(Sprite,{
  initialize:function(assets){
    Sprite.call(this, assets.width, assets.height);
    this.image = new Surface(assets.width, assets.height);
    this.color = assets.color;
    this.blockSize = blockSettings.blockSize;
    stage.addChild(this);
  },
  onenterframe:function(){
    this.image.context.clearRect(0, 0, this.image.width, this.image.height); //前のブロック領域を削除
    this.paintMatrix(blockMap, this.color); //毎フレームごとにブロックを描画
  },
  paintMatrix:function(matrix, color){ //ブロックを描画
    this.image.context.fillStyle = color;
    this.image.context.strokeStyle = "black";
    for(var y = 0; y < matrix.length; y++){
      for(var x = 0; x < matrix[y].length; x++){
        if(matrix[y][x]){
          this.image.context.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
          this.image.context.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
        }
      }
    }
  }
});

var Block = Class.create(Sprite,{
  initialize:function(assets){
    Sprite.call(this, assets.width, assets.height);
    this.image = new Surface(assets.width, assets.height);
    this.color = assets.color;
    this.matrix = assets.matrix;
    this.mapWidth = 10;
    this.mapHeight = 20;
    this.speed = assets.blockSize;
    this.blockSize = assets.blockSize;
    this.center = game.width / 4 - this.blockSize;
    this.x = this.center;
    this.y = 0;
    stage.addChild(this);
  },
  onenterframe:function(){
    //上キー:回転処理
    if(game.input.up){
      if(this.check(blockMap, this.rotate(this.matrix), this.x / this.blockSize, this.y / this.blockSize)){
        this.matrix = this.rotate(this.matrix);
      }
    }

    //左キー:移動処理
    if(game.input.left){
      if(this.check(blockMap, this.matrix, (this.x - this.blockSize) / this.blockSize, this.y / this.blockSize)){
        this.x -= this.speed;
      }
    }

    //右キー:移動処理
    if(game.input.right){
      if(this.check(blockMap, this.matrix, (this.x + this.blockSize) / this.blockSize, this.y / this.blockSize)){
        this.x += this.speed;
      }
    }

    //下キー:落下処理
    if(game.input.down){
      var y = this.y / this.blockSize;
      while(this.check(blockMap, this.matrix, this.x / this.blockSize, y)){
        y++;
      }
      this.y = y * this.blockSize - this.blockSize;
    }

    //自動落下
    if(this.age % game.fps == 0){
      if(this.check(blockMap, this.matrix, this.x / this.blockSize, (this.y + this.blockSize) / this.blockSize)){
        this.y += this.speed;
      } else {
        //blockMap配列にマージしてリセット処理
        this.mergeMatrix(blockMap, this.matrix, this.x / this.blockSize, this.y / this.blockSize);
        this.clearRows(blockMap);
        this.reset();
        this.gameOver();
      }
    }

    this.image.context.clearRect(0, 0, this.image.width, this.image.height); //前のブロック領域を削除
    this.paintMatrix(this.matrix, this.color); //毎フレームごとにブロックを描画

  },
  paintMatrix:function(matrix, color){ //ブロックを描画
    this.image.context.fillStyle = color;
    this.image.context.strokeStyle = "black";
    for(var y = 0; y < matrix.length; y++){
      for(var x = 0; x < matrix[y].length; x++){
        if(matrix[y][x]){
          this.image.context.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
          this.image.context.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
        }
      }
    }
  },
  check:function(map, block, offsetx, offsety){ //ブロックの衝突判定
    if (offsetx < 0 || offsety < 0 ||
        this.mapHeight < offsety + block.length ||
        this.mapWidth  < offsetx + block[0].length) {
      return false;
    }
    for (var y = 0; y < block.length; y ++) {
      for (var x = 0; x < block[y].length; x ++) {
        if (block[y][x] && map[y + offsety][x + offsetx]) { 
          return false;
        }
      }
    }
    return true;
  },
  rotate:function(block){ //ブロックを回転
    var rotated = [];
    for (var x = 0; x < block[0].length; x++) {
      rotated[x] = [];
      for (var y = 0; y < block.length; y++) {
        rotated[x][block.length - y - 1] = block[y][x];
      }
    }
    return rotated;
  },
  mergeMatrix:function(map, block, offsetx, offsety){ //blockMap配列にblock配列を複製
    for (var y = 0; y < this.mapHeight; y ++) {
      for (var x = 0; x < this.mapWidth; x ++) {
        if (block[y - offsety] && block[y - offsety][x - offsetx]) {
          map[y][x]++;
        }
      }
    }
  },
  clearRows:function(map){ //埋まった行を消去
    for (var y = 0; y < this.mapHeight; y ++) {
      var full = true;
      for (var x = 0; x < this.mapWidth; x ++) {
        if (!map[y][x]) {
          full = false;
        }
      }
      if (full) {
        map.splice(y, 1);
        var newRow = [];
        for (var i = 0; i < this.mapWidth; i ++) {
          newRow[i] = 0;
        }
        map.unshift(newRow);
      }
    }
  },
  gameOver:function(){ //ゲームオーバー判定
    if(this.y == 0 && !this.check(blockMap, this.matrix, this.x / this.blockSize, this.y / this.blockSize)){
      this.paintMatrix(this.matrix, "gray");
      game.end();
    }
    return;
  },
  reset:function(){ //座標を初期化、新しいブロックを再配置
    this.y = 0;
    this.x = this.center;
    this.matrix = BLOCKS[random(BLOCKS.length)];
    this.color = BLOCK_COLORS[random(BLOCK_COLORS.length)];
  }
});

var eSprite = Class.create(Sprite,{
  initialize:function(assets){
    Sprite.call(this,assets.width,assets.height);
    this.image = new Surface(assets.width,assets.height);
    this.matrix = assets.matrix;
    this.color = assets.color;
    this.mapHeight = blockMapSettings.blockMapHeight;
    this.mapWidth = blockMapSettings.blockMapWidth;
    this.speed = assets.blockSize;
    this.blockSize = assets.blockSize;
    this.center = game.width / 4 - this.blockSize;
    this.x = this.center;
    stage.addChild(this);
  },
  onenterframe:function(){

    //上キー:回転処理
    if(game.input.up && this.isBlock(this.matrix)){
      if(this.check(blockMap, this.rotate(this.matrix), this.x / this.blockSize, this.y / this.blockSize)){
        this.matrix = this.rotate(this.matrix);
      }
    }

    //左キー:移動処理
    if(game.input.left && this.isBlock(this.matrix)){
      if(this.check(blockMap, this.matrix, (this.x - this.blockSize) / this.blockSize, this.y / this.blockSize)){
        this.x -= this.speed;
      }
    }

    //右キー:移動処理
    if(game.input.right && this.isBlock(this.matrix)){
      if(this.check(blockMap, this.matrix, (this.x + this.blockSize) / this.blockSize, this.y / this.blockSize)){
        this.x += this.speed;
      }
    }

    //下キー:落下処理
    if(game.input.down && this.isBlock(this.matrix)){
      var y = this.y / this.blockSize;
      while(this.check(blockMap, this.matrix, this.x / this.blockSize, y)){
        y++;
      }
      this.y = y * this.blockSize - this.blockSize;
    }

    //自動落下
    if(this.isBlock(this.matrix) && this.age % game.fps == 0){
      if(this.check(blockMap, this.matrix, this.x / this.blockSize, (this.y + this.blockSize) / this.blockSize)){
        this.y += this.speed;
      } else {
        //blockMap配列にマージしてリセット処理
        this.mergeMatrix(blockMap, this.matrix, this.x / this.blockSize, this.y / this.blockSize);
        this.clearRows(blockMap);
        this.reset();
        this.gameOver();
      }
    }

    this.image.context.clearRect(0, 0, this.image.width, this.image.height); //前のブロック領域を削除
    this.paintMatrix(this.matrix, this.color); //毎フレームごとにブロックを描画
  },
  paintMatrix:function(matrix, color){ //ブロックを描画
    var blockSize = blockSettings.blockSize;
    this.image.context.fillStyle = color;
    this.image.context.strokeStyle = "black";
    for(var y = 0; y < matrix.length; y++){
      for(var x = 0; x < matrix[y].length; x++){
        if(matrix[y][x]){
          this.image.context.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
          this.image.context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
      }
    }
  },
  check:function(map, block, offsetx, offsety){ //ブロックの衝突判定
    if (offsetx < 0 || offsety < 0 ||
        this.mapHeight < offsety + block.length ||
        this.mapWidth  < offsetx + block[0].length) {
      return false;
    }
    for (var y = 0; y < block.length; y ++) {
      for (var x = 0; x < block[y].length; x ++) {
        if (block[y][x] && map[y + offsety][x + offsetx]) { 
          return false;
        }
      }
    }
    return true;
  },
  rotate:function(block){ //ブロックを回転
    var rotated = [];
    for (var x = 0; x < block[0].length; x++) {
      rotated[x] = [];
      for (var y = 0; y < block.length; y++) {
        rotated[x][block.length - y - 1] = block[y][x];
      }
    }
    return rotated;
  },
  mergeMatrix:function(map, block, offsetx, offsety){ //blockMap配列にblock配列を複製
    for (var y = 0; y < this.mapHeight; y ++) {
      for (var x = 0; x < this.mapWidth; x ++) {
        if (block[y - offsety] && block[y - offsety][x - offsetx]) {
          map[y][x]++;
        }
      }
    }
  },
  clearRows:function(map){ //埋まった行を消去
    for (var y = 0; y < this.mapHeight; y ++) {
      var full = true;
      for (var x = 0; x < this.mapWidth; x ++) {
        if (!map[y][x]) {
          full = false;
        }
      }
      if (full) {
        map.splice(y, 1);
        var newRow = [];
        for (var i = 0; i < this.mapWidth; i ++) {
          newRow[i] = 0;
        }
        map.unshift(newRow);
      }
    }
  },
  isBlock:function(block){ //渡された引数がブロック配列かを判定
    if(block != blockMap){
      return true;
    }
    return false;
  },
  gameOver:function(){ //ゲームオーバー判定
    if(this.y == 0 && !this.check(blockMap, this.matrix, this.x / this.blockSize, this.y / this.blockSize)){
      this.paintMatrix(this.matrix, "gray");
      game.end();
    }
    return;
  },
  reset:function(){ //座標を初期化、新しいブロックを再配置
    this.y = 0;
    this.x = this.center;
    this.matrix = BLOCKS[random(BLOCKS.length)];
    this.color = BLOCK_COLORS[random(BLOCK_COLORS.length)];
  }
});

var BorderLine = Class.create(Sprite,{
  initialize:function(width,height){
    Sprite.call(this,width,height);
    this.image = new Surface(width,height);
    this.image.context.strokeRect(0,0,this.width / 2, this.height);
    stage.addChild(this);
  }
});


function initGame(){ //初期化処理
  game = new Core(gsettings.width,gsettings.height);
  game.fps = gsettings.fps;
  stage = game.rootScene;

  //blockMap配列の初期化
  for (var y = 0; y < blockMapSettings.blockMapHeight; y++) {
    blockMap[y] = [];
    for (var x = 0; x < blockMapSettings.blockMapWidth; x++) {
      blockMap[y][x] = 0;
    }
  }
}

function random(size){ //配列の長さに応じて乱数を返す
  return Math.floor(Math.random() * size);
}


window.onload = function(){
  initGame();
  game.onload=function(){
    //ブロック生成
    new Block(blockSettings);
    //ブロックマップを生成
    new BlockMap(blockMapSettings);
    //ボーダーライン生成
    new BorderLine(gsettings.width, gsettings.height);
  };
  game.start();
};
