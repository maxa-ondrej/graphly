import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {modify, selectDatum} from "./database";
import {Node} from "../math/node";
import FunctionInput from "./FunctionInput";
import {deriveSmart, importantValues} from "../utils/nodes";
import {FunctionPlotDatum} from "function-plot/dist/types";
import Derivations from "./Derivations";

/**
 * Input for linear equations (where y can be separated).
 *
 * @param id the id of the input
 * @param save saves the input and updates plot
 * @constructor
 */
export default function LinearInput({ id, save }: {id: number, save: (datum: FunctionPlotDatum) => void}) {
    const dispatch = useDispatch();
    const value = useSelector(selectDatum(id))?.raw[0] ?? '';
    const [node, setNode] = useState<Node|undefined>(undefined);

    const saveInput = (node: Node | undefined, raw: string) => {
        setNode(node);
        if (node === undefined) {
            return;
        }
        const importantYs = importantValues(node);
        const datum: FunctionPlotDatum = {
            fn: node.format('x'),
            fnType: "linear",
        };
        dispatch(modify({
            id,
            datum: {
                datum,
                importantYs,
                raw: [raw],
                fancy: `y = ${node.toTex()}`
            }
        }));
        save(datum);
    }

    return (
        <>
            <FunctionInput valueSelector={() => value} title='f(x) = ' placeholder='Předpis funkce' saveValue={saveInput}  allowedVars={1} />
            <Derivations node={node} derivator={deriveSmart} />
        </>
);
}

