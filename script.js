/// CRESCENDO SCRIPT.JS ///
// NAME: DIVINE MUSTAFA
// Assignment: CSE Project B/D
// What i made: An audio player. You throw in your own audio files. It plays them right back at you.

/// DOCUMENT ELEMENTS ///

/* Files */
const dropZone = document.getElementById("drop-zone");
const audioFileInput = document.getElementById("audio-file-input");
const imageFileInput = document.getElementById("image-file-input");

/* Main Flexbox */
const playlistsEl = document.getElementById("playlists-el");
const songsEl = document.getElementById("songs-el");
const nowPlayingEl = document.getElementById("now-playing-el");
const searchBar = document.getElementById("search-bar");

/* Audio Related */
const audioEl = document.getElementById("audio-el");
const timeSlider = document.getElementById("time-slider");



/// GLOBAL VARIABLES & CLASSES ///

/* Global Variables Which Must Be Defined Before The Classes */
const playBtnSrc = "Images/playBtn.svg";
const pauseBtnSrc = "Images/pauseBtn.svg";
let promise = null;

/* Classes */
class Song {
    constructor(file, identifier) {
        this.file = file;
        this.src = URL.createObjectURL(file);
        
        this.identifier = identifier;
        this.elementId = `${identifier}-song`;
        
        this.name = file.name.split(".")[0];
        this.artist = "unknown artist";
        this.picture = "Images/music_note.png";
        this.pictureFile = null;

        this.originalName = this.name;
        this.originalArtist = this.artist;
        this.originalPicture = this.picture;
        
        this._playImg = playBtnSrc;
    }

    play(restart) {
        // only changes the song's play button if it's being viewed in the playing playlist
        if (viewingPlaylist.identifier === playingPlaylist.identifier) this.playImg = pauseBtnSrc;

        const songEnded = audioEl.currentTime === audioEl.duration;
        
        // restarts the song if it has already ended or the `restart` parameter is true
        if (songEnded || restart) audioEl.currentTime = 0;
        
        // changes the audio elements src to match the songs
        if (audioEl.src !== this.src) audioEl.src = this.src;

        // stores the .play() method in a promise (ignores abort errors)
        promise = audioEl.play().catch((err) => {
            if (err.name === "AbortError") return;
            console.warn("Play interrupted:", err);
        });
        
        timeSlider.disabled = false;
    }

    pause() {
        this.playImg = playBtnSrc;
        audioEl.pause();
    }

    // changes the elements play button image whenever playImg changes
    set playImg(value) {
        this._playImg = value;
        
        const playBtnEl = document.getElementById(`${this.elementId}-play-btn`);
        if (playBtnEl) playBtnEl.src = value;
    }
}

class Playlist {
    constructor(name, identifier) {
        this.identifier = identifier;
        this.elementId = `${identifier}-playlist`;
        
        this.name = name;
        this.picture = "Images/music_note.png";
        this.pictureFile = null;

        this.originalName = this.name;
        this.originalPicture = this.picture;
        
        this.songs = [];
        this.shuffledSongs = [];
        this.shuffled = false;
        
        this._playImg = playBtnSrc;
    }

    shuffle() {
        // uses the Fisher-Yates shuffle algorithm to randomize the shuffledSongs array
        if (!this.shuffled) {
            this.shuffledSongs = [...this.songs];
            let songs = this.shuffledSongs;

            
            // iterates backwards through the array
            for (let i = songs.length - 1; i > 0; i--) {
                // picks a random index from 0 to i
                const j = Math.floor(Math.random() * (i + 1));
            
                // Swap elements array[i] and array[j] using destructuring assignment
                [songs[i], songs[j]] = [songs[j], songs[i]];
            }

            this.shuffled = true; // turns on the flag
        }
    }

    // changes the elements play button image whenever playImg changes
    set playImg(value) {
        this._playImg = value;
        
        const playBtnEl = document.getElementById(`${this.elementId}-play-btn`);
        if (playBtnEl) playBtnEl.src = value;
    }
}

