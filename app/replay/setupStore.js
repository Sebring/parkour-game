import { createStore } from 'redux'
import input from './inputReducer'

const setupStore = () => {
	console.log('Setting up redux store')
	const store = createStore(input)

	return store
}

export default setupStore
