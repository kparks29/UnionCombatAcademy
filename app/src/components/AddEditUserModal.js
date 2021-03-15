import React, { useEffect, useRef, useState } from 'react'
import { Button, Modal, Form, Col, Alert } from 'react-bootstrap'
import * as _ from 'lodash'

export const AddEditUserModal = (props) => {
    const formRef = useRef()
    const [validated, setValidated] = useState(false);
    const [belts] = useState([
        { label: 'White', value: 'white' }, { label: 'Gray', value: 'gray' }, { label: 'Yellow', value: 'yellow' },
        { label: 'Orange', value: 'orange' }, { label: 'Green', value: 'green' }, { label: 'Blue', value: 'blue' },
        { label: 'Purple', value: 'purple' }, { label: 'Brown', value: 'brown' }, { label: 'Black', value: 'black' },
        { label: 'Black/Red', value: 'blackred' }, { label: 'White/Red', value: 'whitered' }, { label: 'Red', value: 'red' }
    ])
    const [userTypes, setUserTypes] = useState([])
    const [user, setUser] = useState({})
    const [alert, setAlert] = useState({})
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [beltColor, setBeltColor] = useState('white')
    const [stripeCount, setStripeCount] = useState(0)
    const [role, setRole] = useState('student')


    useEffect(() => {
        setUserTypes(props.userTypes || [])
    }, [props.userTypes])

    useEffect(() => {
        setAlert(props.alert)
    }, [props.alert])

    useEffect(() => {
        if (props.user) {
            let user = props.user

            if (!user.type) {
                user.role = userTypes && userTypes[userTypes.length - 1] ? userTypes[userTypes.length - 1].value : ''
            } else {
                user.role = user.type
            }

            if (!user.beltColor) {
                user.beltColor = belts && belts[0] ? belts[0].value : ''
            }

            setUser(user)
            setFirstName(user.firstName || '')
            setLastName(user.lastName || '')
            setEmail(user.email || '')
            setBeltColor(user.beltColor || 'white')
            setStripeCount(user.stripeCount || 0)
            setRole(user.role || 'student')
        }
    }, [props.user])

    const onShow = () => {
        setValidated(false)
        setAlert('')
        setUser(user || {})
        setFirstName(user.firstName || '')
        setLastName(user.lastName || '')
        setEmail(user.email || '')
        setBeltColor(user.beltColor || 'white')
        setStripeCount(user.stripeCount || 0)
        setRole(user.role || 'student')
    }

    const onSubmit = (event) => {
        const form = event.currentTarget
        event.preventDefault()
        event.stopPropagation()
        setValidated(true)

        if (!form.checkValidity()) {
            return
        }

        props.onSubmit(Object.assign({}, user, {
            firstName,
            lastName,
            email,
            beltColor,
            stripeCount,
            role,
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
            <Form noValidate validated={validated} onSubmit={onSubmit} ref={formRef}>
                <Form.Row>
                    <Form.Group as={Col} controlId="firstName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control type="text" placeholder="Enter First Name" required onChange={(e) => setFirstName(e.target.value)} value={firstName} />
                    </Form.Group>
                    <Form.Group as={Col} controlId="lastName">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control type="text" placeholder="Enter Last Name" required onChange={(e) => setLastName(e.target.value)} value={lastName} />
                    </Form.Group>
                </Form.Row>
                <Form.Group controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="Enter Email" required onChange={(e) => setEmail(e.target.value)} value={email} />
                </Form.Group>
                <Form.Row>
                    <Form.Group as={Col} controlId="beltColor">
                        <Form.Label>Belt Color</Form.Label>
                        <Form.Control as="select" required onChange={(e) => setBeltColor(e.target.value)} value={beltColor}>
                            {belts.map((belt, i) => {
                                return <option key={i} value={belt.value}>{belt.label}</option>
                            })}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col} controlId="stripeCount">
                        <Form.Label>Number of Stripes</Form.Label>
                        <Form.Control type="number" placeholder="Number of Stripes" required onChange={(e) => setStripeCount(e.target.value)} value={stripeCount} />
                    </Form.Group>
                </Form.Row>
                <Form.Group controlId="role">
                    <Form.Label>User Type</Form.Label>
                    <Form.Control as="select" required onChange={(e) => setRole(e.target.value)} value={role}>
                        {userTypes.map((type, i) => {
                            return <option key={i} value={type.value}>{type.label}</option>
                        })}
                    </Form.Control>
                </Form.Group>
                <Button variant="primary" type="submit" className="float-right">
                    Submit
                </Button>
            </Form>
        </Modal.Body>
    </Modal>
}