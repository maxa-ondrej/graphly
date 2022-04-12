import React from "react";
import {useDispatch} from "react-redux";
import {modify} from "./database";
import {deriveImplicit, Node} from "../math/node";
import FunctionInput from "./FunctionInput";

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
                raw,
                fancy: `${node.toTex()} = 0`
            }
        }));
    }

    return <FunctionInput id={id} title='f(x, y) = ' placeholder='Předpis funkce' saveValue={updateData} derivator={deriveImplicit}  allowedVars={2}/>;
}