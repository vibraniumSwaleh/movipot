import { useState, useEffect } from 'react';

const KEY = '9a2671d6';

function useMovies(query, callBack) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState('');

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setLoadingError('');
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal },
          );
          if (!res.ok) throw new Error(' Something went wrong ');
          const data = await res.json();
          if (data.Response === 'False') throw new Error(' Movie not found ');

          setMovies(data.Search);
          setLoadingError('');
        } catch (error) {
          if (error.name !== 'AbortError') {
            setLoadingError(error.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setLoadingError('');
        return;
      }

      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query],
  );

  return { movies, isLoading, loadingError };
}

export default useMovies;
