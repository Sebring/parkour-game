import { createStore } from 'redux'
import positions from './positionsReducer'

const setupStore = () => {
	console.log('Setting up redux store')
	const store = createStore(positions)

	return store
}

export default setupStore
