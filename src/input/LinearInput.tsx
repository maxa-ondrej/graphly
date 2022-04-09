import React, {useEffect, useState} from "react";
import {Button, Col, Form, InputGroup, Row} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {modify, selectDatum} from "./database";
import parseIt from "../math/eval/parser";
import lexIt from "../math/eval/lexer";
import {deriveAndSimplify} from "../math/node";

export default function LinearInput({ id, errorHandler }: {id: number, errorHandler: (message: string) => void}) {
    const dispatch = useDispatch();
    const datum = useSelector(selectDatum(id));
    let input = '';
    if (datum !== null && datum.datum.fnType === "linear") {
        input = `${datum.raw}`;
    }
    const [value, setValue] = useState(input);
    const [timeout, setTimeoutId] = useState<NodeJS.Timeout|null>(null);
    const [firstDerivations, setFirstDerivations] = useState<string|undefined>(undefined);
    const [secondDerivations, setSecondDerivations] = useState<string|undefined>(undefined);

    const mathEqResolveUrl = (input: string) => `https://www.wolframalpha.com/input?i=${input.replace('+', '%2B')}`;

    const updateData = () => {
        errorHandler('');
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        if (value === '') {
            return;
        }
        try {
            let node = parseIt(lexIt(value));
            console.log(node.tree(''));
            dispatch(modify({
                id,
                datum: {
                    datum:  {
                        fn: node.format(),
                        fnType: "linear",
                    },
                    raw: value,
                    fancy: `y = ${node.toTex()}`
                }
            }));
            node = deriveAndSimplify(node, 'x');
            setFirstDerivations(mathEqResolveUrl(node.format() + '=0'));
            node = deriveAndSimplify(node, 'x');
            setSecondDerivations(mathEqResolveUrl(node.format() + '=0'));
        } catch (e: any) {
            setTimeoutId(setTimeout(() => errorHandler(`${e.name}: ${e.message}`), 1000));
            setFirstDerivations(undefined);
            setSecondDerivations(undefined);
        }
    }

    useEffect(updateData, [value]);

    return (
        <div>
            <Row>
                <Col xs={12}>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon1">f(x) = </InputGroup.Text>
                        <Form.Control
                            type="text"
                            value={value}
                            onChange={event => setValue(event.target.value)}
                            placeholder="Předpis funkce"
                        />
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
        </div>
    );
}