import {createSlice, Draft, PayloadAction, SliceCaseReducers} from '@reduxjs/toolkit'
import {StateType} from "../store";
import {FunctionPlotDatum} from "function-plot/dist/types";
import {WeightedValue} from "../math/plot/database";

/**
 * State of the input store.
 */
export interface InputStateType {
    counter: number,
    selected: number,
    data: ParsedData[],
}

/**
 * Contains the important data and a unique id.
 */
export interface ParsedData {
    readonly id: number,
    datum: Data | null
}

/**
 * Data that will be later on used to render the graph.
 */
export interface Data {
    datum: FunctionPlotDatum,
    raw: string,
    fancy: string,
    min: WeightedValue,
    max: WeightedValue
}

/**
 * Creates the redux database slice for saving plot inputs.
 */
export const inputsSlice = createSlice<InputStateType, SliceCaseReducers<InputStateType>>({
    name: 'inputs',
    initialState: {
        counter: 0,
        selected: 0,
        data: [],
    },
    reducers: {
        create: (state) => {
            state.counter += 1;
            state.data.push({
                id: state.counter,
                datum: null
            });
        },
        modify: (state, { payload }: PayloadAction<ParsedData>) => {
            state.data = [
                ...state.data.filter(datum => datum.id !== payload.id),
                payload
            ].sort((a, b) => a.id - b.id);
        },
        remove: (state, { payload }: PayloadAction<number>) => {
            state.data = state.data.filter(datum => datum.id !== payload);
        },
        select: (state, { payload }: PayloadAction<number>) => {
            state.selected = payload;
        },
        deselect: (state) => {
            state.selected = 0;
        },
    },
})

/**
 * Select the last ID added to the database.
 */
export const selectLastId = () => (state: Draft<StateType>) => state.inputs.counter

/**
 * Check if an input is selected.
 *
 * @param id the if of the input
 */
export const isSelected = (id: number) => (state: Draft<StateType>): boolean => state.inputs.selected === id

/**
 * Select graph input datum by the provided ID.
 *
 * @param id the if of the input
 */
export const selectDatum = (id: number) => (state: Draft<StateType>): Data|null => {
    let datum = state.inputs.data.find(datum => datum.id === id);
    if (datum === null || datum === undefined) {
        return null;
    }

    return datum.datum;
}

/**
 * Select all IDs that are present in the database.
 */
export const selectIds = () => (state: Draft<StateType>): number[] => {
    return state.inputs.data.map(datum => datum.id);
}

/**
 * Create a new empty input.
 */
export const create = () => inputsSlice.actions.create(null);

/**
 * Modify an existing input.
 *
 * @param recipe new state of the input
 */
export const modify = (recipe: ParsedData) => inputsSlice.actions.modify(recipe);

/**
 * Remove an existing input.
 *
 * @param id the if of the input
 */
export const remove = (id: number) => inputsSlice.actions.remove(id);

/**
 * Selects (focuses) an input.
 *
 * @param id the if of the input
 */
export const select = (id: number) => inputsSlice.actions.select(id);

/**
 * Deselects (defocuses) all inputs.
 */
export const deselect = () => inputsSlice.actions.deselect(null);

/**
 * The generated reducer for inputs database.
 */
export default inputsSlice.reducer
