const NOT_A_YEAR_ERROR_MESSAGE = "The input is not a year. Please refine your query and try again."
const NO_RESULTS_MESSAGE =  "<p>There are no results. Please refine your query and try again.</p>"
const RESULT_ERROR_MESSAGE  =  "<p>There appears to be an error in processing the request. Please try again.</p>"
const LOADING_MESSAGE =  "<p>Loading...</p>"

const CURRENT_YEAR = new Date().getFullYear()

//Search for movies and return results in descending order of popularity. The query will return, at maximum, 20 results per page. The query searches for movies that are available to watch in English.
const SEARCH_QUERY = "https://api.themoviedb.org/3/discover/movie?api_key=af79da4a359de5e09175181acbf682a7&language=en-US&sort_by=popularity.desc"

//Main source for posters
const MOVIE_POSTER_PATH = "https://image.tmdb.org/t/p/original"


function renderMovieNameElement(name) {
    return `<p class='movie-info-text'>Name: ${name}</p>`
}

function renderMoviePosterElement(imageSource, name) {
    return `<img src='${imageSource}' alt='Movie poster for ${name}' width='400' height='600' />`
}

function renderMovieReleaseElement(releaseDate) {
    return `<p class='movie-info-text'>Release Date: ${releaseDate}</p>`
}

function renderMovieResultItem(movieName, moviePosterSource, movieReleaseDate) {

    let movieNameHtml = renderMovieNameElement(movieName)
    let moviePosterHtml = renderMoviePosterElement(moviePosterSource, movieName)
    let movieReleaseDateHtml = renderMovieReleaseElement(movieReleaseDate)

    return `<div class='result-item'>${moviePosterHtml}<div class='result-item-name-and-date'>${movieNameHtml}${movieReleaseDateHtml}</div></div>`

}

//Search for movies first released in a year X that are also popular in the year X
function searchForMovieBasedOnYear() {
    let givenYear = document.getElementById('year-input').value
    if (givenYear.length > 0 && !isNaN(givenYear)) {
        let parseGivenYear = parseInt(givenYear)

        //Year cannot be less than zero
        if (parseGivenYear < 1) {
            alert("Year must be a positive number. Please refine your query and try again.")
        }
        //Year cannot be after the current year
        else if (parseGivenYear > CURRENT_YEAR) {
            alert("Year cannot be in the future.")
        }
        else {
            //Fetching movies using primary_release_year will return values if certain years are entered (e.g. year 0, 100, etc.) 
            // let primaryReleaseYear = `&primary_release_year=${parseGivenYear}`

            let primaryReleaseYearGte = `&primary_release_date.gte=${parseGivenYear}-01-01`
            let primaryReleaseYearLte = `&primary_release_date.lte=${parseGivenYear}-12-31`

            let searchQueryPrimaryReleaseYear = SEARCH_QUERY + primaryReleaseYearGte + primaryReleaseYearLte

            let ajaxRequest = new XMLHttpRequest()
            ajaxRequest.open('GET', searchQueryPrimaryReleaseYear)

            ajaxRequest.onreadystatechange = function() {
                handler(ajaxRequest);
            };
            
            ajaxRequest.send(null);
            }
    }
    else {
        alert(NOT_A_YEAR_ERROR_MESSAGE)
    }
}


function handler(request) {
    //If the request is done processing, then proceed with validating the request status
    if (request.readyState == 4) {
        //if the request has been successfully fulfilled, then proceed with 
        if (request.status == 200) {
            let popularMovieResults = JSON.parse(request.responseText).results

            //Ensure that the results are encapsulated in an array or else we will not be able to iterate through them
            if (Array.isArray(popularMovieResults)) {
    
                let tenPopularMovieResults = []
    
                //In the case that there are results, iterate through them, else return a message indicating that no results were found
                if (popularMovieResults.length > 0) {
                    //If there are more then 10 results then create a subarray containing the first top-ten popular films, else use the same array.
                    if (popularMovieResults.length > 10) {
                        tenPopularMovieResults = popularMovieResults.slice(0, 10)
                    }
                    else {
                        tenPopularMovieResults = popularMovieResults
    
                    }
    
                    var movieListHtml = ""
                    
                    //Iterate over each movie in the array
                    for (var movieItem of tenPopularMovieResults) {
                        
                        //Get movie name
                        let movieItemName = movieItem.original_title
                        
                        //Get the poster of the movie
                        let movieItemPosterSource =  MOVIE_POSTER_PATH + movieItem.poster_path
                        
                        //Get the movie's release date
                        let movieItemReleaseDate =  movieItem.release_date

                        //Crete a div element containing the required information of the movie
                        let movieItemHtml = renderMovieResultItem(movieItemName, movieItemPosterSource, movieItemReleaseDate)

                        //Append to list
                        movieListHtml += movieItemHtml
                    }
    
                    //Set inner html content of the search-results div element to show 
                    document.getElementById('search-results').innerHTML =  movieListHtml
                }
                else {
                    document.getElementById('search-results').innerHTML = NO_RESULTS_MESSAGE
                }
            }
            else {
                document.getElementById("search-results").innerHTML = RESULT_ERROR_MESSAGE
            }
        }
        else {
            document.getElementById('search-results').innerHTML = RESULT_ERROR_MESSAGE

        }
	}
    else {
        document.getElementById('search-results').innerHTML = LOADING_MESSAGE
    }
}