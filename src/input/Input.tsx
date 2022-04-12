import React, {useCallback, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {modify as modifyPlot, remove as removePlot} from "../math/plot/database";
import {Button, Col, Form, InputGroup, Row} from "react-bootstrap";
import LinearInput from "./LinearInput";
import {deselect, isSelected, remove as removeInput, selectDatum} from "./database";
import ReactSwitch from "react-switch";
import MathJax from "../components/MathJax";
import ImplicitInput from "./ImplicitInput";
import './Input.css';
import Popover from "../components/Popover";
import {FunctionPlotDatum} from "function-plot/dist/types";

/**
 * Returns corresponding input element depending on the type.
 *
 * @param type the type of input
 * @param id the id of the input
 * @param save saves the input and updates plot
 */
export function parseInput(type: string, id: number, save: (datum: FunctionPlotDatum) => void) {
    switch (type) {
        case "linear":
            return <LinearInput id={id} save={save} />;
        case 'implicit':
            return <ImplicitInput id={id} save={save} />;
        default:
            return <p>Input type not supported yet.</p>;
    }

}

const inputTypes = [
    {value: 'linear', label: 'Funkce (explicitní)'},
    {value: 'implicit', label: 'Implicitní funkce'},
];

const graphTypes = [
    {value: 'polyline', label: 'Lomená čára (doporučené)'},
    {value: 'interval', label: 'Intervalové obdélníky'},
    {value: 'scatter', label: 'Tečkovaně'},
];

/**
 * Input component
 *
 * @prop id - The ID assigned to this input and the corresponding plot.
 */
export default function Input({ id }: { id: number }) {
    const inputRef = useRef(null);
    const [error, setError] = useState('');
    const [inputType, setInputType] = useState(inputTypes[0].value);
    const [color, setColor] = useState('black');
    const [nSamples, setNSamples] = useState(100);
    const [from, setFrom] = useState<undefined|string>(undefined);
    const [to, setTo] = useState<undefined|string>(undefined);
    const [graphType, setGraphType] = useState<'polyline' | 'interval' | 'scatter'>(inputType === 'implicit' ? 'interval' : 'polyline');
    const [visible, setVisible] = useState(true);
    const dispatch = useDispatch();
    const data = useSelector(selectDatum(id));
    const selected = useSelector(isSelected(id));


    const handleSubmit = (hide: boolean, datum: FunctionPlotDatum | undefined = undefined) => {
        if (data === null) {
            setError('You need to enter the function details first!');
            setTimeout(() => setError(''), 3000);
            return;
        }
        setError('');

        dispatch(modifyPlot({
            id,
            min: data.min,
            max: data.max,
            datum: visible ? {
                ...(datum === undefined ? data.datum : datum),
                color,
                graphType,
                range: from === undefined || to === undefined ? undefined : [parseInt(from), parseInt(to)],
                nSamples: graphType !== 'scatter' ? undefined : nSamples
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
    }, [visible, color, graphType, nSamples, from, to]);


    const remove = useCallback(() => {
        dispatch(removePlot(id));
        dispatch(removeInput(id));
    }, [dispatch, id]);

    if (!selected && data !== null) {
        return <div className={(visible ? 'text-dark' : 'text-muted') + ' tex-input'}><MathJax tex={data.fancy} /></div>;
    }

    return (
        <Form onSubmit={event => {
            handleSubmit(true);
            event.preventDefault();
        }} onBlur={event => {
            handleSubmit(true);
            event.preventDefault();
        }}>
            <Row className='mt-2 mb-2'>
                <Col ref={inputRef}>
                    {parseInput(inputType, id, (datum: FunctionPlotDatum) => handleSubmit(false, datum))}
                </Col>
                <Popover message={error} placement='bottom' target={inputRef.current} show={error !== ''}/>
            </Row>
            <Row className='mb-2'>
                <Col>
                    <Form.Select title='Typ předpisu' className='w-100' value={inputType} onChange={event => {
                        if (event.target.value === 'implicit') {
                            setGraphType('interval');
                        }
                        setInputType(event.target.value)
                    }}>
                        {inputTypes.map(({label, value}) => <option value={value} key={value}>{label}</option>)}
                    </Form.Select>
                </Col>
                <Col>
                    <InputGroup title='Definiční obor'>
                        <InputGroup.Text>D(x) = </InputGroup.Text>
                        <Form.Control type='number' value={from} onChange={event => setFrom(event.target.value)} placeholder='Od' />
                        <Form.Control type='number' value={to} onChange={event => setTo(event.target.value)} placeholder='Do' />
                    </InputGroup>
                </Col>
            </Row>
            <Row className='mb-2'>
                <Col xs={graphType !== 'scatter' ? '6' : '4'}>
                    <Form.Select disabled={inputType === 'implicit'} title='Typ grafu' className='w-100' value={graphType} onChange={event => {
                        if (['polyline', 'interval', 'scatter'].includes(event.target.value)) {
                            // @ts-ignore
                            setGraphType(event.target.value)
                        }
                    }}>
                        {graphTypes.map(({label, value}) => <option value={value} key={value}>{label}</option>)}
                    </Form.Select>
                </Col>
                <Col className={graphType !== 'scatter' ? 'd-none' : 'col-2'}>
                    <Form.Control type='number' value={nSamples} onChange={event => setNSamples(parseInt(event.target.value))} title='Počet teček' />
                </Col>
                <Col xs={3}>
                    <Form.Control className='w-100' type="color" value={color} onChange={event => setColor(event.target.value)} title='Barva grafu' />
                </Col>
                <Col xs={3}>
                    <div className='mt-1' title={visible ? 'Skrýt graf' : 'Zobrazit graf'}>
                        <ReactSwitch checked={visible} onChange={checked => setVisible(checked)} />
                    </div>
                </Col>
            </Row>
            <Row className='mb-2'>
                <Col className='ms-auto'>
                    <Button variant="primary" type="submit">Uložit</Button>
                </Col>
                <Col>
                    <Button variant="danger" onClick={remove}>Smazat</Button>
                </Col>
            </Row>
        </Form>
    );
}
