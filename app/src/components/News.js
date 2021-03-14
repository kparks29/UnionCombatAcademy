import React, { useContext, useEffect, useState } from 'react'
import './News.css'
import { AuthContext } from '../contexts/AuthContext'
import { NewsContext } from '../contexts/NewsContext'
import { ListGroup, Button } from 'react-bootstrap'
import backgroundImage from '../assets/JJJimage.png'
import { AddEditNewsModal } from './AddEditNewsModal'

export const News = () => {
    const { isAuthenticated, currentProgram, currentUser } = useContext(AuthContext)
    const { getNews, createNews, updateNews } = useContext(NewsContext)
    const [ news, setNews ] = useState([])
    const [ selectedNews, setSelectedNews ] = useState({})
    const [ showAddEditNewsModal, setShowAddEditNewsModal ] = useState(false)
    const [ modalTitle, setModalTitle ] = useState('')
    const [ alert, setAlert ] = useState('')
    const [ isAdmin, setIsAdmin ] = useState(false)
    
    useEffect(() => {
        if (isAuthenticated && currentProgram && currentUser) {
            getNews(currentProgram.id).then(results => {
                setNews(results || [])
            }).catch(err => {
                console.log(err)
            })

            let role = currentUser.roles.find(role => role.programId === currentProgram.id)
            if (role && ['admin', 'owner', 'instructor'].includes(role.role)) {
                setIsAdmin(true)
            }
        }
    }, [isAuthenticated, currentProgram, currentUser])

    const onAddNewsClicked = () => {
        setSelectedNews({
            programId: currentProgram.id
        })
        setModalTitle(`Add News Article for ${currentProgram.name}`)
        setShowAddEditNewsModal(true)
    }

    const onAddEditNewsSubmit = async (data) => {
        try {
            let article

            if (data && data.id) {
                article = await updateNews(data)

                for (let i = 0; i < news.length; i++) {
                    if (article.id === news[i].id) {
                        news[i] = article
                    }
                }
            } else {
                article = await createNews(data)
                news.push(article)
            }

            setSelectedNews(article)
            setNews(news)
            setShowAddEditNewsModal(false)
            setAlert('')
        } catch (error) {
            setAlert(error)
        }
    }

    const onEditNewsClicked = (article) => {
        if (isAdmin) {
            setSelectedNews(article)
            setModalTitle('Edit News')
            setShowAddEditNewsModal(true)
        }
    }

    return (
        <div className="News" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <AddEditNewsModal
                show={showAddEditNewsModal} onHide={() => setShowAddEditNewsModal(false)}
                title={modalTitle} news={selectedNews} onSubmit={onAddEditNewsSubmit}
                alert={alert} 
            ></AddEditNewsModal>
            <h2>Latest News {isAdmin ? <Button onClick={onAddNewsClicked}>Add News</Button> : ''}</h2>
            <ListGroup>
                {news.map((article, i) => {
                    return <ListGroup.Item key={i} className={isAdmin ? 'news' : ''} onClick={() => onEditNewsClicked(article)}>
                        <h4>{article.title}</h4>
                        <p>{article.message}</p>
                    </ListGroup.Item>
                })}
            </ListGroup>
            
        </div>
    )
}