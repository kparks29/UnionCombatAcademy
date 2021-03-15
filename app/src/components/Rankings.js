import React, { useContext, useEffect, useState } from 'react'
import './Rankings.css'
import { AuthContext } from '../contexts/AuthContext'
import { UserContext } from '../contexts/UserContext'
import { Button, Card } from 'react-bootstrap'
import * as _ from 'lodash'
import moment from 'moment'

export const Rankings = () => {
    const { isAuthenticated, currentProgram, currentUser } = useContext(AuthContext)
    const { getUsersByProgram, checkInUser } = useContext(UserContext)
    const [ users, setUsers ] = useState([])
    const [ belts, setBelts ] = useState({})
    const [ isLoading, setIsLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    const beltColors = [
        'white', 'yellow', 'orange', 'green', 'gray', 'blue', 
        'black', 'blackred', 'whitered', 'red'
    ]

    useEffect(() => {
        if (isAuthenticated && currentProgram && currentUser) {
            getUsersByProgram(currentProgram.id).then(results => {
                setIsLoading(false)
                if (results) {
                    let users = results.filter(user => user.type === 'student')
                    users.forEach(user => user.hasCheckedIn = hasCheckedIn(user))
                    setUsers(users)
                }
            }).catch(err => {
                setIsLoading(false)
                console.log(err)
            })

            let role = currentUser.roles.find(role => role.programId === currentProgram.id)
            if (role && ['admin', 'owner', 'instructor'].includes(role.role)) {
                setIsAdmin(true)
            }
        }
    }, [isAuthenticated, currentProgram, currentUser])

    useEffect(async () => {
        let beltImages = {}
        await Promise.all(beltColors.map(beltColor => {
            import(`../assets/${beltColor}belt.png`).then(image => beltImages[beltColor] = image.default)
        }))
        setBelts(beltImages)
    }, [])

    const hasCheckedIn = (user) => {
        let hasCheckedIn = false
        user.attendance.forEach(attendance => {
            if (moment(attendance.createdAt).isSame(new Date(), 'day')) {
                hasCheckedIn = true
            }
        })
        return hasCheckedIn
    }

    const onCheckIn = async (user) => {
        try {
            let attendance = await checkInUser({ programId: currentProgram.id, userId: user.id })
            user.attendance.push(attendance)
            user.hasCheckedIn = true

            let students = [...users]
            for (let i = 0; i < students.length; i++) {
                if (user.id === students[i].id) {
                    console.log('updating user', user)
                    students[i] = user
                }
            }

            setUsers(students)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className="Rankings">
            <h2>Rankings</h2>
            {isLoading ? <h4>Loading...</h4> :
                !users || users.length === 0 ? <h4>No Students added yet</h4> :
                users.map((user, i) => {
                    return <Card key={i}>
                        <Card.Body>
                            <Card.Title>{user.firstName} {user.lastName} {isAdmin ? !user.hasCheckedIn ? <Button onClick={() => onCheckIn(user)}>Check In</Button> : <Button disabled>Already Checked In</Button> : ''}</Card.Title>
                            {!belts[user.beltColor] ? '' : <img src={belts[user.beltColor]} alt={user.beltColor + ' belt'} />}
                            <br />{user.stripeCount} Stripes
                        </Card.Body>
                    </Card>
                })
            }

        </div>
    )
}