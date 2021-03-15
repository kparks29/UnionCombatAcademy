import React, { createContext, useContext } from 'react'
import { AuthContext } from './AuthContext'
import axios from 'axios'
import * as _ from 'lodash'

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

    const createSchedule = async (data) => {
        let token = getAccessToken()
        let results = await axios.post(`/schedules`, data, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => {
            return Promise.reject(_.get(err, 'response.data.error') || 'Unable to create schedule')
        })

        return results.data.schedule
    }

    const updateSchedule = async (data) => {
        let token = getAccessToken()
        let results = await axios.put(`/schedules/${data.id}`, data, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => {
            return Promise.reject(_.get(err, 'response.data.error') || 'Unable to update Schedule')
        })

        return results.data.schedule
    }

    return (
        <ScheduleContext.Provider value={{ getSchedulesByProgramId, createSchedule, updateSchedule }}>
            {props.children}
        </ScheduleContext.Provider>
    )
}