import React, {useEffect, useRef} from 'react'
import functionPlot from 'function-plot'
import {FunctionPlotDatum} from "function-plot/dist/types";

export const xMin = -10;
export const xMax = 10;

type Props = {
    width: number,
    height: number,
    data: FunctionPlotDatum[],
    yDomain: [number, number] | undefined,
};

/**
 * The heart of the application. This components selects data from databases and plots it.
 *
 * @param width width of the plot
 * @param height height of the plot
 * @param data the plot data
 * @param yDomain initial ends of y axis
 * @constructor
 */
export default function Plot({width, height, data, yDomain}: Props) {
    const rootEl = useRef(null);

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
                title: 'Graphly',
                grid: true,
                xAxis: {
                    label: 'osa x',
                    domain: [xMin, xMax]
                },
                yAxis: {
                    label: 'osa y',
                    domain: data.length === 1 && data[0].fnType === 'linear' ? yDomain : [xMin, xMax]
                },
                width,
                height
            });
        } catch (e) {
            console.error(e);
        }
    }, [data, width, height, yDomain])

    return (<div className='mt-2' ref={rootEl}/>);
}