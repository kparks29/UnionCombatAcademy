import React, { useContext, useEffect, useState } from 'react'
import './News.css'
import { AuthContext } from '../contexts/AuthContext'
import { UserContext } from '../contexts/UserContext'
import { Container, Row, Col, Card } from 'react-bootstrap'
import * as _ from 'lodash'

export const Rankings = () => {
    const { isAuthenticated, currentProgram } = useContext(AuthContext)
    const { getUsers } = useContext(UserContext)
    const [ users, setUsers ] = useState([])
    const [ belts, setBelts ] = useState({})
    const beltColors = [
        'white', 'yellow', 'orange', 'green', 'gray', 'blue', 
        'black', 'blackred', 'blackwhite', 'red'
    ]

    useEffect(() => {
        if (isAuthenticated && currentProgram) {
            getUsers(currentProgram.id).then(results => {
                if (results) {
                    setUsers(results)
                }
            }).catch(err => {
                console.log(err)
            })
        }
    }, [isAuthenticated, currentProgram])

    useEffect(async () => {
        let beltImages = {}
        await Promise.all(beltColors.map(beltColor => {
            import(`../assets/${beltColor}belt.png`).then(image => beltImages[beltColor] = image.default)
        }))
        setBelts(beltImages)
    }, [])

    return (
        <div className="Rankings">
            <h2>Rankings</h2>
            {users.map((user, i) => {
                return <Card key={i}>
                    <Card.Body>
                        <Card.Title>{user.firstName} {user.lastName}</Card.Title>
                        {!belts[user.beltColor] ? '' : <img src={belts[user.beltColor]} alt={user.beltColor + ' belt'} />}
                        <br />{user.stripeCount} Stripes
                    </Card.Body>
                </Card>
            })}

        </div>
    )
}