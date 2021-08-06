import * as main from './main.reducer';

export interface AppState {
  main: main.State;
}

export const reducers = {
  main: main.reducer,
};

export const metaReducers = [];
