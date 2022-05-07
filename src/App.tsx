import React, {useEffect, useState} from 'react';
import Plot from "./math/plot/Plot";
import Inputs from "./input/Inputs";
import {Col, Row} from "react-bootstrap";
import {useSearchParams} from "react-router-dom";
import {useSelector} from "react-redux";
import {selectAllData, selectMinAndMax} from "./math/plot/database";
import {FunctionPlotDatum} from "function-plot/dist/types";
import parseIt from "./math/eval/parser";
import lexIt from "./math/eval/lexer";

function getWindowDimensions() {
    const {innerWidth: width, innerHeight: height} = window;
    return {
        width,
        height
    };
}

/**
 * React hook that listens for window width and height.
 */
export function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
}

function parseInputs(data: any[]): FunctionPlotDatum[] {
    if (data.length === 0) {
        throw new Error('You need to enter the function details first!');
    }
    let parsed: FunctionPlotDatum[] = [];

    for (let raw of data) {
        if (typeof raw === 'string') {
            raw = {
                fn: raw
            };
        }
        let node = parseIt(lexIt(raw.fn));
        let variables = node.getVariables();

        const isImplicit = raw.hasOwnProperty('fnType') && raw.fnType === 'implicit';
        if (variables.length > (isImplicit ? 2 : 1)) {
            throw new Error(`Used too many variables (${variables.length}): ${JSON.stringify(variables)}`)
        }

        parsed.push({
            ...raw,
            fn: isImplicit ? node.format(null) : node.format('x'),
            fnType: isImplicit ? 'implicit' : 'linear',
        });
    }

    return parsed;
}


/**
 * The App component
 */
export default function App() {
    const {height, width} = useWindowDimensions();
    const [searchParams] = useSearchParams();
    const data = useSelector(selectAllData);
    const yDomain = useSelector(selectMinAndMax);
    if (searchParams.has('data')) {
        const inputs = searchParams.get('data');
        try {
            console.log(inputs as string);
            let json = JSON.parse(inputs as string);
            if (!Array.isArray(json)) {
                json = [json];
            }
            return <Plot width={width} height={height} data={parseInputs(json)}  yDomain={undefined} showLabels={false}/>;
        } catch (e: any) {
            return <p>{e.message}</p>;
        }

    }

    const phone = width < 992;
    return (
        <div className="App">
            <Row>
                <Col className='order-2 order-lg-1' xs={12} lg={4}>
                    <Inputs/>
                </Col>
                <Col className='order-1 order-lg-2' xs={12} lg={8}>
                    <Plot width={phone ? width : width / 2}
                          height={phone ? Math.min(width * 3 / 4, height * 0.6) : Math.min(width * 3 / 8, height)}
                          data={data}
                          yDomain={yDomain}
                          showLabels={true}
                    />
                </Col>
            </Row>
        </div>
    );
}
