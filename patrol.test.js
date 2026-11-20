import test from 'node:test'
import assert from 'node:assert/strict'
import {createGame, startWave, stageName, update, waterline, WIDTH} from './patrol.js'

const idle = [{direction: 0, fire: false}]
const step = 1 / 120
const tick = (game, input = idle) => update(game, input, step, () => 0)
const advance = (game, frames, input) => {
  for (let i = 0; i < frames; i++) tick(game, input)
}

test('a board scores once and clearing the reef advances to the next set', () => {
  const game = createGame()
  const [target] = game.foes
  game.foes = [target]
  game.shots = [{x: target.x, y: target.y, owner: 0, age: 0}]
  assert.deepEqual(tick(game), ['hit', 'wave'])
  assert.equal(game.score, 560)
  assert.equal(game.result, 'Reef cleared')
  advance(game, 200)
  assert.equal(game.wave, 2)
  assert.equal(game.foes.length, 28)
  assert.equal(game.score, 560)
})

test('surfer rides the crest and changes direction and lean after a turn', () => {
  const game = createGame()
  const [surfer] = game.surfers
  advance(game, 15, [{direction: 1}])
  assert.ok(surfer.x > WIDTH / 2)
  assert.equal(surfer.facing, 1)
  assert.ok(surfer.lean > .5)
  assert.equal(surfer.y, waterline(surfer.x, game.oceanTime, surfer.lane))
  advance(game, 15, [{direction: -1}])
  assert.equal(surfer.facing, -1)
  assert.ok(surfer.lean < -.5)
  assert.equal(surfer.y, waterline(surfer.x, game.oceanTime, surfer.lane))
})

test('tandem surfers throw two boards and hold spacing at both edges', () => {
  const game = createGame('tandem')
  const [left, right] = game.surfers
  assert.deepEqual(tick(game, [{direction: 1, fire: true}]), ['throw'])
  assert.deepEqual(game.shots.map(shot => shot.owner), [0, 1])
  const spacing = right.x - left.x
  advance(game, 145, [{direction: 1}])
  assert.equal(right.x, WIDTH - 31)
  assert.equal(right.x - left.x, spacing)
  advance(game, 190, [{direction: -1}])
  assert.equal(left.x, 31)
  assert.equal(right.x - left.x, spacing)
})

test('co-op steering and throws are independent with shared wipeouts', () => {
  const game = createGame('coop')
  const [first, second] = game.surfers
  const before = [first.x, second.x]
  tick(game, [{direction: 1}, {direction: -1, fire: true}])
  assert.ok(first.x > before[0])
  assert.ok(second.x < before[1])
  assert.deepEqual(game.shots.map(shot => shot.owner), [1])
  assert.ok(first.y < second.y)
  game.enemyShots.push({x: second.x, y: second.y, vx: 0})
  assert.ok(tick(game).includes('damage'))
  assert.equal(game.lives, 2)
})

test('three hits end play and a shield prevents immediate damage', () => {
  const game = createGame()
  const placeShot = () => game.enemyShots.push({...game.surfers[0], vx: 0})
  placeShot()
  assert.deepEqual(tick(game), ['damage'])
  assert.equal(game.lives, 2)
  placeShot()
  assert.deepEqual(tick(game), [])
  assert.equal(game.lives, 2)
  for (const lives of [1, 0]) {
    game.shield = 0
    placeShot()
    tick(game)
    assert.equal(game.lives, lives)
  }
  assert.equal(game.over, true)
  assert.deepEqual(tick(game, [{direction: 1, fire: true}]), [])
})

test('every third set alternates bonus patterns and missed shells expire safely', () => {
  const game = createGame()
  game.wave = 3
  startWave(game)
  assert.equal(game.stage, 'bonus')
  assert.equal(stageName(game.wave), 'Shell Run')
  assert.equal(stageName(6), 'Glass Barrel')
  assert.equal(stageName(9), 'Shell Run')
  advance(game, 1480)
  assert.equal(game.lives, 3)
  assert.equal(game.enemyShots.length, 0)
  assert.equal(game.result, '0 of 21 shells')
  advance(game, 190)
  assert.equal(game.wave, 4)
  assert.equal(game.stage, 'reef')
})

test('the last catch of a perfect bonus set grants the extra points once', () => {
  const game = createGame('tandem')
  game.wave = 6
  startWave(game)
  game.shells = 20
  const target = game.foes[0]
  game.foes = [target]
  game.clock = 2
  game.shots = [{x: 240, y: 120, owner: 0, age: 0}]
  assert.deepEqual(tick(game), ['shell', 'wave'])
  assert.equal(game.shells, 21)
  assert.equal(game.score, 2250)
  advance(game, 60)
  assert.equal(game.score, 2250)
  assert.equal(game.lives, 3)
})
