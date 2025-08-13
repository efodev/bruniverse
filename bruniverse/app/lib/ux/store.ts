/**
 * A simple implementation of a Redux-like store from scratch.
 * @param {function} reducer The reducer function that returns the next state tree.
 * @param {object} [preloadedState] The initial state.
 * @returns {object} The store object with methods: getState, dispatch, subscribe.
 */
import { State, Reducer, Action } from "./types";
function createStore(reducer: Reducer, preloadedState: State) {
	// The current state of our application.
	// We use the reducer to get the initial state if preloadedState is not provided.
	let state = preloadedState || reducer(undefined, { type: "@@INIT" });

	// An array to hold all the functions that want to be notified of state changes.
	const listeners: Function[] = [];

	// --- Core Store Methods ---

	/**
	 * Returns the current state of the store.
	 * This is the "getState" method.
	 * @returns {object} The current state.
	 */
	function getState() {
		return state;
	}

	/**
	 * Dispatches an action to the store.
	 * This is the "dispatch" method, the only way to change the state.
	 * @param {object} action The action to dispatch.
	 */
	function dispatch(action: Action) {
		// 1. Call the reducer with the current state and the action to get the next state.
		const nextState = reducer(state, action);

		// 2. If the state has actually changed, update it.
		if (nextState !== state) {
			state = nextState;

			// 3. Notify all subscribed listeners of the change.
			listeners.forEach((listener) => listener());
		}
	}

	/**
	 * Subscribes a listener function to be called whenever the state changes.
	 * This is the "subscribe" method.
	 * @param {function} listener The function to call on state changes.
	 * @returns {function} An unsubscribe function to remove the listener.
	 */
	function subscribe(listener: Function) {
		// Add the listener to our list.
		listeners.push(listener);

		// Return a function to unsubscribe.
		// This is a common and useful pattern in Redux.
		return function unsubscribe() {
			const index = listeners.indexOf(listener);
			if (index !== -1) {
				listeners.splice(index, 1);
			}
		};
	}

	// Return the public interface of our store.
	return {
		getState,
		dispatch,
		subscribe,
	};
}

// --- Example Usage ---

// 1. Define the reducer function
// const initialState = { count: 0 };

// function counterReducer(state = initialState, action) {
// 	switch (action.type) {
// 		case "INCREMENT":
// 			return { ...state, count: state.count + 1 };
// 		case "DECREMENT":
// 			return { ...state, count: state.count - 1 };
// 		default:
// 			return state;
// 	}
// }

// // 2. Create the store using our createStore function
// const store = createStore(counterReducer);

// // 3. Subscribe to state changes
// const unsubscribe = store.subscribe(() => {
// 	console.log("State updated:", store.getState());
// });

// // 4. Dispatch some actions
// console.log("Initial state:", store.getState()); // Initial state: { count: 0 }

// store.dispatch({ type: "INCREMENT" }); // Output: State updated: { count: 1 }
// store.dispatch({ type: "INCREMENT" }); // Output: State updated: { count: 2 }
// store.dispatch({ type: "DECREMENT" }); // Output: State updated: { count: 1 }

// // 5. Unsubscribe from the store
// unsubscribe();

// // 6. Dispatch an action after unsubscribing
// // The listener function will no longer be called.
// console.log("Dispatching after unsubscribe...");
// store.dispatch({ type: "INCREMENT" });
// // Output: Dispatching after unsubscribe...
// // (No more "State updated" log)

// console.log("Final state:", store.getState()); // Final state: { count: 2 }
