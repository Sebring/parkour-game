import STATE_EVENTS from '../constants/state-events'

export class LoadingState extends Phaser.State {
  preload() {
    let loader = this.add.image(this.world.centerX, this.world.centerY, 'loader')
    loader.anchor.set(0.5, 0.5)
    this.load.setPreloadSprite(loader)

    this.load.image('player', 'assets/images/player.png')
    this.load.spritesheet('p_run', 'assets/sprites/stickman_run.png', 100,150)
    this.load.image('background', 'assets/images/background.png')
    this.load.tilemap('example-map', 'assets/maps/example-map.json', null, Phaser.Tilemap.TILED_JSON)
  }

  create() {
    this.time.events.add(500, () => {
      this.game.trigger(STATE_EVENTS.LOADING_COMPLETED)
    });
  }

  update() {

  }

  render() {

  }
}
