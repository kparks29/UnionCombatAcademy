import React, { createContext, useState, useEffect, useContext } from 'react'
import { AuthContext } from './AuthContext'
import axios from 'axios'
import * as _ from 'lodash'

export const NewsContext = createContext()

export const NewsContextProvider = (props) => {
    const { getAccessToken } = useContext(AuthContext)

    const getNews = async (programId) => {
        let token = getAccessToken()
        let results = await axios.get(`/news?programId=${programId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => {
            return Promise.reject(`Unable to Get News. ${err}.`)
        })

        return results.data.news
    }

    const createNews = async (data) => {
        let token = getAccessToken()
        let results = await axios.post(`/news`, data, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => {
            return Promise.reject(_.get(err, 'response.data.error') || 'Unable to create News')
        })

        return results.data.news
    }

    const updateNews = async (data) => {
        let token = getAccessToken()
        let results = await axios.put(`/news/${data.id}`, data, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => {
            return Promise.reject(_.get(err, 'response.data.error') || 'Unable to update News')
        })

        return results.data.news
    }

    return (
        <NewsContext.Provider value={{ getNews, createNews, updateNews }}>
            {props.children}
        </NewsContext.Provider>
    )
}