import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const AuthContext = createContext()

export const AuthContextProvider = (props) => {
    // GETTERS and SETTERS
    const getAccessToken = () => {
        return localStorage.getItem('accessToken')
    }

    const setAccessToken = (token) => {
        if (token) {
            localStorage.setItem('accessToken', token)
        } else {
            localStorage.removeItem('accessToken')
        }

        setIsAuthenticated(!!token)
    }

    const getRefreshToken = () => {
        return localStorage.getItem('refreshToken')
    }

    const setRefreshToken = (token) => {
        if (token) {
            localStorage.setItem('refreshToken', token)
        } else {
            localStorage.removeItem('refreshToken')
        }

        setIsAuthenticated(!!token)
    }

    const getCurrentUser = () => {
        let user = localStorage.getItem('currentUser')
        return user && typeof user === 'string' ? JSON.parse(user) : (user || {})
    }

    const setCurrentUser = (user) => {
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user))
        } else {
            localStorage.removeItem('currentUser')
        }
        setUser(user || {})
    }

    // STATES
    const [currentUser, setUser] = useState(() => {
        return getCurrentUser()
    })
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!getAccessToken()
    })

    const [currentProgram, setCurrentProgram] = useState(() => {
        let program = localStorage.getItem('currentProgram')
        return program ? JSON.parse(program) : {}
    })

    // EFFECTS
    useEffect(() => {
        localStorage.setItem('currentProgram', JSON.stringify(currentProgram))
    }, [currentProgram])

    // METHODS
    const switchProgram = (program) => {
        setCurrentProgram(program)
    }

    const login = async (body) => {
        console.log('logging in')
        let results = await axios.post('/auth/login', body).catch(err => {
            return Promise.reject(`Unable to Login. ${err}.`)
        })

        if (results && results.data) {
            if (results.data.accessToken) {
                setAccessToken(results.data.accessToken)
            }
            if (results.data.refreshToken) {
                setRefreshToken(results.data.refreshToken)
            }
            if (results.data.user) {
                results.data.user.roles = results.data.roles || []
                setCurrentUser(results.data.user)
            }
        }
        return results
    }

    const refreshToken = async () => {
        let results = await axios.post('/auth/refresh', {}, {
            headers: {
                'Refresh-Token': getRefreshToken()
        }}).catch(err => {
            return Promise.reject(`Unable to refresh token. ${err}.`)
        })

        if (results && results.data) {
            if (results.data.accessToken) {
                setAccessToken(results.data.accessToken)
            }
            if (results.data.refreshToken) {
                setRefreshToken(results.data.refreshToken)
            }
        }

        return results.data
    }

    const logout = () => {
        setAccessToken(undefined)
        setRefreshToken(undefined)
        setCurrentUser({})
    }

    return (
        <AuthContext.Provider value={{ currentUser, isAuthenticated, currentProgram, getAccessToken, refreshToken, getCurrentUser, login, logout, switchProgram }}>
            {props.children}
        </AuthContext.Provider>
    )

}