/* Global Variables */
let database = null;

let allSongs = new Playlist("Songs", 0); // necessary to keep track of every song
let allPlaylists = [allSongs];
let [viewingPlaylist, playingPlaylist, currentSong] = [allSongs, null, null];

let loopState = "none"; // 3 states: none, one, and all 
let shuffleOn = false;
let draggingSlider = false;
let sliderHeight = 4;


/// EVENT LISTENERS ///

// Updates the certain parts of the site once index.html and script.js have fully loaded
window.addEventListener("load", () => {
    updateWebsite();
    updateSliderProgressBar();

    // gives the search bar a random placeholder
    const random = Math.random();
    
    if (random > 0.75) searchBar.placeholder = "What genre are you think of right now?";
    else if (random > 0.5) searchBar.placeholder = "I'm feeling EDM";
    else if (random > 0.25) searchBar.placeholder = "Phonk genuinely isn't even that bad, the hate is unwarranted.";
    else searchBar.placeholder = "Want to find good music? Download geometry dash.";
});

// Handles search bar inputs
searchBar.addEventListener("input", searchBarHandler);


/* Drop Zone Related Event Listeners */

// Prevents default browser behavior for drag events considering the dropZone and the whole window
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, preventDefaults);
    window.addEventListener(eventName, preventDefaults);
    timeSlider.addEventListener(eventName, preventDefaults);
});

// Handles dropped audio files
dropZone.addEventListener("drop", getAudioFiles);

// Handles dropZone clicks
dropZone.addEventListener("click", () => audioFileInput.click());
audioFileInput.addEventListener("change", getAudioFiles);

// Handles the modify menu's Image clicks
imageFileInput.addEventListener("change", getImageFile);



/* Audio Related Event Listeners */

// changes to either to slider, or the 
audioEl.addEventListener("timeupdate", timeUpdateHandler);
timeSlider.addEventListener("click", sliderAdjusted);
timeSlider.addEventListener("input", updateSliderProgressBar);


// prevents bugs caused by the audio element updating while the user drags the slider
timeSlider.addEventListener("mousedown", () => draggingSlider = true);
timeSlider.addEventListener("mouseup", () => draggingSlider = false);

// updates the sliders height
timeSlider.addEventListener("mouseenter", () => {
    sliderHeight = 6;
    updateSliderProgressBar();
});
timeSlider.addEventListener("mouseleave", () => {
    sliderHeight = 4;
    updateSliderProgressBar();
});
    
    
/// FUNCTIONS ///

/* Data Related Functions */

function loadDatabase() {
    // flag to prevent loading non-existant data
    let databaseExists = true;
    
    // requests the data (asynchronous)
    const request = indexedDB.open("CrescendoDB", 1);
    
    // if the database doesn't exist for the user, set it up
    request.onupgradeneeded = (event) => {
        database = event.target.result;
        database.createObjectStore("CrescendoData", { keyPath: "id" });
        
        databaseExists = false
    };

    // once the request as finished, store the opened database
    request.onsuccess = (event) => {
        database = event.target.result;
        if (databaseExists) loadData();
        else saveData();
    };
}
loadDatabase();

function saveData() {
    // requests the data's location
    const tx = database.transaction("CrescendoData", "readwrite");
    const store = tx.objectStore("CrescendoData");

    
    const allPlaylistsClone = structuredClone(allPlaylists);

    // resets certains properties of every playlist and song before saving
    allPlaylistsClone.forEach((playlist) => {
        playlist.songs.forEach((song) => {
            song._playImg = playBtnSrc;
        })
        playlist._playImg = playBtnSrc;
    
    })

    // assigns the values
    store.put({
        id: "User Data",
        userPlaylists: allPlaylistsClone,
        userLoopState: loopState,
        userShuffleState: shuffleOn,
    })
}

