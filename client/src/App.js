import React from 'react';
import axios from 'axios';
import './App.css';

const App = () => {


  async function runServer() {
    console.log('trying to call axios server');
    try {
      const response = await axios.get('http://localhost:6000/auth');
      const data = response.data;
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="App">
      <h1>Hello world.</h1>
      <button onClick={runServer}>information</button>
    </div>
  );
}

export default App;
