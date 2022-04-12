import {Overlay} from "react-bootstrap";
import {Placement} from "react-bootstrap/types";
import {DOMContainer} from "@restart/ui/useWaitForDOMRef";

/**
 * Props for Popover component
 */
interface Props {
    message: string
    placement: Placement,
    target: DOMContainer,
    show: boolean
}

/**
 * Used to display error messages in a fancy way by attaching a floating div next to the provided element.
 *
 * @param message the error message
 * @param target the element the floating div will be attached to
 * @param placement the placement of the floating div
 * @param show if it should be shown or hidden
 * @constructor
 */
export default function Popover({message, target, placement, show}: Props) {
    return (
        <Overlay target={target} show={show} placement={placement}>
            {({ placement, arrowProps, show: _show, popper, ...props }) => (
                <div
                    {...props}
                    style={{
                        position: 'absolute',
                        backgroundColor: 'rgba(255, 100, 100, 0.85)',
                        padding: '2px 10px',
                        color: 'white',
                        borderRadius: 3,
                        ...props.style,
                    }}
                >
                    {message}
                </div>
            )}
        </Overlay>
    );
}