import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('./app.mjs',import.meta.url),'utf8');
const classSource=source.slice(source.indexOf('class SurfAudio'),source.indexOf('const audio=new SurfAudio'));
function rig(){
  const context=vm.createContext({muted:false});
  const Audio=vm.runInContext(classSource+'\nSurfAudio',context);
  const sound=new Audio(),nodes=[];
  const param=()=>({setValueAtTime(){},setTargetAtTime(){},linearRampToValueAtTime(){},cancelScheduledValues(){}});
  sound.ctx={currentTime:0,state:'running',createBufferSource(){const node={connect(){},start(...args){this.started=args;},stop(time){this.stopped=time;}};nodes.push(node);return node;},createGain(){return {gain:param(),connect(){}};}};
  sound.master={};sound.musicBuffer={duration:8};
  return {sound,context,nodes};
}
test('swell music loops once, resumes its position after pause, and restarts for a fresh power-up',()=>{
  const {sound,nodes}=rig();sound.syncSwell(false,true);assert.equal(nodes.length,0);
  sound.syncSwell(true,true);assert.equal(nodes.length,1);assert.equal(nodes[0].loop,true);
  for(let i=0;i<120;i++)sound.syncSwell(true,true);assert.equal(nodes.length,1);
  sound.ctx.currentTime=2.5;sound.syncSwell(true,false);assert.equal(sound.musicSource,null);assert.equal(sound.musicOffset,2.5);assert(nodes[0].stopped>2.5);
  sound.ctx.currentTime=12;sound.syncSwell(true,true);assert.equal(nodes.length,2);assert.equal(nodes[1].started[1],2.5);
  sound.syncSwell(false,true);assert.equal(sound.musicOffset,0);assert.equal(sound.musicSource,null);
  sound.syncSwell(true,true);assert.equal(nodes[2].started[1],0);
});
test('muting stops the riff and unmuting resumes without stacking sources',()=>{
  const {sound,context,nodes}=rig();sound.syncSwell(true,true);sound.ctx.currentTime=1;
  context.muted=true;sound.syncSwell(true,true);assert.equal(sound.musicSource,null);assert.equal(sound.musicOffset,1);
  sound.syncSwell(true,true);assert.equal(nodes.length,1);
  context.muted=false;sound.syncSwell(true,true);assert.equal(nodes.length,2);assert.equal(nodes[1].started[1],1);
});

test('wipeout playback resolves only when the full audio source ends',async()=>{
  const {sound,nodes}=rig();sound.wipeoutBuffer={duration:6.5};
  let ended=false;const playback=sound.play('wipeout').then(()=>{ended=true;});
  await Promise.resolve();assert.equal(nodes.length,1);assert.equal(ended,false);
  nodes[0].onended();await playback;assert.equal(ended,true);assert.equal(sound.wipeoutSource,null);
});

test('muted or unavailable wipeout audio does not block a respawn',async()=>{
  const {sound,context,nodes}=rig();context.muted=true;await sound.play('wipeout');assert.equal(nodes.length,0);
  context.muted=false;await sound.play('wipeout');assert.equal(nodes.length,0);
});