function loadData() {
    // requests the data's location
    const tx = database.transaction("CrescendoData", "readonly");
    const store = tx.objectStore("CrescendoData");

    // finds the data via its ID
    const request = store.get("User Data");

    // sets up the values
    request.onsuccess = () => {
        // updates the loop state to match the save data
        loopState = request.result.userLoopState;
        const loopBtn = document.getElementById("loop-btn");
        
        if (loopState === "none") loopBtn.classList.add("grayscale");

        else if (loopState === "one") {
            loopBtn.classList.remove("grayscale");
            loopBtn.src = "Images/loopBtn1.svg";
        }

        else if (loopState === "all") {
            loopBtn.classList.remove("grayscale");
            loopBtn.src = "Images/loopBtn.svg";
        }
        

        // updates the shuffle state to match the save data
        shuffleOn = request.result.userShuffleState;
        
        if (shuffleOn) shuffleOn = false;
        else shuffleOn = true
        
        toggleShuffle();
        
        
        // Updates the playlists and songs
        allPlaylists = request.result.userPlaylists;
        
        for (let i in allPlaylists) {
            // saves the original playlist's data in a copy
            const playlistCopy = structuredClone(allPlaylists[i]);

            // reset the playlist to regain it's methods
            allPlaylists[i] = new Playlist(playlistCopy.name, playlistCopy.identifier);
            
            allPlaylists[i].songs = playlistCopy.songs;
            
            // fixes the playlist's picture
            if (playlistCopy.pictureFile) {
                allPlaylists[i].pictureFile = playlistCopy.pictureFile;
                allPlaylists[i].picture = URL.createObjectURL(playlistCopy.pictureFile);
            }

            const playlist = allPlaylists[i];
        
            // scans every song in every playlist to reset them
            for (let j in playlist.songs) {
                
                // saves the original song's data in a copy
                const songCopy = structuredClone(playlist.songs[j]);

                // resets the song to regain it's methods
                playlist.songs[j] = new Song(songCopy.file, songCopy.identifier);
                const song = playlist.songs[j];
                
                // provides the song it's modifiable data
                song.name = songCopy.name;
                song.artist = songCopy.artist;

                // fixes the song's picture
                if (songCopy.pictureFile) {
                    song.pictureFile = songCopy.pictureFile;
                    song.picture = URL.createObjectURL(songCopy.pictureFile);
                }
            }
        }
        
        allSongs = allPlaylists[0];
        viewingPlaylist = allPlaylists[0];

        // updates the html
        updateWebsite();

        saveData();
    }
}

function resetDB() {
    // resets everything (cuz i mess up a lot. working with local data is hard)
    indexedDB.deleteDatabase("CrescendoDB");
    location.reload();
}


/* Drop Zone Related Functions */

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function getImageFile(e) {
    // if e.dataTranfer (used for drop events) exists, then get it's fileList,
    // else, get the files from e.target (used for clicks)
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    
    // checks if there are any files before proceeding 
    if (files && files.length > 0) {
        const file = files[0];
        
        // confirms the file is an image
        if (file.type.startsWith("image/")) {
            modifyMenuImageFile = file;
            const src = URL.createObjectURL(file);

            const replacementImage = document.getElementById("replace-picture-img");
            replacementImage.src = src;
        }
    }
}

function getAudioFiles(e) {
    // same as the first line in getImageFiles()
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    
    // checks file validity
    const validatedFiles = validateFiles(Array.from(files));

    // turns files into songs and saves the new songs
    if (validatedFiles !== null) {
        processFiles(validatedFiles);
        saveData();
    }
}

function validateFiles(files) {
    // validates the files exist
    if (files && files.length > 0) {
        
        // filters the files for audio files
        const audioFiles = files.filter((file) => file.type.startsWith("audio/"));

        // stores unduped files
        let unduplicatedFiles = [];
        
        audioFiles.forEach((file) => {
            const arrayIsEmpty = allSongs.songs.length < 1;

            // compares the audio files to the existing songs
            const hasDuplicates = checkForDuplicateFiles(file, allSongs.songs);
            
            if (arrayIsEmpty || !hasDuplicates) unduplicatedFiles.push(file);
        });

        // validates that there are any unduplicated files before returning them
        if (unduplicatedFiles.length > 0) return unduplicatedFiles;
        
    }
    // returns null if nothing useful is obtained from the files (all the conditions aren't met)
    return null;
}

