import test from 'node:test'
import assert from 'node:assert/strict'
import {createGame,update,SHIP_Y} from './patrol.js'
const idle = {direction:0,fire:false}
const step = 1/120
test('a hit scores once and sends the last enemy into a new wave', () => {
  const game = createGame()
  game.foes = [game.foes[0]]
  const target = game.foes[0]
  game.shots = [{x:target.x,y:target.y}]
  assert.deepEqual(update(game,idle,step),['hit','wave'])
  assert.equal(game.score,560)
  for(let i=0;i<164;i++) update(game,idle,step,()=>0)
  assert.equal(game.wave,2)
  assert.equal(game.foes.length,28)
  assert.equal(game.score,560)
})
test('damage grants temporary invulnerability and the third hit ends play', () => {
  const game = createGame()
  const placeShot = () => {game.enemyShots.push({x:game.ship.x,y:SHIP_Y,vx:0})}
  placeShot()
  assert.deepEqual(update(game,idle,step),['damage'])
  assert.equal(game.lives,2)
  placeShot()
  assert.deepEqual(update(game,idle,step),[])
  assert.equal(game.lives,2)
  for(let life=1;life>=0;life--) {
    game.shield = 0
    placeShot()
    update(game,idle,step)
    assert.equal(game.lives,life)
  }
  assert.equal(game.over,true)
  assert.deepEqual(update(game,{direction:1,fire:true},step),[])
})
