const W = 32;
const H = 32;

let Map = [];

let p;

function setup(){
	createCanvas(windowWidth, 640);
	background(51);
	rectMode(CENTER);
	setMap();
	noStroke();
	p = new Player();
	//console.log(p.see(Map));
	//p.render(Map);
}

function mouseDragged(){
	if(pmouseX < mouseX){
		p.dir += (pmouseX-mouseX)/(PI*500);
	}else if(pmouseX === mouseX){

	}else{
		p.dir -= (mouseX-pmouseX)/(PI*500);
	}
}

function draw(){
	background(51);
	p.render(Map, 256);
	minimap();
	if(keyIsPressed){
		if(key == 'w'){
			p.pos.add(p5.Vector.fromAngle(p.dir).setMag(0.1));
		}
		if(key == 's'){
			p.pos.add(p5.Vector.fromAngle(p.dir+PI).setMag(0.1));
		}
	}
}

class Player{
	constructor(){
		this.pos = createVector(W/2, H/2);
		this.dir = 0;
		this.fov = HALF_PI;
	}

	render(plane, resolution){
		// -- floor --
		fill(255, 8);
		for(let i = 0; i < 10; i++){
			rect(width/2, height, width, map(i, 0, 10, height, 20));
		}
		// -- objects --
		let dists = this.see(plane, resolution);
		let ww = width/resolution;
		for(let i = 0; i < resolution; i++){
			let d = dists[i];
			let h = 255/(d);
			let b = (height/1.2)/(d**2);
			fill(b);
			rect(i*ww+ww/2, height/2, ww+1, h);
		}
	}

	see(plane, resolution){
		let dists = [];
		let angle = this.fov/resolution;
		for(let i = 0; i < resolution; i++){
			let dir = (this.dir-this.fov/2)+angle*i;
			let colided = false;
			let d = 0;
			let pos = this.pos.copy();
			let attampts = 0;
			while(!colided && attampts < 2000){
				let step = p5.Vector.fromAngle(dir).setMag(0.005);
				pos.add(step);
				if(plane[floor(pos.x)][floor(pos.y)] == 1){
					colided = true;
					d = p5.Vector.dist(pos, this.pos);
					dists.push(d);
				}
				attampts++;
			}
			if(!colided && attampts >= 2000){
				dists.push(100);
			}
		}
		return dists;
	}
}

function minimap(size = 128){
	// stroke(0);
	// strokeWeight(1);
	let scl = size/W;
	for(let y = 0; y < H; y++){
		for(let x = 0; x < H; x++){
			fill(Map[x][y] *255);
			rect(x*scl+scl/2, y*scl+scl/2, scl, scl);
		}
	}
	noStroke();
	fill(0, 255, 0);
	circle(p.pos.x*scl, p.pos.y*scl, scl*0.666);
	stroke(127);
	let x = cos(p.dir)*scl*3;
	let y = sin(p.dir)*scl*3;
	line(p.pos.x*scl, p.pos.y*scl, p.pos.x*scl+(x), p.pos.y*scl+(y));
	noStroke();
}

function setMap(){
	for(let i = 0; i < W; i++){
		Map[i] = [];
		for(let j = 0; j < H; j++){
			if(i === 0 || j === 0 || i === W-1 || j === H-1){
				Map[i][j] = 1
			}else if(random(1) < 0.1){
				Map[i][j] = 1
			}else{
				Map[i][j] = 0;
			}
		}
	}
}