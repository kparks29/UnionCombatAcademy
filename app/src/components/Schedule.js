import React, { useContext, useEffect, useState } from 'react'
import './Schedule.css'
import { AuthContext } from '../contexts/AuthContext'
import { ScheduleContext } from '../contexts/ScheduleContext'
import { Container, Row, Col, Button } from 'react-bootstrap'
import * as _ from 'lodash'
import { AddEditScheduleModal } from './AddEditScheduleModal'

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
                    setSchedules(results)
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

                for (let i = 0; i < schedules.length; i++) {
                    if (schedule.id === schedules[i].id) {
                        schedules[i] = schedule
                    }
                }
            } else {
                schedule = await createSchedule(data)
                schedules.push(schedule)
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
        <div className="Schedules">
            <h2>Schedule {isAdmin ? <Button onClick={onAddScheduleClicked}>Add Schedule</Button> : ''}</h2>
            <AddEditScheduleModal
                show={showAddEditScheduleModal} onHide={() => setShowAddEditScheduleModal(false)}
                title={modalTitle} schedule={selectedSchedule} onSubmit={onAddEditScheduleSubmit}
                alert={alert}
            ></AddEditScheduleModal>
            <Container>
            {schedules.map((schedule, i) => {
                return <Row key={i} className={isAdmin ? 'schedule' : ''} onClick={() => onEditScheduleClicked(schedule)}>
                    <Col>{schedule.date}: {schedule.start} - {schedule.end}</Col>
                </Row>
            })}
            </Container>

        </div>
    )
}