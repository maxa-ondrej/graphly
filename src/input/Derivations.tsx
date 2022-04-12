import React, {useEffect, useState} from "react";
import {Button, Col, Row} from "react-bootstrap";
import {Node} from "../math/node";

/**
 * Displays buttons for derivations.
 *
 * @param node the node that will be derivated
 * @param derivator the function used for derivations
 * @constructor
 */
export default function Derivations({ node, derivator }: {node: Node | undefined, derivator: (node: Node) => Node}) {
    const [firstDerivations, setFirstDerivations] = useState<string|undefined>(undefined);
    const [secondDerivations, setSecondDerivations] = useState<string|undefined>(undefined);
    const mathEqResolveUrl = (input: string) => `https://www.wolframalpha.com/input?i=${input.replace('+', '%2B')}`;

    useEffect(() => {
        if (node === undefined) {
            return;
        }

        let node1 = derivator(node);
        setFirstDerivations(mathEqResolveUrl(node1.format(null) + '=0'));
        let node2 = derivator(node1);
        setSecondDerivations(mathEqResolveUrl(node2.format(null) + '=0'));
    }, [node, derivator]);


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