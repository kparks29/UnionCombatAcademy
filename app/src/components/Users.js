import React, { useContext, useEffect, useState } from 'react'
import './Users.css'
import { AuthContext } from '../contexts/AuthContext'
import { ListGroup, Button, Alert } from 'react-bootstrap'
import backgroundImage from '../assets/JJJimage.png'
import { UserContext } from '../contexts/UserContext'
import { AddEditUserModal } from './AddEditUserModal'
import * as _ from 'lodash'

export const Users = () => {
    const { isAuthenticated, currentProgram, currentUser } = useContext(AuthContext)
    const { getUsersByProgram, getUsersByAccount, createUser, updateUser } = useContext(UserContext)
    const [ users, setUsers ] = useState([])
    const [ accountUsers, setAccountUsers ] = useState([])
    const [ showAddEditUserModal, setShowAddEditUserModal ] = useState(false)
    const [ modalTitle, setModalTitle ] = useState('')
    const [ userTypes, setUserTypes ] = useState([])
    const [ alert, setAlert ] = useState('')
    const [ selectedUser, setSelectedUser ] = useState({})

    useEffect(() => {
        if (isAuthenticated && currentProgram && currentUser) {
            let userIds
            getUsersByProgram(currentProgram.id).then(results => {
                userIds = results.map(user => user.id)
                setUsers(results || [])
                return getUsersByAccount()
            }).then(results => { 
                let userList = results.filter(user => userIds.includes(user.id)) || []
                setAccountUsers(userList)
            }).catch(err => {
                console.log(err)
            })

            let types = []

            let role = currentUser.roles.find(role => role.programId === currentProgram.id)
            if (role) {
                switch (role.role) {
                    case 'owner':
                        types.push({ label: 'Instructor', value: 'instructor' })
                    case 'instructor':
                        types.push({ label: 'Student', value: 'student' })
                        break
                    default:
                        break
                }

                setUserTypes(types)
            }
        }
    }, [isAuthenticated, currentProgram, currentUser])

    const onAddUserClicked = () => {
        setSelectedUser({
            accountId: currentProgram.accountId,
            programId: currentProgram.id
        })
        setModalTitle(`Add User to ${currentProgram.name}`)
        setShowAddEditUserModal(true)
    }

    const onAddEditUserSubmit = async (data) => {
        try {
            let user

            if (data && data.id) {
                let results = await updateUser(data)

                results.roles.forEach(role => {
                    if (role.programId === currentProgram.id) {
                        results.user.type = role.role
                    }
                })

                user = results.user

                for (let i=0; i<users.length; i++) {
                    if (user.id === users[i].id) {
                        users[i] = user
                    }
                }
            } else {
                user = await createUser(data)
                users.push(user)
            }
            
            setSelectedUser(user)
            setUsers(users)
            setAccountUsers(accountUsers.filter(accountUser => accountUser.id === user.id) || [])
            setShowAddEditUserModal(false)
            setAlert('')
        } catch (error) {
            setAlert(error)
        }
    }

    const onEditUserClicked = (user) => {
        setSelectedUser({ ...user, programId: currentProgram.id })
        setModalTitle(`Edit User`)
        setShowAddEditUserModal(true)
    }

    return (
        <div className="Users" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <AddEditUserModal
                show={showAddEditUserModal} onHide={() => setShowAddEditUserModal(false)}
                title={modalTitle} userList={accountUsers} onSubmit={onAddEditUserSubmit}
                userTypes={userTypes} alert={alert} user={selectedUser}
            ></AddEditUserModal>
            <h2>Users <Button onClick={onAddUserClicked}>Add User</Button></h2>
            <ListGroup>
                {users.map((user, i) => {
                    return <ListGroup.Item key={i} className="user" onClick={() => onEditUserClicked(user)}>
                        {user.firstName} {user.lastName} ({_.capitalize(user.type)})
                    </ListGroup.Item>
                })}
            </ListGroup>
        </div>
    )
}