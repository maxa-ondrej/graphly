import React, {useEffect, useRef} from 'react'
import functionPlot from 'function-plot'
import {useSelector} from "react-redux";
import {selectAllData} from "./database";

export default function Plot({width, height}: { width: number, height: number}) {
    const rootEl = useRef(null);
    const data = useSelector(selectAllData);

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
                width,
                height
            });
        } catch (e) {
            console.error(e);
        }
    }, [data])

    return (<div ref={rootEl}/>);
}