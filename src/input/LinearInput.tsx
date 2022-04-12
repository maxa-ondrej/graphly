import React from "react";
import {useDispatch} from "react-redux";
import {modify} from "./database";
import {Node} from "../math/node";
import FunctionInput from "./FunctionInput";
import {wightedMinAndMax} from "../utils/nodes";

/**
 * Input for linear equations (where y can be separated).
 *
 * @param id the id of the input
 * @constructor
 */
export default function LinearInput({ id }: {id: number}) {
    const dispatch = useDispatch();

    const saveInput = (node: Node | undefined, raw: string) => {
        if (node === undefined) {
            return;
        }
        const minAndMax = wightedMinAndMax(node);
        dispatch(modify({
            id,
            datum: {
                datum:  {
                    fn: node.format('x'),
                    fnType: "linear",
                },
                min: minAndMax[0],
                max: minAndMax[1],
                raw,
                fancy: `y = ${node.toTex()}`
            }
        }));
    }

    return <FunctionInput id={id} title='f(x) = ' placeholder='Předpis funkce' saveValue={saveInput}  allowedVars={1} />;
}