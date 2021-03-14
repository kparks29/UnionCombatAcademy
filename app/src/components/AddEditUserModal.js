import React, { useEffect, useState } from 'react'
import './Users.css'
import { Button, Modal, Form, Col } from 'react-bootstrap'
import * as _ from 'lodash'

export const AddEditUserModal = (props) => {
    const [validated, setValidated] = useState(false);
    const [belts] = useState([
        { label: 'White', value: 'white' }, { label: 'Gray', value: 'gray' }, { label: 'Yellow', value: 'yellow' },
        { label: 'Orange', value: 'orange' }, { label: 'Green', value: 'green' }, { label: 'Blue', value: 'blue' },
        { label: 'Purple', value: 'purple' }, { label: 'Brown', value: 'brown' }, { label: 'Black', value: 'black' },
        { label: 'Black/Red', value: 'blackred' }, { label: 'White/Red', value: 'whitered' }, { label: 'Red', value: 'red' }
    ])
    const [userTypes, setUserTypes] = useState([])
    const [user, setUser] = useState({})

    useEffect(() => {
        setUserTypes(props.userTypes || [])
    }, [props.userTypes])

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
        }
    }, [props.user])

    const onShow = () => {
        setValidated(false)
    }

    const onAddEditUserSubmit = (event) => {
        const form = event.currentTarget
        event.preventDefault()
        event.stopPropagation()
        setValidated(true)

        if (!form.checkValidity()) {
            return
        }

        props.onSubmit(Object.assign({}, user, {
            firstName: _.get(form, 'elements.firstName.value'),
            lastName: _.get(form, 'elements.lastName.value'),
            email: _.get(form, 'elements.email.value'),
            beltColor: _.get(form, 'elements.beltColor.value'),
            stripeCount: parseInt(_.get(form, 'elements.stripeCount.value')),
            role: _.get(form, 'elements.role.value')
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
            {props.alert}
            <Form noValidate validated={validated} onSubmit={onAddEditUserSubmit}>
                <p>
                    Add New or Existing User
                </p>
                <Form.Row>
                    <Form.Group as={Col} controlId="firstName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control type="text" placeholder="Enter First Name" required defaultValue={user.firstName} />
                    </Form.Group>
                    <Form.Group as={Col} controlId="lastName">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control type="text" placeholder="Enter Last Name" required defaultValue={user.lastName} />
                    </Form.Group>
                </Form.Row>
                <Form.Group controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="Enter Email" required defaultValue={user.email} />
                </Form.Group>
                <Form.Row>
                    <Form.Group as={Col} controlId="beltColor">
                        <Form.Label>Belt Color</Form.Label>
                        <Form.Control as="select" required defaultValue={user.beltColor}>
                            {belts.map((belt, i) => {
                                return <option key={i} value={belt.value}>{belt.label}</option>
                            })}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col} controlId="stripeCount">
                        <Form.Label>Number of Stripes</Form.Label>
                        <Form.Control type="number" placeholder="Number of Stripes" required defaultValue={user.stripeCount} />
                    </Form.Group>
                </Form.Row>
                <Form.Group controlId="role">
                    <Form.Label>User Type</Form.Label>
                    <Form.Control as="select" required defaultValue={user.role}>
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