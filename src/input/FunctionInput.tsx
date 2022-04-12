import React, {useEffect, useRef, useState} from "react";
import {Col, Form, InputGroup, Row} from "react-bootstrap";
import parseIt from "../math/eval/parser";
import lexIt from "../math/eval/lexer";
import {Node} from "../math/node";
import Popover from "../components/Popover";
import Derivations from "./Derivations";
import {useSelector} from "react-redux";
import {selectDatum} from "./database";

interface FunctionInputProps {
    id: number,
    title: string,
    allowedVars: number,
    placeholder: string,
    saveValue: (node: Node | undefined, raw: string) => any,
    derivator?: ((node: Node) => Node) | undefined
}

export default function FunctionInput({id, saveValue, title, placeholder, allowedVars, derivator = undefined}: FunctionInputProps) {
    const inputRef = useRef(null);
    const [error, setError] = useState('');
    const [value, setValue] = useState(useSelector(selectDatum(id))?.raw ?? '');
    const [node, setNode] = useState<Node|undefined>(undefined);
    const [timeout, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

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
            if (variables.length > allowedVars) {
                throw new Error(`Used too many variables (${variables.length}): ${JSON.stringify(variables)}`)
            }
            setNode(node);
            saveValue(node, value);
        } catch (e: any) {
            setNode(undefined);
            saveValue(undefined, value);
            setTimeoutId(setTimeout(() => setError(`${e.name}: ${e.message}`), 1000));
        }
    }

    // eslint-disable-next-line
    useEffect(updateData, [value]);

    function addDerivations() {
        if (derivator === undefined) {
            return <></>;
        }
        return (<Derivations node={node} derivator={derivator} />);
    }

    return (
        <>
            <Row>
                <Col>
                    <InputGroup ref={inputRef}>
                        <InputGroup.Text id="basic-addon1">{title}</InputGroup.Text>
                        <Form.Control
                            type="text"
                            value={value}
                            onChange={event => setValue(event.target.value)}
                            placeholder={placeholder}
                            isInvalid={error !== ''}
                        />
                        <Popover message={error} placement='bottom' target={inputRef.current} show={error !== ''}/>
                    </InputGroup>
                </Col>
            </Row>
            {addDerivations()}
        </>
    );
}