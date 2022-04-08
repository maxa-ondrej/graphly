import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {modify as modifyPlot, RecipeWithId, remove as removePlot} from "../math/plot/database";
import {Button, Col, Container, Form, Row} from "react-bootstrap";
import LinearInput from "./LinearInput";
import {deselect, isSelected, remove as removeInput, selectDatum} from "./database";
import TeXToSVG from 'tex-to-svg';
import ReactSwitch from "react-switch";
import {FunctionPlotDatum} from "function-plot/dist/types";

export function parseInput(type: string, id: number) {
    switch (type) {
        case "linear":
            return <LinearInput id={id} />;
        case 'parametric':
        case 'implicit':
            return <p>ToBeDone</p>;
        default:
            return <p>Error</p>;
    }

}

const inputTypes = [
    {value: 'linear', label: 'Funkce (explicitní)'},
    {value: 'parametric', label: 'Parametrické zadaní'},
    {value: 'implicit', label: 'Implicitní funkce'},
];

/**
 * Input component
 *
 * @prop id - The ID assigned to this input and the corresponding plot.
 */
export default function Input({ id }: { id: number }) {
    const [inputType, setInputType] = useState(inputTypes[0].value);
    const [color, setColor] = useState('black');
    const [visible, setVisible] = useState(true);
    const dispatch = useDispatch();
    const data = useSelector(selectDatum(id));
    const selected = useSelector(isSelected(id));


    const handleSubmit = () => {
        if (data === null) {
            alert('You need to enter the function details first!');
            return;
        }

        dispatch(modifyPlot({
            id,
            datum: visible ? {
                ...data.datum,
                color,
            } : null
        }));
        dispatch(deselect())
    };

    useEffect(() => {
        if (data !== null) {
            handleSubmit();
        }
    }, [visible, color]);


    const remove = useCallback(() => {
        dispatch(removePlot(id));
        dispatch(removeInput(id));
    }, [dispatch, id]);

    if (!selected && data !== null) {
        return <div className={visible ? 'text-dark' : 'text-muted'} dangerouslySetInnerHTML={{__html: TeXToSVG(data.fancy)}} />;
    }

    return (
        <Form onSubmit={event => {
            handleSubmit();
            event.preventDefault();
        }}>
            <Row className='mt-2 mb-2'>
                <Col>
                    {parseInput(inputType, id)}
                </Col>
            </Row>
            <Row className='mb-2'>
                <Col sx={8}>
                    <Form.Select className='w-100' value={inputType} onChange={event => setInputType(event.target.value)}>
                        {inputTypes.map(({label, value}) => <option value={value} key={value}>{label}</option>)}
                    </Form.Select>
                </Col>
                <Col sx={4}>
                    <Form.Control className='w-100' type="color" value={color} onChange={event => setColor(event.target.value)} />
                </Col>
                <Col sx={4}>
                    <ReactSwitch checked={visible} onChange={checked => setVisible(checked)} />
                </Col>
            </Row>
            <Row className='mb-2'>
                <Col>
                    <Button variant="primary" type="submit">Uložit</Button>
                </Col>
                <Col>
                    <Button variant="danger" onClick={remove}>Smazat</Button>
                </Col>
            </Row>
        </Form>
    );
}
