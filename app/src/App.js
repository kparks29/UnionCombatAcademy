import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import './App.css';
import { Home } from './components/Home';
import { Login } from './components/Login';
import { Navigation } from './components/Navigation';
import { News } from './components/News';
import { Rankings } from './components/Rankings';
import { AuthContextProvider } from './contexts/AuthContext';
import { NewsContextProvider } from './contexts/NewsContext';
import { ProgramContextProvider } from './contexts/ProgramContext';
import { UserContextProvider } from './contexts/UserContext';

function App() {
  return (
    <div className="App">
        <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
          <AuthContextProvider>
          <ProgramContextProvider>
          <NewsContextProvider>
          <UserContextProvider>
            <Navigation />
              <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/login" component={Login} />
                <Route path="/news" component={News} />
                <Route path="/rankings" component={Rankings} />
              </Switch>
          </UserContextProvider>
          </NewsContextProvider>
          </ProgramContextProvider>
          </AuthContextProvider>
        </BrowserRouter>
    </div>
  )
}

export default App;
