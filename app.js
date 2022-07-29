import './App.css';
import "bootstrap/dist/css/bootstrap.css";
//import Table from 'react-bootstrap/Table';


import { HashRouter, Route,Switch } from "react-router-dom";
  
//import Layout from './Layout';
import Tables from './Tables';
import RunData from './RunData';
import Predict from './Predict';
import Navbar from './components/Navbar';

import Check2 from './Table/Check2';
import Check3 from './Table/Check3';
import Check4 from './Table/Check4';


function App() {
  return (


    <HashRouter>
      <Navbar />
      <Switch>
          <Route exact path="/">
            <Tables/>
          </Route>
          <Route path="/rundata">
            <RunData/>
          </Route>
          <Route path="/predict">
            <Predict/>
          </Route>


      </Switch>
    </HashRouter>

    
  );
}

export default App;
