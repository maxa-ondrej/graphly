import {useDispatch, useSelector} from "react-redux";
import store from "../store";
import React, {useCallback, useEffect} from "react";
import Input from "./Input";
import {Button} from "react-bootstrap";
import {create, select, selectIds, selectLastId} from "./database";

export default function Inputs() {
    const dispatch = useDispatch();
    const inputs = useSelector(selectIds());

    const addNewInput = useCallback(() => {
        dispatch(create());
        let id = selectLastId()(store.getState());
        dispatch(select(id));
    }, [dispatch])

    const createInputs = () => inputs.map(input => (
        <div className="m-2 p-2 border border-secondary rounded" key={input} onClick={() => dispatch(select(input))}>
            <Input id={input} key={input} />
        </div>
    ));

    useEffect(() => {
        if (inputs.length === 0) {
            addNewInput();
        }
    }, [addNewInput, inputs]);

    return (
        <div>
            <div className="d-flex justify-content-center m-1">
                <Button variant="success" onClick={() => addNewInput()}>+ Přidat</Button>
            </div>

            {createInputs()}
        </div>
    );
}