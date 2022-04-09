import {Overlay} from "react-bootstrap";
import {Placement} from "react-bootstrap/types";
import {DOMContainer} from "@restart/ui/useWaitForDOMRef";

interface Props {
    message: string
    placement: Placement,
    target: DOMContainer,
    show: boolean
}

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