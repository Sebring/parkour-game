import GAME from '../constants/game'
import PLAYER from '../constants/player'
import STATE_EVENTS from '../constants/state-events'
import { Player } from '../models/player'
import setupStore from '../replay/setupStore'
import { Replay } from '../replay/replay'
import { Menu} from '../menu/menu'

export class ExampleState extends Phaser.State {
    map = null
    layer = null

    create() {

      // game states
      this.game_state = {
        finishTime: false,
      }

      this.physics.startSystem(Phaser.Physics.ARCADE)
      this.physics.arcade.gravity.y = GAME.GRAVITY

      // tilemap
      this.map = this.add.tilemap('map1')
      this.map.addTilesetImage('background')
      this.map.setCollision([1])
      
      // level
      this.layer = this.map.createLayer('map_layer')
      this.layer.resizeWorld()
      
      // goal
      this.goalGroup = this.game.add.group()
      this.map.createFromObjects('object_layer', 1, 'player', undefined, undefined, undefined,this.goalGroup)
      this.game.physics.enable(this.goalGroup.children[0], Phaser.Physics.ARCADE)
      this.goalGroup.children[0].body.allowGravity = false
      this.goalGroup.children[0].anchor.set(0.5,0.5)

      // input
      this.cursors = this.game.input.keyboard.createCursorKeys()
      this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)

      // player
      this.playerGroup = this.game.add.group()
      this.map.createFromObjects('object_layer', 2, null, undefined, undefined, undefined, this.playerGroup)
      
      let p = this.playerGroup.children[0]
      this.player = new Player(this.game, p.x, p.y)
      // store initial input state
      //this._addInputToStore();

      this.game.physics.arcade.isPaused = true
      this.player.setInputSource(this._inputSourceKeyboard)

      // menu
      this.Menu = new Menu(this.game)
      this.Menu.addMenuItem('Start New', undefined, 100, () => {
        this.startNewGame(true)
      })
      this.Menu.select(0)

      this.jumpButton.onDown.add( () => {
        if (this.Menu.isVisible())
          this.Menu.onAction()
      })

      this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN).onDown.add( () => {
        if (this.Menu.isVisible())
          this.Menu.selectNext()
      })
      this.game.input.keyboard.addKey(Phaser.Keyboard.UP).onDown.add( () => {
        if (this.Menu.isVisible())
          this.Menu.selectPrev()
      })

      // timer
      const bannerText = 'Parkour.io'
      this.countDownText = this.game.add.text(this.world.centerX, 25, bannerText)
      //banner.font = 'Bangers'
      this.countDownText.padding.set(10, 16)
      this.countDownText.fontSize = 32
      this.countDownText.fill = '#000'
      this.countDownText.smoothed = false
      this.countDownText.anchor.setTo(0.5)

      // author and version text
      let author = this.game.add.text(this.world.centerX, this.world.bottom - 30, 
        'v'+GAME.VERSION + ' - Johan Sebring')
      author.fontSize = 16
    }

    _renderStore = () => {
    }

    _resetGame(resetStore = true) {
      this.player.reset()
      this.timer = false
      if (this.ghost)
        this.ghost.destroy()
      this.ghost = false
      if (resetStore) {
        this.store = setupStore()
        this.replay = null
      }
      this.game_state.finishTime = false
    }

    _startGame() {
      this.timer = Date.now()
      this.Menu.hide()
      this.game.physics.arcade.isPaused = false
    }

    startNewGame(startGame = false) {  
      
      // reset game state and replay
      this._resetGame(true)

      // start game?
      startGame && this._startGame()
    }

    startNewRace(startGame = false) {      

      // reset game state
      this._resetGame(false)

      // reset ghost
      this.ghost = new Player(this.game, this.player.x, this.player.y)
      this.ghost.anchor.set(0.5,0.5)
      this.ghost.alpha = 0.5
      this.ghost.body.allowGravity= false

      // replay
      this.replay.reset()
      this.store = setupStore()

      // start game
      startGame && this._startGame()
    }

    _finish() {
      console.log("WIN CONDITION!")
      
      // timer
      let finishTime = Number((Date.now() - this.timer)).toString()
      this.game_state.finishTime = finishTime
      console.log(finishTime/1000  + ' seconds')
      
      // reset player (do this before pause)
      this.player.reset()
      
      if (this.ghost) {
        this._updateGhost()
      }
      
      // save replay
      this.replay = new Replay(this.store.getState())
  
      // menu
      this.Menu.addMenuItem('Race vs Ghost', undefined, undefined, () => {
        this.startNewRace(true)
      })
      
      this.Menu.show()

      // pause
      this.game.physics.arcade.isPaused = true

    }

    _inputSourceKeyboard = () => {
      let i = {up:this.cursors.up.isDown, down:this.cursors.down.isDown, 
            left:this.cursors.left.isDown, right:this.cursors.right.isDown, 
            jump:this.jumpButton.isDown}
      return i
    }

    _updateGhost() {
      
      let a = this.replay.getAction(this.timer, this)
      
      if (!a)
        return
      
      let p = a.position
      if (p)
        this.ghost.body.position = p

      let f = a.frame
      if (f)
        this.ghost.animations.frame = f
      
      let s = a.scaleX
      if (s)
        this.ghost.scale.x = s
    }

    update() {
      if (this.game.physics.arcade.isPaused) {
        return
      }
        
      // player reached goal
      this.physics.arcade.overlap(this.player, this.goalGroup, () => {
        //this.player.setInputSource()
        this._finish()
      })
       // ghost reached goal
      this.physics.arcade.overlap(this.ghost, this.goalGroup, () => {
        return
      })

      let input = this.player.getInput()
      
      // player vs tile
      this.physics.arcade.collide(this.player, this.layer, (player, tile) => {
        player.handlePlatform(tile, input)          
      })

      this.player.handleInput(input)

      this._addReplayState()

      if (this.ghost) {
        this._updateGhost()
      }
    }

    _addReplayState() {
     let position = {}
     position.x = this.player.body.position.x
     position.y = this.player.body.position.y
     let frame = this.player.animations.frame
     let scaleX = this.player.scale.x
     this.store.dispatch(
      { type:'STATE_POSITION', time:Number((Date.now() - this.timer)), 
        position, frame, scaleX})
    }

    render() {
      let timeValue = this.game_state.finishTime? this.game_state.finishTime/1000 : Number((Date.now() - this.timer)/1000).toFixed(2)
        this.countDownText.text = timeValue  + ' s'
    }
}
