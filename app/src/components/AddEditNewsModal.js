import React, { useEffect, useState } from 'react'
import { Button, Modal, Form, Alert } from 'react-bootstrap'
import * as _ from 'lodash'

export const AddEditNewsModal = (props) => {
    const [validated, setValidated] = useState(false)
    const [news, setNews] = useState({})
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [alert, setAlert] = useState('')

    useEffect(() => {
        setNews(props.news || {})
        setTitle(props.news.title || '')
        setMessage(props.news.message || '')
    }, [props.news])

    useEffect(() => {
        setAlert(props.alert)
    }, [props.alert])

    const onShow = () => {
        setValidated(false)
        setAlert('')
        setNews(news || {})
        setTitle(news.title || '')
        setMessage(news.message || '')
    }

    const onSubmit = (event) => {
        const form = event.currentTarget
        event.preventDefault()
        event.stopPropagation()
        setValidated(true)

        if (!form.checkValidity()) {
            return
        }

        props.onSubmit(Object.assign({}, news, {
            title,
            message
        }))
    }

    return <Modal
        show={props.show}
        onShow={onShow}
        onHide={props.onHide}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
    >
        <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
                {props.title}
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {!_.isEmpty(alert) ? <Alert variant="danger">{alert}</Alert> : ''}
            <Form noValidate validated={validated} onSubmit={onSubmit}>
                <Form.Group controlId="title">
                    <Form.Label>First Title</Form.Label>
                    <Form.Control type="text" placeholder="Enter Title" required onChange={(e) => setTitle(e.target.value)} value={title} />
                </Form.Group>
                <Form.Group controlId="message">
                    <Form.Label>Message</Form.Label>
                    <Form.Control as="textarea" rows={3} placeholder="Enter Message" required onChange={(e) => setMessage(e.target.value)} value={message} />
                </Form.Group>
                <Button variant="primary" type="submit" className="float-right">
                    Submit
                </Button>
            </Form>
        </Modal.Body>
    </Modal>
}