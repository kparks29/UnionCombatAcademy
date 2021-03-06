import React, { useContext, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Navbar, Nav, NavDropdown } from 'react-bootstrap'
import * as _ from 'lodash'
import axios from 'axios'
import { AuthContext } from '../contexts/AuthContext'

export const Navigation = () => {
    const history = useHistory()
    const { isAuthenticated, logout, currentUser, currentProgram, refreshToken } = useContext(AuthContext)
    const navLinks = [
        { label: 'News', url: '/news' },
        { label: 'Rankings', url: '/rankings' },
        { label: 'Schedule', url: '/schedule' }
    ]
    const adminLinks = [
        { label: 'Users', url: '/users' }
    ]

    const interceptor = axios.interceptors.response.use(
        response => response,
        async error => {
            // Reject promise if usual error
            if (error.response.status !== 401) {
                return Promise.reject(error);
            }

            axios.interceptors.response.eject(interceptor);

            return refreshToken().then(response => {
                error.response.config.headers['Authorization'] = `Bearer ${response.accessToken}`;
                return axios(error.response.config);
            }).catch(error => {
                history.push('/login');
                return Promise.reject(error);
            })
        }
    )

    const navigateTo = (location) => {
        if (location) {
            history.push(location)
        }
    }

    const handleLogout = () => {
        logout()
        navigateTo('/login')
    }

    let adminItems = ''

    useEffect(() => {
        if (isAuthenticated && !_.isEmpty(currentUser) && !_.isEmpty(currentProgram)) {
            currentUser.roles.forEach(role => {
                if (role.programId === currentProgram.id && ['teacher', 'owner', 'admin'].includes(role.role)) {
                    adminItems = <NavDropdown title="Admin">{adminLinks.map(link => {
                        return <NavDropdown.Item key={link.url}><Nav.Link onClick={() => navigateTo(link.url)}>{link.label}</Nav.Link></NavDropdown.Item>
                    })}</NavDropdown>
                }
            })
        }
    }, [isAuthenticated, currentUser, currentProgram])

    const loginButton = <Nav.Item><Nav.Link onClick={() => navigateTo('/login')}>Login</Nav.Link></Nav.Item>
    const logoutButton = <NavDropdown.Item key="logout" onClick={() => handleLogout()}>Logout</NavDropdown.Item>

    return (
        <Navbar expand="lg" bg="dark" variant="dark" className="justify-content-between" collapseOnSelect animation="false">
            <Navbar.Brand onClick={() => navigateTo('/')}>Union Combat Academy</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end" animation="false">
                <Nav>
                    {isAuthenticated}
                    {isAuthenticated ? navLinks.map(link => {
                        return <Nav.Item key={link.url}><Nav.Link onClick={() => navigateTo(link.url)}>{link.label}</Nav.Link></Nav.Item>
                    }) : ''}
                    {adminItems}
                    {!_.isEmpty(currentUser) && isAuthenticated ?
                        <NavDropdown bg="dark" variant="dark" title={`Welcome ${currentUser.firstName || ''} ${currentUser.lastName || ''}`}>
                            {logoutButton}
                        </NavDropdown> :
                        loginButton
                    }
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    )
}