function processFiles(files) {
    [...Array.from(files)].forEach((file) => {
        // initializes a new song object containing the audio file then adds it to the allSongs object
        const newSong = new Song(file, createNewId(true));
        allSongs.songs.push(newSong);
        allSongs.shuffled = false;

        // swaps the playlist, resseting the page if the viewingPlaylist isn't allsongs
        if (viewingPlaylist.identifier !== allSongs.identifier) swapPlaylist(allSongs.identifier);
        else {
            // otherwisem just adds a new div
            const newSongDiv = createSongDiv(newSong);
            songsEl.appendChild(newSongDiv);
        }
    });
}

function checkForDuplicateFiles(file, songsList) {
    let sameFile = false
    
    songsList.forEach((song) => {
        // compares file name, file size, and file type
        const sameName = song.file.name === file.name;
        const sameSize = song.file.size === file.size;
        const sameType = song.file.type === file.type;
        
        // returns true if the files match
        if (sameName && sameSize && sameType) sameFile = true;
    })
    
    return sameFile;
}


/* UI Changing Functions */

function createPlaylistDiv(playlist) {
    const div = document.createElement("div");

    // sets div's id and class
    div.id = `${playlist.elementId}`;
    div.className = "h-18 pl-5 flex items-center gap-3 hover:bg-blue-600/20";
    
    // creates the div's content in a [picture, name, play button, kebab button] format
    div.innerHTML = `
                            <img src="${playlist.picture}" class="w-15 p-1 rounded-md hover:cursor-pointer"
                                onclick="toggleModifyMenu(${playlist.identifier}, false)"/>

                            <p class="text-3xl text-blue-700 hover:underline active:opacity-75 hover:cursor-pointer"
                                onclick="swapPlaylist(${playlist.identifier})">${playlist.name}</p>
                                

                            <img id="${playlist.elementId}-play-btn"  src="${playlist._playImg}"
                                class="w-7.5 hover:w-8.5 hover:-ml-0.5 hover:cursor-pointer
                                active:opacity-75 active:w-7.5 active:ml-0
                                transition-all duration-200"
                                onclick="playPlaylist(${playlist.identifier})"/>
                                

                            <img src="Images/kebabBtn.png"
                                class="w-5 h-8 ml-auto mr-1 rounded-3xl hover:bg-[#0000FF1A] active:opacity-75 hover:cursor-pointer"
                                onclick="openPlaylistMenu(${playlist.identifier}, this)"/>`;
    return div;
}

function createSongDiv(song) {
    const div = document.createElement("div");
    
    // sets div's id and class
    div.id = `${song.elementId}`;
    div.className = "h-18 pl-5 flex items-center gap-3 hover:bg-blue-600/20";

    // creates the div's content in a [picture, name & artist, play button, kebab button] format
    div.innerHTML = `
                            <img src="${song.picture}" class="w-15 p-1 rounded-md hover:cursor-pointer"
                            onclick="toggleModifyMenu(${song.identifier}, true)"/>

                            <p class="flex flex-col justify-center text-left">

                                <span class="text-2xl text-blue-700 hover:underline active:opacity-75 hover:cursor-pointer"
                                    onclick="playSong(${song.identifier}, ${viewingPlaylist.identifier})">${song.name}</span>

                                <span class="text-md text-blue-600">${song.artist}</span>

                            </p>


                            <img id="${song.elementId}-play-btn" src="${song._playImg}"
                                class="w-7.5 hover:w-8.5 hover:-ml-0.5 hover:cursor-pointer
                                active:opacity-75 active:w-7.5 active:ml-0
                                transition-all duration-200"
                                onclick="playSong(${song.identifier}, ${viewingPlaylist.identifier})"/>


                            <img src="Images/kebabBtn.png"
                                class="w-5 h-8 ml-auto mr-1 rounded-3xl hover:bg-[#0000FF1A] active:opacity-75 hover:cursor-pointer"
                                onclick="openSongMenu(${song.identifier}, this)"/>`;

    return div;
}

