let obss;
let showAll;
let bg;
let player;

function setup(){
	createCanvas(windowWidth, windowHeight);
	bg = createGraphics(windowWidth, windowHeight);
	bg.background(51);
	//background(bg);
	image(bg, 0, 0);
	obss = [
		{
			x: 1,
			y: 1,
			r: .2,
			type: '45'
		}
    ]
    player = new Player(0, 0, HALF_PI, 0);
}


function draw(){
    if(keyIsPressed){
        if(key == 'w'){
            player.pos.add(p5.Vector.fromAngle(player.dir).mult(0.15));
        }
        if(key == 's'){
            player.pos.add(p5.Vector.fromAngle(player.dir).mult(-0.15));
        }
        if(key == 'd'){
            player.dir += 0.02;
        }
        if(key == 'a'){
            player.dir -= 0.02;
        }
    }
    background(51);
    // -- ground -- ceiling --
    noStroke();
    fill(255, 10);
    for(let i = 0 ; i < 10 ; i ++){
        rect(0, height/20*i, width, height/20*i);
    }
    // -- player rendering --
    player.render(obss, 256);
}

function showObss(){
	fill(0);
	stroke(0);
	strokeWeight(2);
	rectMode(CENTER);
	for(let obs of obss){
		if(obs.type == 'rect'){
			rect(obs.x, obs.y, obs.r*2, obs.r*2);
		}else{
			circle(obs.x, obs.y, obs.r);
		}
	}
}


class Player{
    constructor(x, y, fov, dir){
        this.pos = createVector(x, y);
        this.fov = fov;
        this.dir = dir;
    }

    dists(obstacles, res){
        let dists = [];
        for(let i = 0; i < res; i++){
            let ray = new Ray(this.pos.x, this.pos.y, this.dir-(this.fov/2)+(this.fov*(i/res)), 0.01, obstacles);
            ray.steps(obstacles);
            dists[i] = p5.Vector.dist(ray.start, ray.pos);
        }
        return dists;
    }

    render(obstacles, res){
        let dists = this.dists(obstacles, res);
        for(let i = 0; i < res; i++){
            let xx = i/res*(width-1);
            let h = 1/dists[i]*(height/2);
            let br = 1/(dists[i])*255;
            fill(br);
            noStroke();
            rect(xx, height/2-h*2, (width-1)/res, h*3);
        }
    }
}

function Vnorm(vec){
	if(vec instanceof p5.Vector){
		return vec.mag();
	}else{
		return vec;
	}
}
function Vabs(vec){
	return createVector(abs(vec.x), abs(vec.y), abs(vec.z));
}
function Vmod(vec, toMod){
	return createVector(vec.x%toMod, vec.y%toMod, vec.z%toMod);
}
function Vmax(vec, num){
	if(vec.mag() > num){
		return vec;
	}else{
		return num;
	}
}
function Vmin(vec, num){
	if(vec.mag() < num){
		return vec;
	}else{
		return num;
	}
}
function vmax(v) {
	return max(max(v.x, v.y), v.z);
}
function circleDist(VcameraPos, VobjPos, Fobjr){
	return(Vmod(VcameraPos, 2).copy().sub(VobjPos).mag()-Fobjr);
}
function rectDist(p, b, Fobjr){
	let d = Vabs(p).copy().sub(b);
	return Vnorm(Vmax(d, createVector())) + vmax(Vmin(d, createVector()));
}
class Ray{
	constructor(x, y, dir, min, obstacles){
	  this.start = createVector(x, y);
	  this.pos = createVector(x, y);
	  this.vel = p5.Vector.fromAngle(dir);
	  this.dir = dir;
	  this.min = min;
	  this.done = {
		is: false,
		dist: 0,
		nOfIters: 0,
		pos: 0
	  };
  
  
	  this.currnet = {
		pos: this.pos.copy(),
		r: 10000
	  }
	  this.count = 0;
	}
  
	step(obstacles){
	  let minDist = width*2;
	  for(let obs of obstacles){
		let opos = createVector(obs.x, obs.y);
		let d;
		if(obs.type == 'rect'){
			d = rectDist(this.pos, opos, obs.r);
		}else{
			d = circleDist(this.pos, opos, obs.r);
		}
		if(d <= minDist){
		  minDist = d;
		}
	  }
	  if(minDist <= this.min || this.done.is){
		this.done.is = true;
		this.done.dist = p5.Vector.dist(this.pos, this.start);
		this.done.nOfIters = this.count;
		this.done.pos = this.pos.copy();
	  }else{
		this.currnet = {
		  pos: this.pos.copy(),
		  r: minDist
		}
		this.pos.add(this.vel.copy().mult(minDist));
	  }
	}
  
	show(){
	  noFill();
	  stroke(255);
	  strokeWeight(1);
	  circle(this.currnet.pos.x, this.currnet.pos.y, this.currnet.r);
	  stroke(255, 180);
	  line(this.pos.x, this.pos.y, this.start.x, this.start.y);
	}
  
	steps(obstacles, doShow=false){
	  for(let i = 0; i < 100; i++){
		this.step(obstacles);
		if(doShow){
		  this.show();
		}
		this.count++;
		if(this.done.is){
		  // stroke(map(this.done.nOfIters, 0, 50, 255, 51));
		  bg.stroke(0, 255, 0);
		  bg.strokeWeight(4);
		  bg.point(this.done.pos.x, this.done.pos.y);
		  break;
		}
	  }
	//   strokeWeight(1);
	//   stroke(255, 50);
	//   line(this.pos.x, this.pos.y, this.start.x, this.start.y);
	}
  }
  