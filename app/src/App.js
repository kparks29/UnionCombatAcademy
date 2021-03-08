import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import './App.css';
import { Home } from './components/Home';
import { Login } from './components/Login';
import { Navigation } from './components/Navigation';
import { News } from './components/News';
import { Rankings } from './components/Rankings';
import { Schedule } from './components/Schedule';
import { AuthContextProvider } from './contexts/AuthContext';
import { NewsContextProvider } from './contexts/NewsContext';
import { ProgramContextProvider } from './contexts/ProgramContext';
import { UserContextProvider } from './contexts/UserContext';
import { ScheduleContextProvider } from './contexts/ScheduleContext';

function App() {
  return (
    <div className="App">
        <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
          <AuthContextProvider>
          <ProgramContextProvider>
          <NewsContextProvider>
          <UserContextProvider>
          <ScheduleContextProvider>
            <Navigation />
              <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/login" component={Login} />
                <Route path="/news" component={News} />
                <Route path="/rankings" component={Rankings} />
                <Route path="/schedule" component={Schedule} />
              </Switch>
          </ScheduleContextProvider>
          </UserContextProvider>
          </NewsContextProvider>
          </ProgramContextProvider>
          </AuthContextProvider>
        </BrowserRouter>
    </div>
  )
}

export default App;