function updatePlaylistsSection() {
    // clears the playlistsEl
    playlistsEl.querySelectorAll("div").forEach((div) => {
        playlistsEl.removeChild(div);
    });

    // creates a div for every playlist
    allPlaylists.forEach((object) => {
        const playlistDiv = createPlaylistDiv(object);
        playlistsEl.appendChild(playlistDiv);

        // bolds the playlist if it's the viewingPlaylist
        if (object.identifier === viewingPlaylist.identifier) {
            const p = playlistDiv.querySelector("p");
            p.classList.add("font-semibold", "underline");
        }
    });
}

function updateSongsSection() {
    // clears the songsEl
    songsEl.querySelectorAll("div").forEach((div) => {
        songsEl.removeChild(div);
    });

    // adds every created song into the songs section
    viewingPlaylist.songs.forEach((song) => {
        const songDiv = createSongDiv(song);
        songsEl.appendChild(songDiv);

        
        if (currentSong && playingPlaylist) {
            const songIsPlaying = currentSong.identifier === song.identifier;
            const playlistIsPlaying = playingPlaylist.identifier === viewingPlaylist.identifier;
            
            // bolds the song if it's playing and it's in the currently playing playlist
            if (songIsPlaying && playlistIsPlaying) {
                const span = songDiv.querySelector("p").firstElementChild;
                span.classList.add("font-semibold", "underline");
            }
        }
    });
}

function updateCurrentlyPlayingSongSection() {
    // sets up the image and text of the currently playing song
    const fakeSong = {
        identifier: null,
        elementId: "playing-song-play-btn",
        picture: "Images/music_note.png",
        name: "No Song Selected",
        artist: "...",
        _playImg: playBtnSrc,
    };

    // checks if a song has been chosen
    const potentialSong = currentSong != null ? currentSong : fakeSong;
    
    // gets the HTML elements in the now playing flexbox
    const playingSongImg = document.getElementById("playing-song-img");
    const playingSongName = document.getElementById("playing-song-name");
    const playingSongArtist = document.getElementById("playing-song-artist");
    const playingSongPlayBtn = document.getElementById("playing-song-play-btn");

    // updates the elements to match whatever song is playing
    playingSongImg.src = potentialSong.picture;
    
    playingSongName.innerHTML = potentialSong.name;
    
    playingSongArtist.innerHTML = potentialSong.artist; 

    const playButtonImage = audioEl.paused ? playBtnSrc : pauseBtnSrc;
    playingSongPlayBtn.src = playButtonImage;
}

function updateWebsite() {
    // these three functions, including updateWebsite() are only to be used as last resorts due to the fact that they reset entire portions of the page
    updatePlaylistsSection();
    updateSongsSection();
    updateCurrentlyPlayingSongSection();
}

function addNewPlaylist() {
    let index = 1;

    // iterate through the allPlaylists to find one with the basic 'Playlist #' format
    allPlaylists.forEach((playlist) => {
        if (playlist.name.startsWith("Playlist ")) {
            
            // verifies the validity of the format
            let playlistSplit = playlist.name.split(" ");
            if (playlistSplit.length === 2) {

                // further verifies format
                let playlistNum = Number(playlist.name.split(" ")[1]);
                if (!Number.isNaN(playlistNum) && Number.isInteger(playlistNum)) {
                    
                    // makes the index one higher that that of the playlist with the highest number
                    if (playlistNum >= index) index = playlistNum + 1;
                }
            }
            
            
        }
    });

    // makes a playlist with the index then pushes it into allPlaylists
    const newPlaylist = new Playlist(`Playlist ${index}`, createNewId(false));
    allPlaylists.push(newPlaylist);

    // makes a new div for the playlist
    const playlistDiv = createPlaylistDiv(newPlaylist);
    playlistsEl.appendChild(playlistDiv);

    saveData();
}

