// Define the Enter key code
const ENTER = 13;

// handleKeyUp: This function is triggered when any key is pressed. It checks if the pressed key is the Enter key (keyCode 13).
// If it is, the function simulates a click on the 'submit_button'. This is typically used to submit forms when Enter is pressed.
// Parameters:
// - event: The event object associated with the key press.
function handleKeyUp(event) {
    event.preventDefault(); // Prevent the default behavior of the Enter key
    if (event.keyCode === ENTER) {
        document.getElementById("submit_button").click(); // Simulate a click on the 'submit_button'
    }
}

// Retrieve the playlist from localStorage or initialize an empty array
const playlist = JSON.parse(localStorage.getItem('playlist')) || [];

// loadPlaylist: Responsible for dynamically rendering the playlist on the webpage. This function is called whenever there is a change
// in the playlist (e.g., addition or removal of songs). It clears the existing playlist display and rebuilds it based on the current state 
// of the 'playlist' array. It creates HTML elements for each song, including action buttons for removing or reordering songs. This function 
// is central to keeping the playlist display in sync with the underlying playlist data structure.
function loadPlaylist() {
    const playlistData = document.getElementById('playlistData');
    playlistData.innerHTML = '';

    // Create the table header row
    let headerRow = document.createElement('tr');

    let headerActions = document.createElement('th');
    headerActions.innerText = 'Actions';
    headerRow.appendChild(headerActions);

    let headerTitle = document.createElement('th');
    headerTitle.innerText = 'Title';
    headerRow.appendChild(headerTitle);

    let headerArtist = document.createElement('th');
    headerArtist.innerText = 'Artist';
    headerRow.appendChild(headerArtist);

    let headerArtwork = document.createElement('th');
    headerArtwork.innerText = 'Artwork';
    headerRow.appendChild(headerArtwork);

    playlistData.appendChild(headerRow);

    // Loop through the playlist array and create rows for each song
    playlist.forEach((song, index) => {
        let row = document.createElement('tr');

        // Create action buttons for deleting and reordering songs
        let actionItem = document.createElement('td');
        let deleteItem = document.createElement('button');
        deleteItem.innerText = '-';
        deleteItem.addEventListener('click', () => {
            // Remove the song from the playlist when the delete button is clicked
            playlist.splice(index, 1);
            loadPlaylist(); // Reload the playlist to update the display
            savePlaylist(); // Save the updated playlist to local storage
        });
        actionItem.appendChild(deleteItem);

        let shiftUpItem = document.createElement('button');
        shiftUpItem.innerText = '🔼';
        shiftUpItem.addEventListener('click', () => {
            if (index > 0) {
                // Swap the current song with the one above it in the playlist
                const temp = playlist[index];
                playlist[index] = playlist[index - 1];
                playlist[index - 1] = temp;
                loadPlaylist(); // Reload the playlist to update the display
                savePlaylist(); // Save the updated playlist to local storage
            }
        });
        actionItem.appendChild(shiftUpItem);

        let shiftDownItem = document.createElement('button');
        shiftDownItem.innerText = '🔽';
        shiftDownItem.addEventListener('click', () => {
            if (index < playlist.length - 1) {
                // Swap the current song with the one below it in the playlist
                const temp = playlist[index];
                playlist[index] = playlist[index + 1];
                playlist[index + 1] = temp;
                loadPlaylist(); // Reload the playlist to update the display
                savePlaylist(); // Save the updated playlist to local storage
            }
        });
        actionItem.appendChild(shiftDownItem);

        // Create cells for song title, artist, and artwork
        let itemTitle = document.createElement('td');
        itemTitle.innerText = song.title;

        let itemArtist = document.createElement('td');
        itemArtist.innerText = song.artist;

        let itemArtwork = document.createElement('td');
        let artworkImage = document.createElement('img');
        artworkImage.src = song.artworkUrl;
        itemArtwork.appendChild(artworkImage);

        // Add all created elements to the row
        row.appendChild(actionItem);
        row.appendChild(itemTitle);
        row.appendChild(itemArtist);
        row.appendChild(itemArtwork);

        // Add the row to the playlist display
        playlistData.appendChild(row);
    });
}

