import React from "react";
import {useDispatch} from "react-redux";
import {modify} from "./database";
import {Node} from "../math/node";
import FunctionInput from "./FunctionInput";

export default function LinearInput({ id }: {id: number}) {
    const dispatch = useDispatch();

    const saveInput = (node: Node | undefined, raw: string) => {
        if (node === undefined) {
            return;
        }
        dispatch(modify({
            id,
            datum: {
                datum:  {
                    fn: node.format('x'),
                    fnType: "linear",
                },
                raw,
                fancy: `y = ${node.toTex()}`
            }
        }));
    }

    return <FunctionInput id={id} title='f(x) = ' placeholder='Předpis funkce' saveValue={saveInput}  allowedVars={1} />;
}