import React, {useEffect, useState} from "react";
import {Button, Col, Row} from "react-bootstrap";
import {Node} from "../math/node";

export default function Derivations({ node, derivator }: {node: Node | undefined, derivator: (node: Node) => Node}) {
    const [firstDerivations, setFirstDerivations] = useState<string|undefined>(undefined);
    const [secondDerivations, setSecondDerivations] = useState<string|undefined>(undefined);
    const mathEqResolveUrl = (input: string) => `https://www.wolframalpha.com/input?i=${input.replace('+', '%2B')}`;

    useEffect(() => {
        if (node === undefined) {
            return;
        }

        node = derivator(node);
        setFirstDerivations(mathEqResolveUrl(node.format(null) + '=0'));
        node = derivator(node);
        setSecondDerivations(mathEqResolveUrl(node.format(null) + '=0'));
    }, [node]);


    return (
        <Row className={firstDerivations === undefined ? 'd-none' : 'mt-2'}>
            <Col>
                <Button className='w-100' variant='outline-primary' href={firstDerivations} target='_blank'>Stacionární body</Button>
            </Col>
            <Col>
                <Button className='w-100' variant='outline-primary' href={secondDerivations} target='_blank'>Inflexní body</Button>
            </Col>
        </Row>
    );
}