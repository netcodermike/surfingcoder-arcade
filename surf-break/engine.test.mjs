import test from 'node:test';
import assert from 'node:assert/strict';
import {COLS,ROWS,makeMaze,distances,createGame,start,steer,pause,tick,neighbor,position,key} from './engine.mjs';

test('three-second countdown holds the board still, ticks twice, then sounds one horn',()=>{
  const g=createGame();start(g,3);const player=JSON.stringify(g.player),events=[];
  assert.equal(g.state,'countdown');
  for(let i=0;i<359;i++)events.push(...tick(g,1/120));
  assert.equal(g.state,'countdown');assert.equal(g.score,0);assert.equal(g.time,0);assert.equal(JSON.stringify(g.player),player);
  events.push(...tick(g,1/120));assert.equal(g.state,'playing');assert.equal(events.filter(e=>e==='horn').length,1);assert.equal(events.filter(e=>e==='countdown').length,2);
  assert(!tick(g,1/120).includes('horn'));
});
test('pausing a countdown freezes it and resumes the remaining time',()=>{
  const g=createGame();start(g,3);for(let i=0;i<120;i++)tick(g,1/120);
  pause(g);const remaining=g.countdownRemaining;for(let i=0;i<500;i++)tick(g,1/120);assert.equal(g.countdownRemaining,remaining);
  pause(g);assert.equal(g.state,'countdown');tick(g,.04);assert(g.countdownRemaining<remaining);
});
test('surfer waits for a direction after the countdown and each respawn',()=>{
  const g=createGame();start(g,3);g.enemies=[];
  for(let i=0;i<1800;i++)tick(g,1/120);
  assert.equal(g.state,'playing');assert.deepEqual(position(g.player),{x:11,y:23});assert.equal(g.score,0);assert.equal(g.player.dir,null);
  steer(g,'left');tick(g,.05);assert(position(g.player).x<11);
  g.state='wipeout';g.wipeout=.01;tick(g,.02);
  g.enemies=[];for(let i=0;i<600;i++)tick(g,1/120);
  assert.deepEqual(position(g.player),{x:11,y:23});assert.equal(g.queued,null);assert.equal(g.player.dir,null);
  steer(g,'right');tick(g,.05);assert(position(g.player).x>11);
});

test('40 different breaks have reachable collectibles and intact boundaries',()=>{
  const seen=new Set();
  for(let level=1;level<=40;level++){
    const grid=makeMaze(level),reachable=distances(grid,{x:11,y:23});
    const walkable=grid.flat().filter(v=>!v).length;
    assert.equal(reachable.size,walkable,`disconnected maze ${level}`);
    for(const [x,y] of [[1,1],[21,1],[1,23],[21,23],[11,11],[1,21],[21,21]])assert.equal(grid[y][x],0);
    for(let x=0;x<COLS;x++){assert.equal(grid[0][x],1);assert.equal(grid[ROWS-1][x],1);}
    for(let y=0;y<ROWS;y++)if(y!==11){assert.equal(grid[y][0],1);assert.equal(grid[y][COLS-1],1);}
    seen.add(JSON.stringify(grid));
  }
  assert.equal(seen.size,40);
});
test('pause freezes game state and movement respects walls',()=>{
  const g=createGame();start(g);g.enemies=[];
  for(let i=0;i<600;i++){if(i%17===0)steer(g,['up','down','left','right'][i%4]);tick(g,1/120);assert.equal(g.grid[g.player.y][g.player.x],0);}
  pause(g);const before=JSON.stringify(g);tick(g,.04);assert.equal(JSON.stringify(g),before);pause(g);assert.equal(g.state,'playing');
});
test('reversing midway preserves position and reverses travel',()=>{
  const g=createGame();start(g);g.enemies=[];steer(g,'left');tick(g,.05);
  assert(g.player.to);const before=position(g.player);steer(g,'right');assert.deepEqual(position(g.player),before);tick(g,.02);assert(position(g.player).x>before.x);
});
test('side channel wraps both directions',()=>{
  const g=createGame();assert.equal(neighbor(g.grid,0,11,'left').x,COLS-1);assert.equal(neighbor(g.grid,COLS-1,11,'right').x,0);
  start(g);g.enemies=[];Object.assign(g.player,{x:0,y:11,to:null,progress:0,dir:'left'});steer(g,'left');
  for(let i=0;i<24;i++)tick(g,1/120);
  assert.equal(g.player.x,COLS-1);
});
test('power allows catching enemies, collision without power costs one board',()=>{
  const g=createGame();start(g);g.queued='up';g.safe=0;g.power=5;
  const e=g.enemies[0];Object.assign(e,{x:g.player.x,y:g.player.y,to:null,progress:0,rest:0});g.enemies=[e];
  tick(g,1/120);assert.equal(g.score,200);assert(e.rest>0);assert.equal(g.lives,3);
  g.power=0;g.safe=0;Object.assign(e,{x:g.player.x,y:g.player.y,to:null,progress:0,rest:0});tick(g,1/120);assert.equal(g.lives,2);assert.equal(g.state,'wipeout');
  for(let i=0;i<200;i++)tick(g,1/120);assert.equal(g.state,'playing');assert(g.safe>0);
  g.lives=1;g.safe=0;Object.assign(g.player,{x:11,y:23,to:null,progress:0});Object.assign(e,{x:11,y:23,to:null,progress:0,rest:0});g.enemies=[e];tick(g,1/120);assert.equal(g.lives,0);
  for(let i=0;i<200;i++)tick(g,1/120);assert.equal(g.state,'over');
});
test('a complete simulated ride collects every item and unlocks the next break',()=>{
  const g=createGame();start(g);g.enemies=[];let iterations=0;
  while(g.state==='playing'&&iterations++<150000){
    if(!g.player.to){
      const target=[...g.powers,...g.pearls][0];if(target){const [x,y]=target.split(',').map(Number),field=distances(g.grid,{x,y});let dir=null,best=Infinity;
        for(const d of ['left','right','up','down']){const n=neighbor(g.grid,g.player.x,g.player.y,d);if(n){const dist=field.get(key(n.x,n.y));if(dist<best){dir=d;best=dist;}}}steer(g,dir);
      }
    }
    // Match the movement quantum to whole cells, so the test can choose at each crossing.
    const remaining=g.player.to?(1-g.player.progress)/5.2:1/5.2;
    tick(g,Math.min(.025,remaining));
  }
  assert.equal(g.state,'cleared',`did not clear in ${iterations} steps; ${g.pearls.size} left`);assert.equal(g.pearls.size+g.powers.size,0);assert(g.score>g.total*10);
  for(let i=0;i<250;i++)tick(g,1/120);assert.equal(g.level,2);assert.equal(g.state,'ready');assert(g.pearls.size>100);
});

test('respawn waits for the wipeout audio, while the final life keeps its original timing',()=>{
  const g=createGame();g.state='wipeout';g.lives=2;g.wipeout=1.5;g.wipeoutAudioPending=true;
  const actors=JSON.stringify([g.player,g.enemies]);
  for(let i=0;i<1200;i++)tick(g,1/120);
  assert.equal(g.state,'wipeout');assert.equal(g.wipeout,0);assert.equal(g.time,0);assert.equal(JSON.stringify([g.player,g.enemies]),actors);
  g.wipeoutAudioPending=false;tick(g,1/120);assert.equal(g.state,'playing');assert.equal(g.player.dir,null);
  g.state='wipeout';g.lives=0;g.wipeout=1.5;g.wipeoutAudioPending=true;
  for(let i=0;i<181;i++)tick(g,1/120);
  assert.equal(g.state,'over');
});
