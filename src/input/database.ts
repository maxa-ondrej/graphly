import {createSlice, Draft, PayloadAction, SliceCaseReducers} from '@reduxjs/toolkit'
import {StateType} from "../store";
import {FunctionPlotDatum} from "function-plot/dist/types";

export interface InputStateType {
    counter: number,
    selected: number,
    data: ParsedData[],
}

export interface ParsedData {
    readonly id: number,
    datum: Data | null
}

export interface Data {
    datum: FunctionPlotDatum,
    raw: string,
    fancy: string
}

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

export const selectLastId = () => (state: Draft<StateType>) => state.inputs.counter

export const isSelected = (id: number) => (state: Draft<StateType>): boolean => state.inputs.selected === id

export const selectDatum = (id: number) => (state: Draft<StateType>): Data|null => {
    let datum = state.inputs.data.find(datum => datum.id === id);
    if (datum === null || datum === undefined) {
        return null;
    }

    return datum.datum;
}

export const selectIds = () => (state: Draft<StateType>): number[] => {
    return state.inputs.data.map(datum => datum.id);
}

export const create = () => inputsSlice.actions.create(null);

export const modify = (recipe: ParsedData) => inputsSlice.actions.modify(recipe);

export const remove = (id: number) => inputsSlice.actions.remove(id);

export const select = (id: number) => inputsSlice.actions.select(id);

export const deselect = () => inputsSlice.actions.deselect(null);

export default inputsSlice.reducer
