import React, { createContext, useContext } from 'react'
import { AuthContext } from './AuthContext'
import axios from 'axios'

export const ScheduleContext = createContext()

export const ScheduleContextProvider = (props) => {
    const { getAccessToken } = useContext(AuthContext)

    const getSchedulesByProgramId = async (programId) => {
        let token = getAccessToken()
        let results = await axios.get(`/schedules?programId=${programId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => {
            return Promise.reject(`Unable to Get Schedule. ${err}.`)
        })

        return results.data.schedules
    }

    return (
        <ScheduleContext.Provider value={{ getSchedulesByProgramId }}>
            {props.children}
        </ScheduleContext.Provider>
    )
}