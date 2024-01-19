import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';
import './App.css';
import Login from './Components/Login';
import Home from './Components/Home';
import Header from './Components/Header';
import University from './Components/University';
import LeftSidebar from './Components/LeftSidebar';

import UserProfile from './Components/UserProfile';

import Dashboard from './Components/Dashboard';



const PrivateRoute = ({ component: Component, isLoggedIn, userId, token, ...rest }) => (
  
<Route
    {...rest}
    render={props => isLoggedIn ? <Component userId={userId} token={token} {...props} /> : <Redirect to="/" />}
  />
);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [isNotificationVisible, setNotificationVisible] = useState(false); // Add this state variable

  const handleLogin = (role, token, userId) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setToken(token);
    setUserId(userId);
    setUsername('');
    const userData = { isLoggedIn: true, userRole: role, token, userId };
    sessionStorage.setItem('userData', JSON.stringify(userData));
    console.log(token);
    console.log(role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('');
    setUserId('');
    sessionStorage.removeItem('userData');
  };
  const handleCloseNotification = () => {
    setNotificationVisible(false);
  };
  useEffect(() => {
    const storedUserData = sessionStorage.getItem('userData');
    if (storedUserData) {
      const { isLoggedIn, userRole, token, userId } = JSON.parse(storedUserData);
      setIsLoggedIn(isLoggedIn);
      setUserRole(userRole);
      setToken(token);
      setUserId(userId);
    }
  }, []);

  return (
    <div className="App">
      <Router>
        {isLoggedIn && <Header token={token} userId={userId} handleLogout={handleLogout} userRole={userRole} />}
        <div className="app-content">
        {isLoggedIn && <LeftSidebar token={token} userId={userId} />}
          <div className="main-content">
            <Switch>
              <Route exact path="/">
                {isLoggedIn ? <Redirect to="/home" /> : <Login handleLogin={handleLogin} />}
              </Route>
              <PrivateRoute
                path="/home"
                component={Home}
                isLoggedIn={isLoggedIn}
                userId={userId}
                token={token}
              />
              <PrivateRoute
                path="/university"
                component={University}
                isLoggedIn={isLoggedIn}
                userId={userId}
                token={token}
              />
              <PrivateRoute
                path="/user"
                component={UserProfile}
                isLoggedIn={isLoggedIn}
                userId={userId}
                token={token}
              />
              <PrivateRoute
                path="/dashboard"
                component={Dashboard}
                isLoggedIn={isLoggedIn}
                userId={userId}
                token={token}
                userRole={userRole}
              />

              {/* Add more routes as needed */}
            </Switch>
          </div>
        </div>
      </Router>
    </div>
  );
  
};

export default App;
