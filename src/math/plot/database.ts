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
 * The recipe saved with a given id.
 */
export interface RecipeWithId {
    readonly id: number,
    datum: FunctionPlotDatum | null
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
        modify: (state, { payload }: PayloadAction<RecipeWithId>) => {
            state.recipes = [
                ...state.recipes.filter(recipe => recipe.id !== payload.id),
                payload
            ].sort((a, b) => a.id - b.id);
        },
        remove: (state, { payload }: PayloadAction<number>) => {
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

export default plotsSlice.reducer
