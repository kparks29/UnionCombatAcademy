import React, { useContext } from 'react'
import { BrowserRouter, Route, Switch, useHistory } from 'react-router-dom'
import { Navbar, Nav } from 'react-bootstrap'
import './App.css';
import { Home } from './components/Home';
import { Login } from './components/Login';
import { AuthContextProvider, AuthContext } from './contexts/AuthContext';
import { ProgramContextProvider } from './contexts/ProgramContext';
import * as _ from 'lodash'
import axios from 'axios'


const Navigation = () => {
  const history = useHistory()
  const { isAuthenticated, logout, currentUser, refreshToken } = useContext(AuthContext)

  const interceptor = axios.interceptors.response.use(
    response => response,
    async error => {
      // Reject promise if usual error
      if (error.response.status !== 401) {
        return Promise.reject(error);
      }

      axios.interceptors.response.eject(interceptor);

      return refreshToken().then(response => {
        error.response.config.headers['Authorization'] = `Bearer ${response.accessToken}`;
        return axios(error.response.config);
      }).catch(error => {
        // history.push('/login');
        return Promise.reject(error);
      })
    }
  )

  const navigateTo = (location) => {
    if (location) {
      history.push(location)
    }
  }

  const handleLogout = () => {
    logout()
    navigateTo('/login')
  }
  
  

  const loginButton = <Nav.Item><Nav.Link onClick={() => navigateTo('/login')}>Login</Nav.Link></Nav.Item>
  const logoutButton = <Nav.Item><Nav.Link onClick={() => handleLogout()}>Logout</Nav.Link></Nav.Item>

  return (
    <Navbar expand="lg" bg="dark" variant="dark" className="justify-content-between" collapseOnSelect>
      <Navbar.Brand onClick={() => navigateTo('/')}>Union Combat Academy</Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end">
        <Nav >
          {/* <Nav.Item>
            <Nav.Link onClick={() => navigateTo('/')}>Home</Nav.Link>
          </Nav.Item> */}
          <Nav.Item><Nav.Link disabled>{!_.isEmpty(currentUser) ? `Welcome ${currentUser.firstName || ''} ${currentUser.lastName || ''}` : ''}</Nav.Link></Nav.Item>
          {isAuthenticated ? logoutButton : loginButton}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

function App() {
  return (
    <div className="App">
        <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
          <AuthContextProvider>
          <ProgramContextProvider>
            <Navigation />
              <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/login" component={Login} />
              </Switch>
          </ProgramContextProvider>
          </AuthContextProvider>
        </BrowserRouter>
    </div>
  )
}

export default App;
