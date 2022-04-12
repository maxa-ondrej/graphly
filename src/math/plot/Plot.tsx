import React, {useEffect, useRef} from 'react'
import functionPlot from 'function-plot'
import {useSelector} from "react-redux";
import {selectAllData, selectMinAndMax} from "./database";
import store from "../../store";

export const xMin = -10;
export const xMax = 10;

export default function Plot({width, height}: { width: number, height: number }) {
    const rootEl = useRef(null);
    const data = useSelector(selectAllData);
    const yDomain = useSelector(selectMinAndMax);
    console.log(store.getState())

    useEffect(() => {
        try {
            // @ts-ignore
            rootEl.current.innerHTML = '';
            functionPlot({
                // @ts-ignore
                target: rootEl.current,
                data: [
                    ...data,
                ],
                title: `Graphly`,
                grid: true,
                xAxis: {
                    label: 'osa x',
                    domain: [xMin, xMax]
                },
                yAxis: {
                    label: 'osa y',
                    domain: yDomain
                },
                width,
                height
            });
        } catch (e) {
            console.error(e);
        }
    }, [data, width, height])

    return (<div ref={rootEl}/>);
}