function swapPlaylist(playlistId) {
    if (playlistId !== viewingPlaylist.identifier) {
        const playlistClicked = findObjectByIdentifier(allPlaylists, playlistId);

        // unbolds the old playList
        let p = document
            .getElementById(viewingPlaylist.elementId)
            .querySelector("p");
        
        p.classList.remove("font-semibold", "underline");

        // updates viewingPlaylist and the songs section
        viewingPlaylist = playlistClicked;
        updateSongsSection();

        // bolds the new playList
        p = document.getElementById(viewingPlaylist.elementId).querySelector("p");
        p.classList.add("font-semibold", "underline");
    }
}

function searchBarHandler() {
    const searchQuery = searchBar.value.toLowerCase();

    // empty query searches have nigh-identical logic to updateSongsSection();
    if (searchQuery === "") {
        updateSongsSection();
        return;
    }
    
    viewingPlaylist.songs.forEach((song) => {

        // checks if the song's name in lower case contains the query
        const queryInSongName = song.name.toLowerCase().includes(searchQuery); // uses .includes() instead of .startsWith() on purpose
    
        const songDiv = document.getElementById(song.elementId);

        // if the song name is in the query and it's div doesn't exist, add it to the songsEl
        if (queryInSongName && !songDiv) {
            const songToAdd = createSongDiv(song);
            songsEl.appendChild(songToAdd);

            // bolds the songs title if its currently playing
            if (currentSong && playingPlaylist) {
                const songIsPlaying = currentSong.identifier === song.identifier;
                const playlistIsPlaying = playingPlaylist.identifier === viewingPlaylist.identifier;

                if (songIsPlaying && playlistIsPlaying) {
                    const span = songToAdd.querySelector("p").firstElementChild;
                    span.classList.add("font-semibold", "underline");
                }
            }
        }
        // if the song name isn't in the query and it's div exists, remove it from the songsEl
        else if (!queryInSongName && songDiv) songsEl.removeChild(songDiv);
    })
}


/* Utility functions for songs and playlists */

function findObjectByIdentifier(array, identifier) {
    // finds the object's index through a findIndex search
    const index = array.findIndex((object) => object.identifier === identifier);

    // returns the object if it exists
    if (array[index]) return array[index];
    else return null;
}

function createNewId(isSong) {
    let id = 1;

    // if the id is for a song, use the allSongs array, else, use the allPlaylists array
    const array = isSong ? allSongs.songs : allPlaylists;

    // a simple loop to create new id's
    array.forEach((object) => {
        if (id === object.identifier) id++;
    })
    return id;
}

function formatSongTime(totalSeconds) {
    // gets the times
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    // formats seconds with leading zeros
    const formattedSeconds = String(seconds).padStart(2, '0');
    const formattedMinutes = String(minutes);

    // returns M:SS or MM:SS if no hours, otherwise H:MM:SS or HH:MM:SS
    if (hours === 0) return `${formattedMinutes}:${formattedSeconds}`;
    else {
        const formattedHours = String(hours); 
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }
}


/* Play And Pause Functions */

function playPlaylist(playlistId) {
    const playlistClicked = findObjectByIdentifier(allPlaylists, playlistId);

    // only proceeds with the logic if the playlist has songs
    if (playlistClicked.songs.length > 0) {
        
        // swaps the playlists if the playlist clicked isn't already open
        if (viewingPlaylist.identifier !== playlistId) swapPlaylist(playlistId);

        
        // plays the first song in the songs array if shuffle is off
        if (!shuffleOn) playSong(playlistClicked.songs[0].identifier, playlistId, true);
        else {
            
            // sets shuffled to false so the playlist is allowed to shuffle, then shuffles the playlist
            playlistClicked.shuffled = false;
            playlistClicked.shuffle();

            // obtains a random index from the shuffled array then plays the song in it
            let i = Math.floor(Math.random() * playlistClicked.shuffledSongs.length);
            
            playSong(playlistClicked.shuffledSongs[i].identifier, playlistId, true, true);
        }
    }
    else {
        // resets the playlist's image if it's empty
        const img = document.getElementById(`${playlistClicked.elementId}-play-btn`);
        img.src = playBtnSrc;
    }
}

