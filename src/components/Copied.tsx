import React, {MutableRefObject} from "react";
import {Overlay, Tooltip} from "react-bootstrap";

/**
 * All inputs joined in a single component.
 *
 * @constructor
 */
export default function Copied({target, show}: { target: MutableRefObject<any>, show: boolean }) {
    return (
        <Overlay target={target.current} show={show} placement="bottom">
            {(props) => (
                <Tooltip {...props}>
                    Zkopírováno
                </Tooltip>
            )}
        </Overlay>
    );
}