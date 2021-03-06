import React, { createContext, useState, useEffect, useContext } from 'react'
import { AuthContext } from './AuthContext'
import axios from 'axios'

export const NewsContext = createContext()

export const NewsContextProvider = (props) => {
    const { getAccessToken } = useContext(AuthContext)
    const [news, setNews] = useState([])


    const getNews = async (programId) => {
        let token = getAccessToken()
        let results = await axios.get(`/news?programId=${programId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => {
            return Promise.reject(`Unable to Get News. ${err}.`)
        })

        if (results && results.data) {
            setNews(results.data.news || [])
        }

        return results.data.news
    }

    return (
        <NewsContext.Provider value={{ news, getNews }}>
            {props.children}
        </NewsContext.Provider>
    )
}