import React, { useEffect, useState, useRef } from 'react'
import { Button, Modal, Form, Alert, Col } from 'react-bootstrap'
import * as _ from 'lodash'

export const AddEditScheduleModal = (props) => {
    const modalRef = useRef()
    const [validated, setValidated] = useState(false)
    const [schedule, setSchedule] = useState({})
    const [day, setDay] = useState('')
    const [start, setStart] = useState('')
    const [end, setEnd] = useState('')
    const [description, setDescription] = useState('')
    const [alert, setAlert] = useState('')

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    useEffect(() => {
        if (props.schedule) {
            setSchedule(props.schedule || {})
            setDay(props.schedule.day || days[0])
            setDescription(props.schedule.description || '')
            setStart(props.schedule.start || '')
            setEnd(props.schedule.end || '')
        }
    }, [props.schedule])

    useEffect(() => {
        setAlert(props.alert)
    }, [props.alert])

    const onShow = () => {
        setValidated(false)
        setAlert('')
        setSchedule(props.schedule || {})
        setDay(props.schedule.day || days[0])
        setDescription(props.schedule.description || '')
        setStart(props.schedule.start || '')
        setEnd(props.schedule.end || '')
    }

    const onSubmit = (event) => {
        const form = event.currentTarget
        event.preventDefault()
        event.stopPropagation()
        setValidated(true)

        if (!form.checkValidity()) {
            return
        }

        console.log(day)

        props.onSubmit(Object.assign({}, schedule, {
            day,
            description,
            start,
            end
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
            <Form noValidate validated={validated} onSubmit={onSubmit} ref={modalRef}>
                <Form.Row>
                    <Form.Group as={Col} controlId="day">
                        <Form.Label>Schedule Day</Form.Label>
                        <Form.Control as="select" required onChange={(e) => setDay(e.target.value)} value={day}>
                            {days.map((day, i) => {
                                return <option key={i} value={day}>{day}</option>
                            })}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col} controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control type="text" placeholder="Enter Description" required onChange={(e) => setDescription(e.target.value)} value={description} />
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col} controlId="start">
                        <Form.Label>Start Time</Form.Label>
                        <Form.Control type="text" placeholder="Enter Start Time" required onChange={(e) => setStart(e.target.value)} value={start} />
                    </Form.Group>
                    <Form.Group as={Col} controlId="end">
                        <Form.Label>End Time</Form.Label>
                        <Form.Control type="text" placeholder="Enter End Time" required onChange={(e) => setEnd(e.target.value)} value={end} />
                    </Form.Group>
                </Form.Row>
                <Button variant="primary" type="submit" className="float-right">
                    Submit
                </Button>
            </Form>
        </Modal.Body>
    </Modal>
}