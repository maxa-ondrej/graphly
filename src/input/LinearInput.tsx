import React, {useEffect, useRef, useState} from "react";
import {Button, Col, Form, InputGroup, Row} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {modify, selectDatum} from "./database";
import parseIt from "../math/eval/parser";
import lexIt from "../math/eval/lexer";
import {deriveSmart} from "../math/node";
import Popover from "../components/Popover";

export default function LinearInput({ id }: {id: number}) {
    const dispatch = useDispatch();
    const datum = useSelector(selectDatum(id));
    let input = '';
    if (datum !== null && datum.datum.fnType === "linear") {
        input = `${datum.raw}`;
    }
    const [error, setError] = useState('');
    const inputRef = useRef(null);
    const [valid, setValid] = useState(true);
    const [value, setValue] = useState(input);
    const [timeout, setTimeoutId] = useState<NodeJS.Timeout|null>(null);
    const [firstDerivations, setFirstDerivations] = useState<string|undefined>(undefined);
    const [secondDerivations, setSecondDerivations] = useState<string|undefined>(undefined);

    const mathEqResolveUrl = (input: string) => `https://www.wolframalpha.com/input?i=${input.replace('+', '%2B')}`;

    const updateData = () => {
        setError('');
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        if (value === '') {
            return;
        }
        try {
            let node = parseIt(lexIt(value));
            let variables = node.getVariables();
            if (variables.length > 1) {
                throw new Error(`Used too many variables (${variables.length}): ${JSON.stringify(variables)}`)
            }
            console.log(node.tree(''));
            dispatch(modify({
                id,
                datum: {
                    datum:  {
                        fn: node.format('x'),
                        fnType: "linear",
                    },
                    raw: value,
                    fancy: `y = ${node.toTex()}`
                }
            }));
            node = deriveSmart(node);
            setFirstDerivations(mathEqResolveUrl(node.format(null) + '=0'));
            node = deriveSmart(node);
            setSecondDerivations(mathEqResolveUrl(node.format(null) + '=0'));
            setValid(true);
        } catch (e: any) {
            setValid(false);
            console.error(e);
            setTimeoutId(setTimeout(() => setError(`${e.name}: ${e.message}`), 1000));
            setFirstDerivations(undefined);
            setSecondDerivations(undefined);
        }
    }

    // eslint-disable-next-line
    useEffect(updateData, [value]);

    return (
        <>
            <Row>
                <Col xs={12} ref={inputRef}>
                    <InputGroup>
                        <InputGroup.Text id="basic-addon1">f(x) = </InputGroup.Text>
                        <Form.Control
                            type="text"
                            value={value}
                            className={valid ? '' : 'border border-danger'}
                            onChange={event => setValue(event.target.value)}
                            placeholder="Předpis funkce"
                        />
                        <Popover message={error} placement='bottom' target={inputRef.current} show={error !== ''} />
                    </InputGroup>
                </Col>
            </Row>
            <Row className={firstDerivations === undefined ? 'd-none' : 'mt-2'}>
                <Col>
                    <Button className='w-100' variant='outline-primary' href={firstDerivations} target='_blank'>Stacionární body</Button>
                </Col>
                <Col>
                    <Button className='w-100' variant='outline-primary' href={secondDerivations} target='_blank'>Inflexní body</Button>
                </Col>
            </Row>
        </>
    );
}