function playSong(songId, playlistId = null, restart = false, preshuffled = false) {
    // checks if the function was called by the button in the "Now Playing" flexbox
    if (songId === "playing-song-play-btn") {
        
        // only defines the songId if there is a song in the Now Playing section
        if (currentSong) songId = currentSong.identifier;
        
        else {
            // if it was called by that play button, but no song is playing, end the function
            const placeHolderBtn = document.getElementById("playing-song-play-btn");
            placeHolderBtn.src = playBtnSrc;
            return;
        }
    }
    
    if (playingPlaylist) {
        // resets the shuffled properties of the newly and previously playing playlists
        if (viewingPlaylist.identifier !== playingPlaylist.identifier && !preshuffled) {
            viewingPlaylist.shuffled = false;
            playingPlaylist.shuffled = false;
        }
    }
    
    // redefines playingPlaylist if the function is given it's ID
    if (playlistId || playlistId === 0) playingPlaylist = findObjectByIdentifier(allPlaylists, playlistId);

    
    // prevents errors caused by currentSong being null by default
    const songClicked = findObjectByIdentifier(playingPlaylist.songs, songId);
    if (currentSong === null) currentSong = songClicked;
    

    // pauses and unbolds the previously playing song
    if (currentSong.identifier !== songId) {
        if (!currentSong.paused) currentSong.pause();

        // first checks if the songs element exists then unbolds it
        const oldSongsDiv = document.getElementById(currentSong.elementId);

        if (oldSongsDiv) {
            const oldSongsSpan = oldSongsDiv.querySelector("p").firstElementChild;
            oldSongsSpan.classList.remove("font-semibold", "underline");
        }
    }

    
    const newSongsDiv = document.getElementById(songClicked.elementId);
    
    // bolds the new song if it's div exists and the playlist being viewed is the playing playlist
    if (newSongsDiv &&viewingPlaylist.identifier === playingPlaylist.identifier) {
        const newSongsSpan = newSongsDiv.querySelector("p").firstElementChild;
        
        newSongsSpan.classList.add("font-semibold", "underline");
    }

    // finally redifines the current song
    currentSong = songClicked;
    

    // plays or pauses the song based on if the audioEl is paused
    if (audioEl.paused || restart) songClicked.play(restart);
    else songClicked.pause();

    
    const playButtonImage = audioEl.paused ? playBtnSrc : pauseBtnSrc;

    // changes the play button image of the playingPlaylist while ensuring every other playlist gets the default play button
    allPlaylists.forEach((playlist) => {
        if (playlist.identifier === playingPlaylist.identifier) playlist.playImg = playButtonImage;
            
        else playlist.playImg = playBtnSrc;
    });

    // updates the html
    updateCurrentlyPlayingSongSection();
}

function playNextSong() {
    if (playingPlaylist) {
        playingPlaylist.shuffle(); // ensures the shuffled playlist is up to date
        
        // if shuffle is on, get the shuffled songs, else, get the normal songs
        const songs = shuffleOn ? playingPlaylist.shuffledSongs : playingPlaylist.songs;
        
        // gets the current songs index
        const index = songs.findIndex((song) => song.identifier === currentSong.identifier);

        // if the next index exists, get it, else, reset back to zero
        const nextIndex = songs[index + 1] ? index + 1: 0;
        
        const nextSong = songs[nextIndex];
        playSong(nextSong.identifier, null, true); // restarts the song
    }
}

