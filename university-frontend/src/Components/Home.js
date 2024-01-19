import React from 'react';
import { useHistory } from 'react-router-dom'; // Import useHistory from react-router-dom
import University from './University'; // Import the University component
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';

import '../CssDesigns/Home.css';

const Home = () => {
  const history = useHistory();

  const navigateToPage = (page) => {
    history.push(`/${page.toLowerCase()}`);
  };

  const renderBox = (label) => (
    <div className="box" onClick={() => navigateToPage(label)}>
      {label}
    </div>
  );

  return (
    <div className='homeDiv'>
      <div className="box-container">
        {renderBox('University')}
        {renderBox('Department')}
        {renderBox('Teacher')}
        {/* Add more boxes as needed */}
      </div>

      {/* Add a Switch to handle routing */}
      <Switch>
        {/* Add a Route for the University component */}
        <Route path="/university" component={University} />
        {/* Add more Routes for other components as needed */}
      </Switch>
    </div>
  );
};

export default Home;
