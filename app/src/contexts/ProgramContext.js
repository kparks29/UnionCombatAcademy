import React, { createContext, useState, useEffect, useContext } from 'react'
import { AuthContext } from './AuthContext'
import axios from 'axios'

export const ProgramContext = createContext()

export const ProgramContextProvider = (props) => {
    const { getAccessToken } = useContext(AuthContext)
    const [programs, setPrograms] = useState([])


    const getPrograms = async () => {
        let token = getAccessToken()
        let results = await axios.get('/programs', { 
            headers: {
                'Authorization': `Bearer ${token}`
            }}).catch(err => {
            return Promise.reject(`Unable to Get Programs. ${err}.`)
        })

        if (results && results.data) {
            setPrograms(results.data.programs || [])
        }

        return results.data.programs
    }

    return (
        <ProgramContext.Provider value={{ programs, getPrograms }}>
            {props.children}
        </ProgramContext.Provider>
    )
}