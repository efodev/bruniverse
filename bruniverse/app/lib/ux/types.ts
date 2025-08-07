export type State = { [key: string]: any } | undefined;
export type Action = { type: string; payload?: { [key: string]: any } };
export type Reducer = (state: State, action: Action) => State;
