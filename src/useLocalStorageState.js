import { useState, useEffect } from 'react';

function useLocalStorageState(initialState, key) {
  const [value, setValue] = useState(getStoredMovies);

  function getStoredMovies() {
    const storedValues = localStorage.getItem(key);
    return storedValues ? JSON.parse(storedValues) : initialState;
  }

  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key],
  );

  return [value, setValue];
}

export default useLocalStorageState;
