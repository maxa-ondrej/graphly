import {useDispatch, useSelector} from "react-redux";
import store from "../store";
import React, {FocusEventHandler, useCallback, useEffect, useRef, useState} from "react";
import Input from "./Input";
import {Button, Col, Form, Modal, Row} from "react-bootstrap";
import {create, select, selectIds, selectLastId} from "./database";
import {FaDownload, FaPlus, FaTimes} from "react-icons/fa";
import {selectAllData} from "../math/plot/database";
import Copied from "../components/Copied";

/**
 * All inputs joined in a single component.
 *
 * @constructor
 */
export default function Inputs() {
    const dispatch = useDispatch();
    const inputs = useSelector(selectIds());
    const data = useSelector(selectAllData);

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [showLinkTooltip, setShowLinkTooltip] = useState(false);
    const targetLink = useRef(null);
    const [showIframeTooltip, setShowIframeTooltip] = useState(false);
    const targetIframe = useRef(null);
    const [width, setWidth] = useState(1200);
    const [height, setHeight] = useState(900);

    const addNewInput = useCallback(() => {
        dispatch(create());
        let id = selectLastId()(store.getState());
        dispatch(select(id));
    }, [dispatch]);

    const getUrl = () => `${window.location.origin}/?data=${encodeURIComponent(JSON.stringify(data))}`;

    const createInputs = () => inputs.map(input => (
        <div className="m-2 p-2 border border-secondary rounded" key={input} onClick={() => dispatch(select(input))}>
            <Input id={input} key={input}/>
        </div>
    ));

    const noCallback = () => {
    };

    const selectAndCopy: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
        event.target.select();
        navigator.clipboard.writeText(event.target.value).then(() => {
            switch (event.target) {
                case targetLink.current:
                    setShowLinkTooltip(true);
                    setTimeout(() => setShowLinkTooltip(false), 1000);
                    break;
                case targetIframe.current:
                    setShowIframeTooltip(true);
                    setTimeout(() => setShowIframeTooltip(false), 1000);
            }
        });
    };

    useEffect(() => {
        if (inputs.length === 0) {
            addNewInput();
        }
    }, [addNewInput, inputs]);

    return (
        <div>
            <div className="d-flex justify-content-center m-1">
                <Button variant="success" onClick={() => addNewInput()}><FaPlus/> Přidat</Button>
                <Button variant="primary" onClick={handleShow} className='ms-2'><FaDownload/> Export</Button>
            </div>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Export</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <h3>Odkaz</h3>
                        <Form.Control ref={targetLink} value={getUrl()} onChange={noCallback} onFocus={selectAndCopy}/>
                        <Copied target={targetLink} show={showLinkTooltip}/>
                        <h3 className='mt-2'>Iframe</h3>
                        <Row>
                            <Col xs={6}>
                                <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
                                    <Form.Label>Šířka</Form.Label>
                                    <Form.Control type='number' value={width}
                                                  onChange={event => setWidth(parseInt(event.target.value))}/>
                                </Form.Group>
                            </Col>
                            <Col xs={6}>
                                <Form.Group className="mb-3" controlId="exampleForm.ControlInput3">
                                    <Form.Label>Výška</Form.Label>
                                    <Form.Control type='number' value={height}
                                                  onChange={event => setHeight(parseInt(event.target.value))}/>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Label>HTML kód</Form.Label>
                            <Form.Control
                                value={`<iframe src="${getUrl()}" height="${height}" width="${width}"></iframe>`}
                                onChange={noCallback}
                                onFocus={selectAndCopy} as='textarea'
                                ref={targetIframe}
                            />
                            <Copied target={targetIframe} show={showIframeTooltip}/>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}><FaTimes/> Zavřít</Button>
                </Modal.Footer>
            </Modal>

            {createInputs()}
        </div>
    );
}