// Load the playlist when the page loads
loadPlaylist();

// Add event listeners when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Listen for clicks on the 'submit_button' and call the 'getSong' function
    document.getElementById('submit_button').addEventListener('click', getSong);

    // Listen for key-up events and call the 'handleKeyUp' function
    document.addEventListener('keyup', handleKeyUp);

    // Listen for clicks on elements with the 'add-button' class
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('add-button')) {
            // Extract song details from the clicked row and add it to the playlist
            const row = event.target.closest('tr');
            const title = row.querySelector('.song-title').textContent;
            const artist = row.querySelector('.song-artist').textContent;
            const artworkUrl = row.querySelector('.song-artwork img').src;

            const songToAdd = {
                title: title,
                artist: artist,
                artworkUrl: artworkUrl
            };
            playlist.push(songToAdd);

            loadPlaylist(); // Reload the playlist to update the display
            savePlaylist(); // Save the updated playlist to local storage
        }
    });
});

// getSong: Triggered when the 'submit_button' is clicked. It retrieves the value from the 'title' input field and uses it
// to make an XMLHttpRequest to a server endpoint that searches for songs. The function updates the webpage with the search results,
// including song title, artist, and artwork. It handles the request and processes the response to dynamically display search results.
// This function is key for enabling user interaction with the search feature, handling empty input cases, and updating the UI accordingly.
function getSong() {
    let songName = document.getElementById('title').value;
    if (songName === '') {
        return alert('Please enter a song');
    }

    let songDiv = document.getElementById('data');
    songDiv.innerHTML = '';

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let response = JSON.parse(xhr.responseText);
            let searchResultsHeader = document.getElementById('searchResultsHeader');
            let searchQuery = document.getElementById('searchQuery');
            let searchResultsData = document.getElementById('searchResultsData');

            searchResultsData.innerHTML = '';

            // Create table header row for search results
            let headerRow = document.createElement('tr');

            let headerAdd = document.createElement('th');
            headerAdd.innerText = 'Add';
            headerRow.appendChild(headerAdd);

            let headerTitle = document.createElement('th');
            headerTitle.innerText = 'Title';
            headerRow.appendChild(headerTitle);

            let headerArtist = document.createElement('th');
            headerArtist.innerText = 'Artist';
            headerRow.appendChild(headerArtist);

            let headerArtwork = document.createElement('th');
            headerArtwork.innerText = 'Artwork';
            headerRow.appendChild(headerArtwork);

            searchResultsData.appendChild(headerRow);

            // Update the search results header with the query
            searchResultsHeader.innerHTML = `Songs matching: <span id="searchQuery">${songName}</span>`;

            // Iterate through search results and create rows for each song
            response.results.forEach(song => {
                let artist = song.artistName;
                let title = song.trackName;
                let artworkUrl = song.artworkUrl100;

                let row = document.createElement('tr');

                let addItemControl = document.createElement('td');
                let addButton = document.createElement('button');
                addButton.innerText = '+';
                addButton.classList.add('add-button'); 
                addItemControl.appendChild(addButton);

                let itemTitle = document.createElement('td');
                itemTitle.classList.add('song-title'); 
                itemTitle.innerText = title;

                let itemArtist = document.createElement('td');
                itemArtist.classList.add('song-artist');
                itemArtist.innerText = artist;

                let itemArtwork = document.createElement('td');
                itemArtwork.classList.add('song-artwork');
                let artworkImage = document.createElement('img');
                artworkImage.src = artworkUrl;
                itemArtwork.appendChild(artworkImage);

                // Add all elements to the row
                row.appendChild(addItemControl);
                row.appendChild(itemTitle);
                row.appendChild(itemArtist);
                row.appendChild(itemArtwork);

                // Add the row to the search results
                searchResultsData.appendChild(row);
            });
        }
    };

    // Send an XMLHttpRequest to the server's '/songs' endpoint with the search query
    xhr.open('GET', `/songs?title=${songName}`, true);
    xhr.send();
}

// Function to save the playlist to localStorage
function savePlaylist() {
    localStorage.setItem('playlist', JSON.stringify(playlist));
}
