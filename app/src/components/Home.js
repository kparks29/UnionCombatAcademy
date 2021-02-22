import React, { useContext, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import './Home.css'

import { AuthContext } from '../contexts/AuthContext'
import logo from '../logo.svg'

import axios from 'axios'

export const Home = () => {
    const history = useHistory()
    const { isAuthenticated, getAccessToken } = useContext(AuthContext)

    useEffect(() => {
        if (!isAuthenticated) {
            history.push('/login')
        } else {
            axios.get('/programs', {headers: { Authorization: getAccessToken() }}).catch(err => {
                return Promise.reject(`Unable to Login. ${err}.`)
            })
        }
    }, [isAuthenticated, history])

    return (
        <div className="Home">
            <img src={logo} className="App-logo" alt="logo" />
        </div>
    )
}