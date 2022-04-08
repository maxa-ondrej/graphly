import React from "react";
import {Form} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {modify, selectDatum} from "./database";

export default function LinearInput({ id }: {id: number}) {
    const dispatch = useDispatch();
    const datum = useSelector(selectDatum(id));
    let input = '';
    if (datum !== null && datum.datum.fnType === "linear") {
        input = `${datum.datum.fn}`;
    }

    const updateData = (input: string) => {
        dispatch(modify({
            id,
            datum: {
                datum:  {
                    fn: input,
                    fnType: "linear",
                },
                fancy: `y = ${input}`
            }
        }));
    }

    return (
        <Form.Control
            type="text"
            value={input}
            onChange={event => updateData(event.target.value)}
            placeholder="Předpis funkce"
        />
    );
}