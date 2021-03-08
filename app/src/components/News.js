import React, { useContext, useEffect, useState } from 'react'
import './News.css'
import { AuthContext } from '../contexts/AuthContext'
import { NewsContext } from '../contexts/NewsContext'
import { Card } from 'react-bootstrap'
import backgroundImage from '../assets/JJJimage.png'

export const News = () => {
    const { isAuthenticated, currentProgram } = useContext(AuthContext)
    const { getNews } = useContext(NewsContext)
    const [ news, setNews ] = useState([])
    
    useEffect(() => {
        if (isAuthenticated && currentProgram) {
            getNews(currentProgram.id).then(results => {
                setNews(results || [])
            }).catch(err => {
                console.log(err)
            })
        }
    }, [isAuthenticated, currentProgram])

    return (
        <div className="News" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <h2>Latest News</h2>
                {news.map((article, i) => {
                    return <Card key={i}>
                        <Card.Body>
                            <Card.Title>{article.title}</Card.Title>
                            <Card.Text>{article.message}</Card.Text>
                        </Card.Body>
                    </Card>
                })}
            
        </div>
    )
}