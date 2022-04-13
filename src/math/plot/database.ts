import {createSlice, Draft, PayloadAction, SliceCaseReducers} from '@reduxjs/toolkit'
import {StateType} from "../../store";
import {FunctionPlotDatum} from "function-plot/dist/types";

/**
 * The type of the state of database for saving plot recipes.
 */
export interface PlotStateType {
    recipes: RecipeWithId[],
}

/**
 * First number is the value and second is the weight.
 */
export type WeightedValue = [number, number];

/**
 * The recipe saved with a given id.
 */
export interface RecipeWithId {
    readonly id: number,
    datum: FunctionPlotDatum | null,
    importantYs: [number, number, number]
}

/**
 * Creates the redux database slice for saving plot recipes.
 */
export const plotsSlice = createSlice<PlotStateType, SliceCaseReducers<PlotStateType>>({
    name: 'plot',
    initialState: {
        recipes: [],
    },
    reducers: {
        modify: (state, {payload}: PayloadAction<RecipeWithId>) => {
            state.recipes = [
                ...state.recipes.filter(recipe => recipe.id !== payload.id),
                payload
            ].sort((a, b) => a.id - b.id);
        },
        remove: (state, {payload}: PayloadAction<number>) => {
            state.recipes = state.recipes.filter(recipe => recipe.id !== payload);
        },
    },
})

/**
 * Select all recipes data that are not null.
 *
 * @param state
 */
export const selectAllData = (state: Draft<StateType>): FunctionPlotDatum[] => {
    return state.plot.recipes
        .filter((recipe) => recipe.datum !== null)
        .map(recipe => Object.assign({}, recipe.datum));
}

/**
 * Select min and max values of all graphs.
 *
 * @param state
 */
export const selectMinAndMax = (state: Draft<StateType>): [number, number] => {
    const recipes = state.plot.recipes.filter((recipe) => recipe.datum !== null);
    if (recipes.length === 0) {
        return [-10, 10];
    }

    const important: number[] = [];
    recipes.forEach((recipe) => important.push(...recipe.importantYs));
    const min = Math.min(...important);
    const max = Math.max(...important);
    console.log(min, max)
    if (min === 0 && max === 0) {
        return [-10, 10];
    }
    if (min === max) {
        return [min / 1.3, min * 1.3];
    }
    if (min === 0) {
        return [-max * 0.3, max * 1.3];
    }
    if (max === 0) {
        return [min * 1.3, -min * 0.3];
    }

    return [min * 1.3, max * 1.3];
}

/**
 * Updates the given plot recipe.
 *
 * @param recipe
 */
export const modify = (recipe: RecipeWithId): PayloadAction<RecipeWithId> => plotsSlice.actions.modify(recipe);

/**
 * Removes a plot by the given id.
 *
 * @param id
 */
export const remove = (id: number): PayloadAction<number> => plotsSlice.actions.remove(id);

/**
 * The generated reducer for plots database.
 */
export default plotsSlice.reducer
