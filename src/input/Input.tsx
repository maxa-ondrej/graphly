import React, {useCallback, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {modify as modifyPlot, remove as removePlot} from "../math/plot/database";
import {Button, Col, Form, Row} from "react-bootstrap";
import LinearInput from "./LinearInput";
import {deselect, isSelected, remove as removeInput, selectDatum} from "./database";
import ReactSwitch from "react-switch";
import Popover from "../components/Popover";
import MathJax from "../components/MathJax";

export function parseInput(type: string, id: number, setError: (message: string) => void) {
    switch (type) {
        case "linear":
            return <LinearInput id={id} errorHandler={setError} />;
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
    const [error, setError] = useState('');
    const inputRef = useRef(null);
    const dispatch = useDispatch();
    const data = useSelector(selectDatum(id));
    const selected = useSelector(isSelected(id));


    const handleSubmit = (hide: boolean) => {
        if (data === null) {
            alert('You need to enter the function details first!');
            return;
        }

        dispatch(modifyPlot({
            id,
            datum: visible ? {
                ...data.datum,
                color,
                graphType: 'polyline'
            } : null
        }));
        if (hide) {
            dispatch(deselect())
        }
    };

    useEffect(() => {
        if (data !== null) {
            handleSubmit(false);
        }
    // eslint-disable-next-line
    }, [visible, color]);


    const remove = useCallback(() => {
        dispatch(removePlot(id));
        dispatch(removeInput(id));
    }, [dispatch, id]);

    if (!selected && data !== null) {
        return <div className={visible ? 'text-dark' : 'text-muted'}><MathJax  tex={data.fancy} /></div>;
    }

    return (
        <Form onSubmit={event => {
            handleSubmit(true);
            event.preventDefault();
        }}>
            <Row className='mt-2 mb-2'>
                <Col ref={inputRef}>
                    {parseInput(inputType, id, setError)}
                </Col>
                <Popover message={error} placement='bottom' target={inputRef.current} show={error !== ''} />
            </Row>
            <Row className='mb-2'>
                <Col>
                    <Form.Select className='w-100' value={inputType} onChange={event => setInputType(event.target.value)}>
                        {inputTypes.map(({label, value}) => <option value={value} key={value}>{label}</option>)}
                    </Form.Select>
                </Col>
            </Row>
            <Row className='mb-2'>
                <Col sx={4}>
                    <Form.Control className='w-100' type="color" value={color} onChange={event => setColor(event.target.value)} />
                </Col>
                <Col sx={4}>
                    <ReactSwitch className='w-100' checked={visible} onChange={checked => setVisible(checked)} />
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
