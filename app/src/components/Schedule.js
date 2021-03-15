import React, { useContext, useEffect, useState } from 'react'
import './Schedule.css'
import { AuthContext } from '../contexts/AuthContext'
import { ScheduleContext } from '../contexts/ScheduleContext'
import { Container, Row, Col, Button, Card } from 'react-bootstrap'
import * as _ from 'lodash'
import { AddEditScheduleModal } from './AddEditScheduleModal'
import backgroundImage from '../assets/wood-background.png'

export const Schedule = () => {
    const { isAuthenticated, currentProgram, currentUser } = useContext(AuthContext)
    const { getSchedulesByProgramId, createSchedule, updateSchedule } = useContext(ScheduleContext)
    const [schedules, setSchedules] = useState([])
    const [selectedSchedule, setSelectedSchedule] = useState({})
    const [showAddEditScheduleModal, setShowAddEditScheduleModal] = useState(false)
    const [modalTitle, setModalTitle] = useState('')
    const [alert, setAlert] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        if (isAuthenticated && currentProgram && currentUser) {
            getSchedulesByProgramId(currentProgram.id).then(results => {
                if (results) {
                    let schedules = {}
                    results.forEach(schedule => {
                        if (schedules[schedule.day]) {
                            schedules[schedule.day].push(schedule)
                        } else {
                            schedules[schedule.day] = [schedule]
                        }
                    })
                    setSchedules(schedules)
                }
            }).catch(err => {
                console.log(err)
            })

            let role = currentUser.roles.find(role => role.programId === currentProgram.id)
            if (role && ['admin', 'owner', 'instructor'].includes(role.role)) {
                setIsAdmin(true)
            }
        }
    }, [isAuthenticated, currentProgram, currentUser])

    const onAddScheduleClicked = () => {
        setSelectedSchedule({
            programId: currentProgram.id
        })
        setModalTitle(`Add Schedule for ${currentProgram.name}`)
        setShowAddEditScheduleModal(true)
    }

    const onAddEditScheduleSubmit = async (data) => {
        try {
            let schedule

            if (data && data.id) {
                schedule = await updateSchedule(data)

                for (let i = 0; i < schedules[schedule.day].length; i++) {
                    if (schedule.id === schedules[i].id) {
                        schedules[i] = schedule
                    }
                }
            } else {
                schedule = await createSchedule(data)
                if (schedules[schedule.day]) {
                    schedules[schedule.day].push(schedule)
                } else {
                    schedules[schedule.day] = [schedule]
                }
            }

            setSelectedSchedule({
                ...schedule,
                programId: currentProgram.id
            })
            setSchedules(schedules)
            setShowAddEditScheduleModal(false)
            setAlert('')
        } catch (error) {
            setAlert(error)
        }
    }

    const onEditScheduleClicked = (schedule) => {
        if (isAdmin) {
            setSelectedSchedule({
                ...schedule,
                programId: currentProgram.id
            })
            setModalTitle('Edit Schedule')
            setShowAddEditScheduleModal(true)
        }
    }

    return (
        <div className="Schedules" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <h2>Schedule {isAdmin ? <Button onClick={onAddScheduleClicked}>Add Schedule</Button> : ''}</h2>
            <AddEditScheduleModal
                show={showAddEditScheduleModal} onHide={() => setShowAddEditScheduleModal(false)}
                title={modalTitle} schedule={selectedSchedule} onSubmit={onAddEditScheduleSubmit}
                alert={alert}
            ></AddEditScheduleModal>
            <Container>
                <Row>
                    {Object.keys(schedules).map(key => {
                        return <Card key={key} as={Col} md={4}>
                            <Card.Body>
                                <Card.Title>{key}</Card.Title>
                                <Card.Text>
                                    {schedules[key].map((schedule, i) => {
                                        return <p key={i} className={isAdmin ? 'schedule' : ''} onClick={() => onEditScheduleClicked(schedule)}>
                                            <strong>{schedule.start} to {schedule.end}</strong>{schedule.description ? ' - ' + schedule.description : ''}
                                        </p>
                                    })}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    })}
                </Row>
            </Container>

        </div>
    )
}