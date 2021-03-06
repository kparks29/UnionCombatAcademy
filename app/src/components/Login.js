import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { Container, Form, Button } from 'react-bootstrap'
import { AuthContext } from '../contexts/AuthContext'
import * as _ from 'lodash'
import { ProgramContext } from '../contexts/ProgramContext'
import './Login.css'

export const Login = () => {
    const history = useHistory()
    const { login, currentProgram, switchProgram, getCurrentUser } = useContext(AuthContext)
    const { programs, getPrograms } = useContext(ProgramContext)

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const form = e.currentTarget

        try {
            await login({
                email: _.get(form, 'elements.email.value'),
                password: _.get(form, 'elements.password.value')
            })

            await getPrograms()

            let currentUser = getCurrentUser()

            if (currentUser && (_.isEmpty(currentProgram) || !currentUser.roles.map(role => role.programId).includes(currentProgram.id))) {
                if (currentUser.roles && currentUser.roles.length === 1) {
                    programs.forEach(program => {
                        if (program.id === currentUser.roles[0].programId) {
                            switchProgram(program)
                        }
                    })
                } else {
                    for (let i=0; i<currentUser.roles.length; i++) {
                        let program = _.find(programs, { 'id': currentUser.roles[i].programId })
                        if (program) {
                            switchProgram(program)
                            break
                        }
                    }
                }
            }

            history.push('/')
        } catch (err) {
            console.log(err)
        }
    }

    

    return (
        <div className="Login">
            <Container>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="email">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" />
                    </Form.Group>
                    <Form.Group controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Container>
        </div>
    )
}