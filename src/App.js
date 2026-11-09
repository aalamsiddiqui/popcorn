import { useEffect, useState } from "react";
import StarRating from './StarRating.js';

/* const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
]; */

const average = (arr) =>
  arr.length
    ? arr.reduce((sum, value) => sum + value, 0) / arr.length
    : 0;

const KEY = '8ba14f1e'
export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function handleSelectMovie(id) {
    setSelectedId(selectedId === id ? null : id);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(function() {
    
    const controller = new AbortController();

    async function fetchMovies() {
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(`https://www.omdbapi.com/?i=tt3896198&apikey=${KEY}&s=${query}`, { signal: controller.signal });

        if (!res.ok) {
          throw new Error("Something went wrong !!!");
        }
        const data = await res.json();
        if (data.Response === "False") throw new Error("Movie not found");
        setMovies(data.Search ?? []);
        setError("");
      }
        catch (err) {
          if (err.name !== "AbortError") {
            console.log(err);
            setError(err.message);  
          }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
      if (query.length < 3) {
      setMovies([]);
      setError("");
      setIsLoading(false);
      return;
    }
    
    }
    handleCloseMovie()

    fetchMovies();
    return function () { 
      controller.abort() 
    };
  }, [query]);

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : (
            <MovieList movies={movies} />
          )} */}
          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovie} />}
          {error && <ErrorMessage message={error} />}
        </Box>
        {selectedId ? (
          <Box>
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          </Box>
        ) : (
          <Box>
            <MovieSummary watched={watched} />
            <WatchedMovieList watched={watched} onDeleteWatched={handleDeleteWatched} />
          </Box>
        )}
      </Main>
    </>
  );
}

function Loader() {
  return (
    <div className="loader">
      <span>Loading...</span>
    </div>
  )
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>❌</span>
      {message}
    </p>
  )
}

function NavBar({ children }) {
  return(
    <nav className="nav-bar">
        <Logo />
        {children}
      </nav>
  )
}

function Logo() {
  return (
  <div className="logo">
          <span role="img">🍿</span>
          <h1>usePopcorn</h1>
        </div>
  )
}

function Search({ query, setQuery }) {
  return (
    <input
          className="search"
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
  )
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
          Found <strong>{movies.length}</strong> results
        </p>
  )
}

function Main({ children }) {
  return(
     <main className="main">
        {children}
      </main>
  )
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return(
    <div className="box">
          <button
            className="btn-toggle"
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? "–" : "+"}
          </button>
          {isOpen && children}
        </div>
  )
}
// function WatchedBox() {
//   const [watched, setWatched] = useState(tempWatchedData);
//   const [isOpen2, setIsOpen2] = useState(true);

  
//   return(
//     <div className="box">
//           <button
//             className="btn-toggle"
//             onClick={() => setIsOpen2((open) => !open)}
//           >
//             {isOpen2 ? "–" : "+"}
//           </button>
//           {isOpen2 && (
//             <>
//               <MovieSummary watched={tempWatchedData} />
//               <WatchedMovieList watched={tempWatchedData} />
//             </>
//           )}
//         </div>
//   )
// }

function MovieList({ movies, onSelectMovie }) {
  return(
    <ul className="list list-movies">
              {movies?.map((movie) => (
                <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
              ))}
            </ul>
  )
}
function Movie({ movie, onSelectMovie }) {
  return(
    <li key={movie.imdbID} onClick={() => onSelectMovie(movie.imdbID)}>
                  <img src={movie.Poster} alt={`${movie.Title} poster`} />
                  <h3>{movie.Title}</h3>
                  <div>
                    <p>
                      <span>📅</span>
                      <span>{movie.Year}</span>
                    </p>
                  </div>
                </li>
  )
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userRating, setUserRating] = useState(0);

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find((movie) => movie.imdbID === selectedId)?.userRating;


  useEffect(function() {
    const controller = new AbortController();
    setUserRating(0);

    async function getMovieDetails() {
      try {
        setMovie(null);
        setError("");
        setIsLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?i=${selectedId}&apikey=${KEY}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Something went wrong while loading movie details.");
        const data = await res.json();
        if (data.Response === "False") throw new Error(data.Error || "Movie not found.");
        setMovie(data);
      }
      catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    getMovieDetails();
    return () => controller.abort();
  }, [selectedId]);

  const {
    Title: title,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie || {};

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      Title: title,
      Year: Number(released.split("-")[0]),
      Poster: poster,
      runtime: Number(runtime.split(" ")[0]),
      imdbRating: Number(imdbRating),
      userRating,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  
  useEffect(function () {
    document.addEventListener("keydown", function (e) {
      if (e.code === "Escape") {
        onCloseMovie();
      }
    });

    return function () {
      document.removeEventListener("keydown", function (e) {
        if (e.code === "Escape") {
          onCloseMovie();
        }
      });
    }
  },[onCloseMovie]);

  useEffect(function () {
    if (!title) return;
    document.title = `Movie | ${title}`;
    
    return function () {
      document.title = "usePopcorn";
    }
  }, [title])

  return(
    <div className="details">
      {isLoading && <Loader />}
      {error && <ErrorMessage message={error} />}
      <header>
        <button className="btn-back" onClick={onCloseMovie}>
          &larr;
        </button>
        {movie && (
          <>
            <img src={poster} alt={`Poster of ${title}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>{released} &bull; {runtime}</p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                <span>{imdbRating} IMDb rating</span>
              </p>
            </div>
          </>
        )}
      </header>
          
            <div className="rating">
              {!isWatched ? 
                <>
                <StarRating
                size={30}
                defaultRating={userRating}
                maxRating={10}
                onSetRating={setUserRating}
              />
              {userRating > 0 && (
                <button className="btn-add" onClick={handleAdd} disabled={!userRating}>
                  + Add to list
                </button>
              )}
              </>:
              (
              <p>You Have rated this movie {watchedUserRating}
              <span>⭐️</span> out of 10</p>
            )}
            </div>

      {movie && (
        <section>
          <p><em>{plot}</em></p>
          <p>Starring: {actors}</p>
          <p>Directed by: {director}</p>
        </section>
      )}
    </div>
  )
}

function MovieSummary({watched}) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return(
    <div className="summary">
                <h2>Movies you watched</h2>
                <div>
                  <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                  </p>
                  <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating.toFixed(2)}</span>
                  </p>
                  <p>
                    <span>🌟</span>
                    <span>{avgUserRating.toFixed(2)}</span>
                  </p>
                  <p>
                    <span>⏳</span>
                    <span>{avgRuntime.toFixed(0)} min</span>
                  </p>
                </div>
              </div>
  )
}

function WatchedMovieList({watched, onDeleteWatched}) {
  return(
    <ul className="list">
                {watched.map((movie) => (
                  <li key={movie.imdbID}>
                    <img src={movie.Poster} alt={`${movie.Title} poster`} />
                    <h3>{movie.Title}</h3>
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
                      <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>X</button>
                    </div>
                  </li>
                ))}
              </ul>
  )
}