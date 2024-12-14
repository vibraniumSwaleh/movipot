import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
import StartRating from './StarRating';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <App /> */}
    <StartRating maxRating={6} />
    <StartRating maxRating={4} color='red' size='24' />
    <StartRating
      maxRating={4}
      color='blue'
      size='32'
      messages={['Very good', 'Good', 'Bad', 'Very bad']}
    />
  </React.StrictMode>,
);
