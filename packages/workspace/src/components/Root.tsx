import React from "react";
import { App } from "./App";
import { Provider } from "react-redux";
import { store } from "../stores/configureStore";

export function Root() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
