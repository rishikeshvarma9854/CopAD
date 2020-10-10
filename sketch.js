var trex, trexrunning;
var ground, groundimage;
var invisibleground;
var cloudimage,cloudGroup;
var obs1,obs2,obs3,obs4,obs5,obs6,obstacleGroup;
var PLAY = 1;
var END = 0;
var gameState = PLAY;
var trexcollided;
var score = 0;
var gameover;
var restart;
var HI = 0;
var jump;
var die;
var checkpoint;

function preload(){
  trexrunning = loadAnimation("trex1.png","trex3.png","trex4.png");
  groundimage = loadImage ("ground2.png");
  cloudimage = loadImage ("cloud.png");
  obs1 = loadImage ("obstacle1.png");
  obs2 = loadImage ("obstacle2.png");
  obs3 = loadImage ("obstacle3.png");
  obs4 = loadImage ("obstacle4.png");
  obs5 = loadImage ("obstacle5.png");
  obs6 = loadImage ("obstacle6.png");
  trexcollided = loadAnimation ("trex_collided.png");
  gameoverimg = loadImage("gameOver.png");
  restartimg = loadImage("restart.png");
  jump = loadSound("jump.mp3");
  die = loadSound("die.mp3");
  checkpoint = loadSound("checkPoint.mp3");
}

function setup(){
  createCanvas(600,200);
  trex = createSprite(50,180,20,40);
  trex.addAnimation("trex",trexrunning);
  trex.addAnimation("trexcollided",trexcollided);
  trex.scale = 0.5;
  ground = createSprite(300,180,600,10);
  ground.addImage("ground",groundimage);
  ground.x = ground.width/2;
  invisibleground = createSprite(300,185,600,5);
  invisibleground.visible = false;
  cloudGroup = new Group ();
  obstacleGroup = new Group ();
  gameover = createSprite(300,100,20,20);
  restart = createSprite(300,150,20,20);
  gameover.addImage("gameOver",gameoverimg);
  gameover.scale = 0.5;
  restart.addImage("restart",restartimg);
  restart.scale = 0.5;
  
}

function draw(){
  background(180);
  text("score : " + score,500,40);
  text("HI : " + HI,420,40);
  if (gameState === PLAY) {
    score = score + Math.round(getFrameRate()/60);
    gameover.visible = false;
    restart.visible = false;
    
  ground.velocityX = -4;
  if(ground.x<0) {
    ground.x = ground.width/2;
  
  }
 
    if (score>0 && score%100 === 0){
      checkpoint.play();
    }
  //jump when the space key is pressed
  if(keyDown("space") && trex.y >= 159){
    trex.velocityY = -10 ;
    jump.play();
    
  }
  
  //add gravity
  trex.velocityY = trex.velocityY + 0.8;
  spawnclouds();
  spawnobstacles();
    if(obstacleGroup.isTouching(trex)){
       gameState = END;
      die.play();
    }
    
  }
  else if(gameState === END) {
    ground.velocityX = 0;
    gameover.visible = true;
    restart.visible = true;
    trex.velocityY = 0;
    trex.changeAnimation("trexcollided",trexcollided);
    obstacleGroup.setVelocityXEach(0);
    cloudGroup.setVelocityXEach(0);
    obstacleGroup.setLifetimeEach(-1);
    cloudGroup.setLifetimeEach(-1);
  }
  trex.collide(invisibleground);
  
  if (mousePressedOver(restart)) {
    reset();
  }
 
  drawSprites();
}
function spawnclouds () {
  if (World.frameCount % 60 === 0) {
    var cloud = createSprite(600,120,40,10);
    cloud.y = random(70,120);
    cloud.addImage("cloud",cloudimage);
    cloud.scale = 0.5;
    cloud.velocityX = -3;
    
     //assign lifetime to the variable
    cloud.lifetime = 200;
    
    //adjust the depth
    cloud.depth = trex.depth;
    trex.depth = trex.depth + 1;
    
    //add each cloud to the group
    cloudGroup.add(cloud);
  }
}
function spawnobstacles () {
  if (World.frameCount % 60 === 0) {
    var obstacle = createSprite(600,165,10,10);
    obstacle.velocityX = -6;
    var rand = Math.round(random(1,6) );
    switch (rand) {
      case 1 : obstacle.addImage(obs1);
        break;
      case 2 : obstacle.addImage(obs2);
        break;
      case 3 : obstacle.addImage(obs3);
        break;
      case 4 : obstacle.addImage(obs4);
        break;
      case 5 : obstacle.addImage(obs5);
        break;
      case 6 : obstacle.addImage(obs6);
        break;
      default: break;
    }
    
    obstacle.scale = 0.5;
    obstacle.lifetime = 100;
    obstacleGroup.add(obstacle);
    
  }
    }
function reset() {
  gameState = PLAY;
  obstacleGroup.destroyEach();
  cloudGroup.destroyEach();
  gameover.visible = false;
  restart.visible = false;
  trex.changeAnimation("trex",trexrunning);
  if(HI < score) {
    HI = score;
  }
  score = 0;
}