function playPreviousSong() {
    if (playingPlaylist) {
        playingPlaylist.shuffle();
        
        const songs = shuffleOn ? playingPlaylist.shuffledSongs : playingPlaylist.songs;

        const index = songs.findIndex((song) => song.identifier === currentSong.identifier);

        const previousIndex = songs[index - 1] ? index - 1 : songs.length - 1;
        
        const previousSong = songs[previousIndex];
        playSong(previousSong.identifier, null, true);
    }
}

function changeLoopState() {
    const loopBtn = document.getElementById("loop-btn");
    
    if (loopState === "none") {
        loopState = "one";
        
        loopBtn.classList.remove("grayscale");
        loopBtn.src = "Images/loopBtn1.svg";
    }
    else if (loopState === "one") {
        loopState = "all";
        
        loopBtn.src = "Images/loopBtn.svg";
    }
    else if (loopState === "all") {
        loopState = "none";
        
        loopBtn.classList.add("grayscale");
    }

    saveData();
}

function toggleShuffle() {
    let shuffleBtn = document.getElementById("shuffle-btn");

    if (shuffleOn) {
        shuffleOn = false;
        shuffleBtn.classList.add("grayscale");
    }
    else {
        shuffleOn = true;
        shuffleBtn.classList.remove("grayscale");
        if (playingPlaylist) playingPlaylist.shuffled = false;
    }

    saveData();
}


/* Slider Functions */

function updateSliderProgressBar() {
    const percent = (timeSlider.value / 1000) * 100;
    
    const padding = 7.5;
    
    // this makes the sliders progress bar visible by giving it a background.
    timeSlider.style.background = `
        linear-gradient(to right, #154CEA ${percent}%, rgba(0, 0, 0, 0.2) ${percent}%)
        center / calc(100% - ${padding * 2}px) ${sliderHeight}px no-repeat
    `;

    
    // updates the time paragraph-elements
    const currentTimePara = document.getElementById("current-time-text");
    const durationPara = document.getElementById("duration-text");

    if (!isNaN(audioEl.duration) && currentSong) {
        const currentTime = (percent / 100) * audioEl.duration;

        // formats the times
        const formattedCurrentTime = formatSongTime(currentTime);
        const formattedDuration = formatSongTime(audioEl.duration);
        
        currentTimePara.innerHTML = formattedCurrentTime;
        durationPara.innerHTML = formattedDuration;

        // ungrayscales the text
        currentTimePara.classList.remove("grayscale");
        durationPara.classList.remove("grayscale");
    } else {
        // resets the times
        currentTimePara.innerHTML = `0:00`;
        durationPara.innerHTML = `0:00`;

        // grayscales the text
        currentTimePara.classList.add("grayscale");
        durationPara.classList.add("grayscale");
    }
}

function sliderAdjusted() {
    if (!isNaN(audioEl.duration)) {
        // calculates the time by using by dividing the sliders current value by its max
        const time = (timeSlider.value / timeSlider.max) * audioEl.duration;
        
        audioEl.currentTime = time;
    } else {
        timeSlider.value = 0;
        updateSliderProgressBar();
    }
}


function timeUpdateHandler() {
    // prevents slider adjustments if there isn't a song playing
    if (isNaN(audioEl.duration) || !currentSong) timeSlider.disabled = true;
    else timeSlider.disabled = false;
    
    if (!isNaN(audioEl.duration) && !draggingSlider) {
        // calculates percentage of audio played then adjusts the timeSlider
        const value = (audioEl.currentTime / audioEl.duration) * timeSlider.max;
        timeSlider.value = value;
        updateSliderProgressBar();
        
        // checks when the song ends
        if (audioEl.currentTime === audioEl.duration) {
            
            if (loopState === "none") {
                // updates every play button if looping is off
                currentSong.playImg = playBtnSrc;
                playingPlaylist.playImg = playBtnSrc;
                document.getElementById("playing-song-play-btn").src = playBtnSrc;
            }

            // repeats the current song if looping (1) is on
            else if (loopState === "one") playSong(currentSong.identifier, null, true);

            // plays the next song if looping (all) is on 
            else if (loopState === "all") playNextSong();
            
        }
    }
}
