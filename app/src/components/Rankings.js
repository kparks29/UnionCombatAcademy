import React, { useContext, useEffect, useState } from 'react'
import './News.css'
import { AuthContext } from '../contexts/AuthContext'
import { UserContext } from '../contexts/UserContext'
import { Container, Row, Col, Card } from 'react-bootstrap'
import * as _ from 'lodash'

export const Rankings = () => {
    const { isAuthenticated, currentProgram } = useContext(AuthContext)
    const { getUserByProgram } = useContext(UserContext)
    const [ users, setUsers ] = useState([])
    const [ belts, setBelts ] = useState({})
    const [ isLoading, setIsLoading] = useState(true)

    const beltColors = [
        'white', 'yellow', 'orange', 'green', 'gray', 'blue', 
        'black', 'blackred', 'blackwhite', 'red'
    ]

    useEffect(() => {
        if (isAuthenticated && currentProgram) {
            getUserByProgram(currentProgram.id).then(results => {
                setIsLoading(false)
                if (results) {
                    setUsers(results.filter(user => user.type === 'student'))
                }
            }).catch(err => {
                setIsLoading(false)
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
            {isLoading ? <h4>Loading...</h4> :
                !users || users.length === 0 ? <h4>No Students added yet</h4> :
                users.map((user, i) => {
                    return <Card key={i}>
                        <Card.Body>
                            <Card.Title>{user.firstName} {user.lastName}</Card.Title>
                            {!belts[user.beltColor] ? '' : <img src={belts[user.beltColor]} alt={user.beltColor + ' belt'} />}
                            <br />{user.stripeCount} Stripes
                        </Card.Body>
                    </Card>
                })
            }

        </div>
    )
}