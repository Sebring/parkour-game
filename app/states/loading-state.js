import STATE_EVENTS from '../constants/state-events'

export class LoadingState extends Phaser.State {
  preload() {
    let loader = this.add.image(this.world.centerX, this.world.centerY, 'loader')
    loader.anchor.set(0.5, 0.5)
    loader.crossOrigin = 'anonymous'
    this.load.setPreloadSprite(loader)
    this.load.crossOrigin = 'anonymous'

    this.load.image('player', 'assets/images/player.png')
    this.load.spritesheet('run', 'assets/sprites/run.png', 96,125)
    this.load.image('background', 'assets/images/background.png')
    this.load.tilemap('example-map', 'assets/maps/example-map.json', null, Phaser.Tilemap.TILED_JSON)
    this.load.tilemap('map1', 'assets/maps/map1.json', null, Phaser.Tilemap.TILED_JSON)

   // this.load.atlas('hero_run', 'assets/sprites/p_run.png', 'assets/sprites/p_run.json')
   // this.load.atlas('sprite', 'assets/sprites/spritesheet.png', 'assets/sprites/sprites.json')
  }

  create() {
    this.time.events.add(50, () => {
      this.game.trigger(STATE_EVENTS.LOADING_COMPLETED)
    });
  }

  update() {

  }

  render() {

  }
}
