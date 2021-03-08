import React, { createContext, useState, useEffect, useContext } from 'react'
import { AuthContext } from './AuthContext'
import axios from 'axios'

export const UserContext = createContext()

export const UserContextProvider = (props) => {
    const { getAccessToken } = useContext(AuthContext)
    const [users, setUsers] = useState([])


    const getUserByProgram = async (programId) => {
        let token = getAccessToken()
        let results = await axios.get(`/programs/${programId}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => {
            return Promise.reject(`Unable to Get Users. ${err}.`)
        })

        if (results && results.data) {
            setUsers(results.data.users || [])
        }

        return results.data.users
    }

    return (
        <UserContext.Provider value={{ users, getUserByProgram }}>
            {props.children}
        </UserContext.Provider>
    )
}