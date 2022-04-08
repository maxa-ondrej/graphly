import plot, {PlotStateType} from "./math/plot/database";
import inputs, {InputStateType} from "./input/database";
import {configureStore} from "@reduxjs/toolkit";

/**
 * Redux store
 */
const store = configureStore({
    reducer: {
        plot,
        inputs
    }
});

/**
 * The type of the store state.
 */
export interface StateType {
    plot: PlotStateType,
    inputs: InputStateType,
}

export default store;