import React, { useContext, useEffect, useState } from 'react'
import './Schedule.css'
import { AuthContext } from '../contexts/AuthContext'
import { ScheduleContext } from '../contexts/ScheduleContext'
import { Container, Row, Col, Card } from 'react-bootstrap'
import * as _ from 'lodash'

export const Schedule = () => {
    const { isAuthenticated, currentProgram } = useContext(AuthContext)
    const { getSchedulesByProgramId } = useContext(ScheduleContext)
    const [schedules, setSchedules] = useState([])

    useEffect(() => {
        if (isAuthenticated && currentProgram) {
            getSchedulesByProgramId(currentProgram.id).then(results => {
                if (results) {
                    setSchedules(results)
                }
            }).catch(err => {
                console.log(err)
            })
        }
    }, [isAuthenticated, currentProgram])

    return (
        <div className="Rankings">
            <h2>Schedule</h2>
            <Container>
            {schedules.map((schedule, i) => {
                return <Row key={i}>
                    <Col>{schedule.date}: {schedule.start} - {schedule.end}</Col>
                </Row>
            })}
            </Container>

        </div>
    )
}