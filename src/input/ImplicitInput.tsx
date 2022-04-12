import React from "react";
import {useDispatch} from "react-redux";
import {modify} from "./database";
import {Node} from "../math/node";
import FunctionInput from "./FunctionInput";
import {deriveImplicit} from "../utils/nodes";

/**
 * Input element for Implicit functions (where y cannot be separated).
 *
 * @param id
 * @constructor
 */
export default function ImplicitInput({ id }: {id: number}) {
    const dispatch = useDispatch();

    const updateData = (node: Node | undefined, raw: string) => {
        if (node === undefined) {
            return;
        }
        dispatch(modify({
            id,
            datum: {
                datum:  {
                    fn: node.format(null),
                    fnType: "implicit",
                },
                min: [0, 0],
                max: [0, 0],
                raw,
                fancy: `${node.toTex()} = 0`
            }
        }));
    }

    return <FunctionInput id={id} title='f(x, y) = ' placeholder='Předpis funkce' saveValue={updateData} derivator={deriveImplicit}  allowedVars={2}/>;
}