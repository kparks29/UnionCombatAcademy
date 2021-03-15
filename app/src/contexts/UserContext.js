import React, { createContext, useState, useEffect, useContext } from 'react'
import { AuthContext } from './AuthContext'
import axios from 'axios'
import * as _ from 'lodash'

export const UserContext = createContext()

export const UserContextProvider = (props) => {
    const { getAccessToken } = useContext(AuthContext)

    const getUsersByProgram = async (programId) => {
        let token = getAccessToken()
        let results = await axios.get(`/programs/${programId}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => {
            return Promise.reject(`Unable to Get Users. ${err}.`)
        })

        return results.data.users
    }

    const getUsersByAccount = async () => {
        let token = getAccessToken()
        let results = await axios.get(`/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => {
            return Promise.reject(`Unable to Get Users. ${err}.`)
        })

        return results.data.users
    }

    const createUser = async (data) => {
        let token = getAccessToken()
        let results = await axios.post(`/users`, data, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => {
            return Promise.reject(_.get(err, 'response.data.error') || 'Unable to create User')
        })

        results.data.user.type = results.data.roles[0].role
        return results.data.user
    }

    const updateUser = async (data) => {
        let token = getAccessToken()
        let results = await axios.put(`/users/${data.id}`, data, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => {
            return Promise.reject(_.get(err, 'response.data.error') || 'Unable to update User')
        })

        return {
            user: results.data.user,
            roles: results.data.roles
        }
    }

    const checkInUser = async (data) => {
        let token = getAccessToken()
        let results = await axios.post(`/attendance`, data, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => {
            return Promise.reject(_.get(err, 'response.data.error') || 'Unable to check in User')
        })

        return results.data.attendance
    }

    return (
        <UserContext.Provider value={{ getUsersByProgram, getUsersByAccount, createUser, updateUser, checkInUser }}>
            {props.children}
        </UserContext.Provider>
    )
}