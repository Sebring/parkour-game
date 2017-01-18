import GAME from '../constants/game'

export class Replay {

	constructor(actions) {
		this.store = actions
		this.noInput = GAME.NO_INPUT
		this.reset()
	}

	reset(actions = this.store) {
		this.actions = actions
		this.timeSlip = false
		this.prevAction = undefined
	}

	getAction(time, state) {
		let action = this.actions[0]

		// no more actions
		if (action === undefined) {
			return null
		}

		// skip action without time
		if (isNaN(action.time)) {
			this.actions.shift()
			return this.getAction(time)
		}
		
		// replay is always behind, this will push replay forward in time
		let timeDelta = Number((Date.now() - time))
		// add timesplip to compensate playback
		if (!this.timeSlip && action.time < timeDelta) {
			// adjust timeslip - once
			this.timeSlip = timeDelta - action.time
			//console.log('R/adjust timeslip', this.timeSlip)
		}

		// compare time with event.time
		timeDelta = action.time - timeDelta+this.timeSlip
		if (timeDelta < 0) {
			this.prevAction = action
			this.actions.shift()			
			return action

		} else {
			if (this.prevAction !== undefined) {
				return this.prevAction

			} else {
				//console.log('R/none', this.action, this.prevAction)
				return null
			}
		}
	}
}
