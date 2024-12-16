import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import StartRating from './StarRating';
import { useState } from 'react';

function Test() {
  const [movieRating, setMovieRating] = useState(0);

  function handleSetMovieRating(ratings) {
    setMovieRating(ratings);
  }

  return (
    <div>
      <StartRating onSetRating={handleSetMovieRating} />
      <p>This movie was rated {movieRating} stars</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    {/* <StartRating maxRating={4} color='red' size='24' /> */}
    {/* <Test /> */}
    {/* <StartRating
      maxRating={4}
      color='blue'
      size='32'
      messages={['Very good', 'Good', 'Bad', 'Very bad']}
    /> */}
  </React.StrictMode>,
);
