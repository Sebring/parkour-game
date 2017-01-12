import GAME from '../constants/game'
import PLAYER from '../constants/player'
import STATE_EVENTS from '../constants/state-events'
import { Player } from '../models/player'

export class AnimationState extends Phaser.State {
  map = null
  layer = null

  create() {
	  this.physics.startSystem(Phaser.Physics.ARCADE)
	  this.physics.arcade.gravity.y = GAME.GRAVITY

    // stickman
    this.stickman = this.game.add.sprite(100,150,'p_run')
    this.stickman.animations.add('run')
    this.stickman.animations.play('run', 10, true)
    this.stickman.scale.set(0.5,0.5)
	}

	update() {}

	render() {}
}