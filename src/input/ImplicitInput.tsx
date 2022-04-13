import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {modify, selectDatum} from "./database";
import {Node} from "../math/node";
import FunctionInput from "./FunctionInput";
import {FunctionPlotDatum} from "function-plot/dist/types";

/**
 * Input element for Implicit functions (where y cannot be separated).
 *
 * @param id the id of the input
 * @param save saves the input and updates plot
 * @constructor
 */
export default function ImplicitInput({id, save}: { id: number, save: (datum: FunctionPlotDatum) => void }) {
    const dispatch = useDispatch();
    const value = useSelector(selectDatum(id))?.raw[0] ?? '';

    const updateData = (node: Node | undefined, raw: string) => {
        if (node === undefined) {
            return;
        }
        const datum: FunctionPlotDatum = {
            fn: node.format(null),
            fnType: "implicit",
        };
        dispatch(modify({
            id,
            datum: {
                datum,
                importantYs: [0, 0, 0],
                raw: [raw],
                fancy: `${node.toTex()} = 0`
            }
        }));
        save(datum);
    }

    return <FunctionInput valueSelector={() => value} title='f(x, y) = ' placeholder='Předpis funkce'
                          saveValue={updateData} allowedVars={2}/>;
}