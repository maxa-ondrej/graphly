import React, {useEffect, useRef, useState} from "react";
import {Button, Col, Form, InputGroup, Row} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {modify, selectDatum} from "./database";
import parseIt from "../math/eval/parser";
import lexIt from "../math/eval/lexer";
import {deriveAndSimplify, deriveImplicit, deriveSmart, Negate} from "../math/node";
import Popover from "../components/Popover";

export default function ImplicitInput({ id }: {id: number}) {
    const dispatch = useDispatch();
    const datum = useSelector(selectDatum(id));
    let input = '';
    if (datum !== null && datum.datum.fnType === "implicit") {
        input = `${datum.raw}`;
    }
    const inputRef = useRef(null);
    const [error, setError] = useState('');
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
            dispatch(modify({
                id,
                datum: {
                    datum:  {
                        fn: node.format(null),
                        fnType: "implicit",
                    },
                    raw: value,
                    fancy: `${node.toTex()} = 0`
                }
            }));
            node = deriveImplicit(node);
            setFirstDerivations(mathEqResolveUrl(node.format(null) + '=0'));
            node = deriveImplicit(node);
            setSecondDerivations(mathEqResolveUrl(node.format(null) + '=0'));
            setValid(true);
        } catch (e: any) {
            setValid(false);
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
                        <InputGroup.Text id="basic-addon1">f(x, y) = </InputGroup.Text>
                        <Form.Control
                            type="text"
                            value={value}
                            onChange={event => setValue(event.target.value)}
                            placeholder="Předpis funkce"
                            isInvalid={!valid}
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