import GAME from '../constants/game'

export class Replay {

	constructor(actions) {
		console.log(actions)
		this.timeSlip = false
		this.actions = actions
		this.lastAction = undefined
		this.noInput = GAME.NO_INPUT
	}

	setActions(actions) {
		console.log(actions)
	}

	getInput(time, state) {
		let action = this.actions[0]
		
		// first case scenario
		if (isNaN(action.time)) {
			console.log('start')
			this.actions.shift()
			return this.getInput(time)
		}

		let timeDelta = Number((Date.now() - time))

		// todo - last finsh state
		if (action.input === undefined) {
			return this.lastAction.input
		}

		// add timesplip to compensate playback
		if (!this.timeSlip && action.time < timeDelta) {
			// adjust timeslip - once
			this.timeSlip = timeDelta - action.time
			console.log('adjust timeslip', this.timeSlip)

		}

		// compare time with event.time
		timeDelta = action.time - timeDelta+this.timeSlip
		if (timeDelta < 0) {
			console.log(timeDelta, this.timeSlip)
			
			if (timeDelta < -10) {
				//state.repositionPlayer(action.pos)
			}
			
			this.lastAction = action
			this.actions.shift()			
		//	console.log('new', action)
			return action.input

		} else {
			if (this.lastAction !== undefined && this.lastAction.input !== undefined) {
		//		console.log('last', this.lastAction)
				return this.lastAction.input

			} else {
				console.log('none', this.action, this.lastAction)
				return this.noInput

			}
		}
	}
}
