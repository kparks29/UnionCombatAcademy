import React, { useContext, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import './Home.css'
import { AuthContext } from '../contexts/AuthContext'
import logo from '../assets/unionCombatLogo.png'
import { Card } from 'react-bootstrap'
import * as _ from 'lodash'

export const Home = () => {
    const history = useHistory()
    const [ beltImage, setBeltImage ] = useState('')
    const { isAuthenticated, currentUser } = useContext(AuthContext)

    useEffect(() => {
        if (!isAuthenticated) {
            history.push('/login')
        } else if (isAuthenticated && currentUser) {
            import(`../assets/${currentUser.beltColor}belt.png`).then(image => {
                setBeltImage(image.default)
            })
        }
    }, [isAuthenticated, history, currentUser])

    return (
        <div className="Home">
            <img src={logo} className="App-logo mb-4" alt="logo" />
            {_.isEmpty(currentUser) ? '' : <Card bg="dark" text="white">
                <Card.Title>{currentUser.firstName} {currentUser.lastName}</Card.Title>
                <Card.Text>
                    <img src={beltImage} alt={currentUser.beltColor + ' belt'} /> 
                    <br />{currentUser.stripeCount} Stripes
                </Card.Text>
            </Card>}
        </div>
    )
}