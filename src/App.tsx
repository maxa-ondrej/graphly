import React, {useEffect, useState} from 'react';
import Plot from "./math/plot/Plot";
import Inputs from "./components/input/Inputs";
import {Col, Row} from "react-bootstrap";

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}

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


/**
 * The App component
 */
export default function App() {
    const { height, width } = useWindowDimensions();
    const phone = width < 992;

    return (
        <div className="App">
            <Row>
                <Col className='order-2 order-lg-1' xs={12} lg={4}><Inputs /></Col>
                <Col className='order-1 order-lg-2' xs={12} lg={8}><Plot width={phone ? width : width / 2} height={phone ? Math.min(width * 3 / 4, height * 0.6) : Math.min(width * 3 / 8, height)} /></Col>
            </Row>
        </div>
    );
}
