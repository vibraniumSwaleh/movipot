import { useEffect, useRef, useState } from 'react';
import StartRating from './StarRating';
import useMovies from './useMovies';
import useLocalStorageState from './useLocalStorageState';
import useKey from './useKey';

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = '9a2671d6';

export default function App() {
  const [watched, setWatched] = useLocalStorageState([], 'watched');
  const [query, setQuery] = useState('');
  const [selectedMovieID, setSelectedMovieID] = useState(null);

  function handleCloseMovie() {
    setSelectedMovieID(null);
  }

  function handleSelectedMovie(movieID) {
    setSelectedMovieID((selectedMovieID) =>
      selectedMovieID === movieID ? handleCloseMovie() : movieID,
    );
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeletWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  const { movies, isLoading, loadingError } = useMovies(query);

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !loadingError && (
            <MovieList movies={movies} onSelect={handleSelectedMovie} />
          )}
          {loadingError && <ErrorMessage message={loadingError} />}
        </Box>

        <Box>
          {selectedMovieID ? (
            <MovieDetails
              movieID={selectedMovieID}
              onCloseMobie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatched={handleDeletWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

///////////// NavBar ////////////
function NavBar({ children }) {
  return (
    <nav className='nav-bar'>
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className='logo'>
      <span role='img'>🍿</span>
      <h1>MoviPot</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey('Enter', function () {
    if (document.activeElement === inputEl.current) return;

    inputEl.current.focus();
    setQuery('');
  });

  return (
    <input
      className='search'
      type='text'
      placeholder='Search movies...'
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className='num-results'>
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

///////////// MAIN ////////////
function Main({ children }) {
  return <main className='main'>{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className='box'>
      <Button isOpen={isOpen} setIsOpen={setIsOpen} />
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelect }) {
  return (
    <ul className='list list-movies'>
      {movies?.map((movie) => (
        <Movie key={movie.imdbID} movie={movie} onSelect={onSelect} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelect }) {
  return (
    <li key={movie.imdbID} onClick={() => onSelect(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ movieID, onCloseMobie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('');

  const countRef = useRef(0);

  useEffect(
    function () {
      if (userRating) countRef.current = countRef.current++;
    },
    [userRating],
  );

  const isWatched = watched.map((movie) => movie.imdbID).includes(movieID);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === movieID,
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleOnAdd() {
    const newWatchedMovie = {
      imdbID: movieID,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      userRating,
      runtime: Number(runtime.split(' ').at(0)),
      countRatingDecisions: countRef.current,
    };

    onAddWatched(newWatchedMovie);
    onCloseMobie();
  }

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${movieID}`,
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }

      getMovieDetails();
    },
    [movieID],
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie: ${title}`;

      return function () {
        document.title = 'MoviPot';
      };
    },
    [title],
  );

  useKey('Escape', onCloseMobie);

  return (
    <div className='details'>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className='btn-back' onClick={onCloseMobie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie}`} />
            <div className='details-overview'>
              <h2>{title}</h2>
              <p>
                {released}&bull;{runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className='rating'>
              {!isWatched ? (
                <>
                  <StartRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating && (
                    <button className='btn-add' onClick={handleOnAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated the movie: <span>⭐</span> {watchedUserRating}
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className='summary'>
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <ul className='list'>
      {watched.map((movie) => (
        <WatchedMovie
          key={movie.imdbID}
          movie={movie}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button
          className='btn-delete'
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

function Button({ isOpen, setIsOpen }) {
  return (
    <button className='btn-toggle' onClick={() => setIsOpen((open) => !open)}>
      {isOpen ? '–' : '+'}
    </button>
  );
}

function Loader() {
  return <p className='loader'>Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className='error'>
      <span>🚫</span>
      {message}
      <span>🚫</span>
    </p>
  );
}
