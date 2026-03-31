// CRESCENDO SCRIPT.JS //
// NAME: DIVINE MUSTAFA
// Assignment: CSE Project B/D
// What i made: An audio player. You throw in your own audio files. It plays them right back at you. Similar functionality to spotify.

// DOCUMENT ELEMENTS //

/* Files */
const dropZone = document.getElementById("drop-zone");
const audioFileInput = document.getElementById("audio-file-input");
const imageFileInput = document.getElementById("image-file-input");

/* Containers */
const playlistsEl = document.getElementById("playlists-el");
const songsEl = document.getElementById("songs-el");
const nowPlayingEl = document.getElementById("now-playing-el");

/* Audio Related */
const audioEl = document.getElementById("audio-el");
const timeSlider = document.getElementById("time-slider");

/* Inner Menus */
const kebabMenu = document.getElementById("kebab-menu");
const modifyMenu = document.getElementById("modify-menu");
const addPlaylistMenu = document.getElementById("add-to-playlist-menu");



// GLOBAL VARIABLES & CLASSES //
const playBtnSrc = "Images/playBtn.svg"; // must be defined before the classes

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

        this.originalName = this.name;
        this.originalArtist = this.artist;
        this.originalPicture = this.picture;
        
        this._playImg = playBtnSrc;
        this.promise = null;
    }

    play(restart) {
        this.playImg = "Images/pauseBtn.svg";

        const songEnded = audioEl.currentTime === audioEl.duration;
        
        // resets the song if it has already ended or the restart is true
        if (songEnded || restart) audioEl.currentTime = 0;
        
        // changes the audio elements src then plays it, storing the .play() in a promise
        if (audioEl.src !== this.src) audioEl.src = this.src;
        
        this.promise = audioEl.play().catch((err) => {
            console.warn("Play interrupted:", err);
        });
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
const allSongs = new Playlist("Songs", 0); // necessary to keep track of every song
const allPlaylists = [allSongs];
let [viewingPlaylist, playingPlaylist, currentSong] = [allSongs, null, null];

let loopState = "none"; // 3 states: none, one, and all 
let shuffleOn = false;
let draggingSlider = false;
let sliderHeight = 4;

let [kebabMenuOpen, modifyMenuOpen, addPlaylistMenuOpen] = [ false, false, false, ];
let [kebabMenuTransitioning, innerMenuTransitioning, blurTransitioning] = [ false, false, false, ];
let currentKebabMenuAnchor = null;



// EVENT LISTENERS //

// Updates the 3-box flexbox sections once the document and script have loaded in
window.addEventListener("load", () => {
    updateWebsite();
    updateSliderProgressBar();
});

// Hides pop up menus when the page is clicked
document.addEventListener("click", (e) => {
    if (
        !kebabMenu.contains(e.target) &&
        kebabMenuOpen &&
        e.target !== currentKebabMenuAnchor
    )
        hideKebabMenu();

    if (
        !modifyMenu.contains(e.target) &&
        modifyMenuOpen &&
        !kebabMenu.contains(e.target) &&
        !imageFileInput.contains(e.target)
    )
        hideModifyMenu();

    if (
        !addPlaylistMenu.contains(e.target) &&
        addPlaylistMenuOpen &&
        !kebabMenu.contains(e.target)
    )
        hideAddPlaylistMenu();
});


/* Drop Zone Related Event Listeners */

// Prevents default browser behavior for drag events considering the dropZone and the whole window
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, preventDefaults);
    window.addEventListener(eventName, preventDefaults);
    timeSlider.addEventListener(eventName, preventDefaults);
});

// Handles dropped files
dropZone.addEventListener("drop", getAudioFiles.bind(null, true));

// Handles dropZone clicks
dropZone.addEventListener("click", () => audioFileInput.click());


/* Audio Related Event Listeners*/

// changes to either to slider, or the 
audioEl.addEventListener("timeupdate", timeUpdateHandler);
timeSlider.addEventListener('click', sliderAdjusted);
timeSlider.addEventListener("input", updateSliderProgressBar);


// prevents bugs caused by the audio element updating while the user drags the slider
timeSlider.addEventListener('mousedown', () => draggingSlider = true);
timeSlider.addEventListener('mouseup', () => draggingSlider = false);

// updates the sliders height
timeSlider.addEventListener("mouseenter", () => {
    sliderHeight = 6;
    updateSliderProgressBar();
});
timeSlider.addEventListener("mouseleave", () => {
    sliderHeight = 4;
    updateSliderProgressBar();
});
    
    
// FUNCTIONS //


/* Drop Zone Related Functions */

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function getAudioFiles(dropped, e) {
    // gets the FileList object
    const files = dropped ? e.dataTransfer.files : e.target.files;

    // checks file validity
    const validatedFiles = validateFiles(Array.from(files));

    // turns files into songs
    if (validatedFiles !== null) processFiles(validatedFiles);
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

function getImageFile(e) {
    const files = e.target.files;

    // checks if there are any files before proceeding 
    if (files && files.length > 0) {
        const file = files[0];
        
        // confirms the file is an image
        if (file.type.startsWith("image/")) {
            const src = URL.createObjectURL(file);

            const replacementImage = document.getElementById("replace-picture-img");
            replacementImage.src = src;
        }
    }
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
            // bolds the song if its the currently playing song and its in the currently playing playlist
            const songIsPlaying = currentSong.identifier === song.identifier;
            const playlistIsPlaying = playingPlaylist.identifier === viewingPlaylist.identifier;
            
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
    
    playingSongPlayBtn.src = potentialSong._playImg;
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

    // bolds the new song if it's div exists
    const newSongsDiv = document.getElementById(songClicked.elementId);

    if (newSongsDiv) {
        const newSongsSpan = newSongsDiv.querySelector("p").firstElementChild;
        newSongsSpan.classList.add("font-semibold", "underline");
    }

    // finally redifines the current song
    currentSong = songClicked;
    

    // plays or pauses the song based on if the audioEl is paused
    if (audioEl.paused || restart) songClicked.play(restart);
    else songClicked.pause();
    

    // updates the play button image of the viewingPlaylist while ensuring every other playlist gets the default play button
    allPlaylists.forEach((playlist) => {
        if (playlist.identifier === viewingPlaylist.identifier)
            playlist.playImg = songClicked._playImg;
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
        playSong(nextSong.identifier);
    }
}

function playPreviousSong() {
    if (playingPlaylist) {
        playingPlaylist.shuffle();
        
        const songs = shuffleOn ? playingPlaylist.shuffledSongs : playingPlaylist.songs;

        const index = songs.findIndex((song) => song.identifier === currentSong.identifier);

        // if the previous index exists, get it, else, reset back to the last index
        const previousIndex = songs[index - 1] ? index - 1 : songs.length - 1;
        
        const previousSong = songs[previousIndex];
        playSong(previousSong.identifier);
    }
}

function changeLoopState() {
    let loopBtn = document.getElementById("loop-btn");
    
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
}


/* Slider Functions */

function updateSliderProgressBar() {
    const percent = (timeSlider.value / 1000) * 100;
    
    const padding = 7.5;
    
    // creates the sliders progress bar with a gradient
    timeSlider.style.background = `
        linear-gradient(to right, #154CEA ${percent}%, rgba(0, 0, 0, 0.2) ${percent}%)
        center / calc(100% - ${padding * 2}px) ${sliderHeight}px no-repeat
    `;

    
    // updates the time paragraphs
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


/* Kebab Menu Functions */

function openPlaylistMenu(playlistId, element) {
    const options = [
        {
            label: "Change details",
            action: () => toggleModifyMenu(playlistId, false),
        },
        {
            label: "Delete Playlist",
            action: () => deletePlaylist(playlistId),
        },
    ];

    // removes option two if allSongs is the chosen playlist
    if (playlistId === allSongs.identifier) options.splice(1, 1);

    toggleKebabMenu(element, options);
}

function openSongMenu(songId, element) {
    const options = [
        {
            label: "Add to playlist",
            action: () => toggleAddPlaylistMenu(songId),
        },
        {
            label: "Remove from this playlist",
            action: () => removeFromPlaylist(songId),
        },
        {
            label: "Change details",
            action: () => toggleModifyMenu(songId, true),
        },
        {
            label: "Delete song",
            action: () => deleteSong(songId),
        },
    ];

    // removes option two if allSongs is currently open
    if (viewingPlaylist.identifier === allSongs.identifier) options.splice(1, 1);

    toggleKebabMenu(element, options);
}

function toggleKebabMenu(element, options) {
    // flag to prevent the menu from clipping
    if (kebabMenuTransitioning) return;
    
    kebabMenuTransitioning = true;
    
    
    // checks if the menu is already open on the element
    if (kebabMenuOpen && currentKebabMenuAnchor === element) {
        kebabMenuTransitioning = false;
        hideKebabMenu();
        return;
    }

    // clears the menu
    kebabMenu.replaceChildren();

    let lengthenMenu = false;
    // adds options
    options.forEach((option) => {
        const para = document.createElement("p");
        para.textContent = option.label;
        para.className = "px-4 py-2 hover:bg-[#FFFFFF10] cursor-pointer";

        para.onclick = () => {
            option.action();
            hideKebabMenu();
        };

        if (option.label === "Remove from this playlist") lengthenMenu = true;

        kebabMenu.appendChild(para);
    });

    // lengthens the kebabMenu when necessary
    if (lengthenMenu) {
        kebabMenu.classList.remove("w-48");
        kebabMenu.classList.add("w-60");
    }
    else {
        kebabMenu.classList.remove("w-60");
        kebabMenu.classList.add("w-48");
    }

    // positions the menu next to the clicked element
    const rect = element.getBoundingClientRect();

    kebabMenu.style.top = `${rect.top + window.scrollY}px`;
    kebabMenu.style.left = `${rect.right + 5}px`;

    
    // provides classes so the menu slides outward and fades in
    kebabMenu.classList.remove("hidden");

    setTimeout(() => {
        kebabMenu.classList.remove("opacity-0", "-translate-x-2");

        // sets the global variables to sync with the timer
        kebabMenuOpen = true;
        currentKebabMenuAnchor = element;

        kebabMenuTransitioning = false;
    }, 10);
}

function hideKebabMenu() {        
    // flag to prevent the menu from clipping
    if (kebabMenuTransitioning) return;
    
    kebabMenuTransitioning = true;
    
    
    // provides classes so the menu slides inward and fades out
    kebabMenu.classList.add("opacity-0", "-translate-x-2");

    setTimeout(() => {
        kebabMenu.classList.add("hidden");

        // sets the globals variables to sync with the timer
        kebabMenuOpen = false;
        currentKebabMenuAnchor = null;
        
        kebabMenuTransitioning = false;
    }, 200);
}


/* Functions For The Kebab Menu Options */

function removeFromPlaylist(songId) {
    // checks if the currently playing song is the song to be removed
    if (currentSong) {
        if (currentSong.identifier === songId) {
            if (!audioEl.paused) playSong(currentSong.identifier);
            
            playingPlaylist.playImg = playBtnSrc;
            currentSong = null;
            playingPlaylist = null;
            
            audioEl.currentTime = 0;
            
            updateCurrentlyPlayingSongSection();
        }
    }
    
    // removes the song's div from the songsEl
    const songToRemove = findObjectByIdentifier(viewingPlaylist.songs, songId);
    const div = document.getElementById(songToRemove.elementId);
    if (div) songsEl.removeChild(div);

    // targets the index, then splices the song
    const index = viewingPlaylist.songs.findIndex((song) => song.identifier === songId);
    viewingPlaylist.songs.splice(index, 1);

    viewingPlaylist.shuffled = false;
}

function deleteSong(songId) {
    // checks if the currently playing song is the song to be deleted
    if (currentSong) {
        if (currentSong.identifier === songId) {
            if (!audioEl.paused) playSong(currentSong.identifier);
            
            playingPlaylist.playImg = playBtnSrc;
            currentSong = null;
            playingPlaylist = null;
            
            audioEl.currentTime = 0;
            
            updateCurrentlyPlayingSongSection();
        }
    }

    // gets the song's object then deletes it's div
    const songToDelete = findObjectByIdentifier(viewingPlaylist.songs, songId);
    const div = document.getElementById(songToDelete.elementId);
    if (div) songsEl.removeChild(div);
    
    // searches every array for the song's index, if the index exists, the song is spliced from the playlist
    allPlaylists.forEach((playlist) => {
        const index = playlist.songs.findIndex((song) => song.identifier === songId);
        if (index > -1) {
            playlist.songs.splice(index, 1);
            viewingPlaylist.shuffled = false;
        }
    });
}

function deletePlaylist(playlistId) {
    // checks if the playlist to be deleted is playing a song
    if (playingPlaylist) {
        if (playingPlaylist.identifier === playlistId) {
            if (!audioEl.paused) playSong(currentSong.identifier);
            currentSong = null;
            playingPlaylist = null;
            audioEl.currentTime = 0;
        }
    }
    
    // if the playlist to be deleted is currenly open, swap to the default allSongs playlist
    if (viewingPlaylist.identifier === playlistId) swapPlaylist(allSongs.identifier);

    // gets the playlist's object then deletes it's div
    const playlist = findObjectByIdentifier(allPlaylists, playlistId);
    const div = document.getElementById(playlist.elementId);
    if (div) playlistsEl.removeChild(div);

    // deletes the playlist from the playlists array
    const index = allPlaylists.findIndex((list) => list.identifier === playlistId);
    allPlaylists.splice(index, 1);
}


/* Add Song To Playlist Menu & Modify Menu Functions */

function toggleAddPlaylistMenu(songId) {
    // prevents menu from clipping
    if (innerMenuTransitioning || addPlaylistMenuOpen) return;
    
    innerMenuTransitioning = true;

    
    // clears the menu
    addPlaylistMenu.replaceChildren();

    if (allPlaylists.length === 1) {
        // gives the user a message if they haven't created any playlists yet
        const para = document.createElement("p");
        para.className = "text-blue-600 font-semibold";
        para.textContent = "You have no unique playlists to add songs to.";

        
        addPlaylistMenu.appendChild(para);
        addPlaylistMenu.classList.remove("min-h-0", "max-h-100");
        
    }
    else {
        // iterates through every playlist and creates a div for it
        // this uses a for-of loop instead of a forEach loop so I can use the 'continue' keyword
        for (let playlist of allPlaylists) {
            if (playlist.identifier === allSongs.identifier) continue;

            const div = document.createElement("div");
            div.className =
                "flex items-center w-98/100 h-20 px-5 gap-3 hover:bg-blue-600/20 rounded-md";
            div.innerHTML = `
                                <img src="${playlist.picture}" class="w-15 h-15 p-1 bg-blue-600/60 rounded-md"/>

                                <p class="text-3xl text-blue-700 hover:cursor-default">${playlist.name}</p>`;

            // the code-block that actually adds the song into the playlist
            div.onclick = () => {
                const song = findObjectByIdentifier(viewingPlaylist.songs, songId);
                
                // checks the playlist for duplicates
                const hasDuplicates = checkForDuplicateFiles(song.file, playlist.songs);

                if (!hasDuplicates) {
                    // pushes the song into the playlist, then updates the html
                    playlist.songs.push(song);
                    swapPlaylist(playlist.identifier);
                    
                    playlist.shuffled = false;
                }

                hideAddPlaylistMenu();
            };

            // gives the menu the playlist-div
            addPlaylistMenu.appendChild(div);
            addPlaylistMenu.classList.add("min-h-0", "max-h-100");
        }
    }

    // fades in the playlist menu
    addPlaylistMenu.classList.remove("hidden");

    setTimeout(() => {
        addPlaylistMenu.classList.remove("opacity-0");
        
        addPlaylistMenuOpen = true;
        innerMenuTransitioning = false;
    }, 10);
}

function toggleModifyMenu(objectId, isSong) {
    // prevents menu from clipping
    if (innerMenuTransitioning || modifyMenuOpen) return;
    
    innerMenuTransitioning = true;

    
    // clears the menu
    modifyMenu.replaceChildren();

    // if the object is a song, find it in the viewingPlaylist array, else, find the playlist in the allPlaylists array
    const object = isSong ? findObjectByIdentifier(viewingPlaylist.songs, objectId) : findObjectByIdentifier(allPlaylists, objectId);

    // creates the content
    const div = document.createElement("div");
    div.className =
        "w-full h-full flex flex-col justify-center items-center gap-y-2";

    // makes the image a white music note if there isn't a custom image in place
    const includesDefaultImage = object.picture.includes("Images/music_note.png");
    
    const src = includesDefaultImage ? "Images/music_note_white.png" : object.picture;
    

    // base content with the objects image, blur mechanics, and tiny little edit button
    div.innerHTML = `
                <div class="w-40 h-40 z-93 relative inline-block overflow-hidden rounded-md"
                    onmouseover="showBlur()"
                    onmouseleave="hideBlur()"
                    onclick="(() => { imageFileInput.click() })()">
                            
                    <img id="replace-picture-img" src="${src}"
                    class="w-9/10 absolute top-[50%] left-[50%] -translate-1/2"/>
                    
                    <div id="replace-picture-blur"
                    class="w-full h-full absolute top-0 left-0 z-91 backdrop-blur-xs
                    transition-all duration-500 opacity-0"></div>
                    
                    <img id="edit-btn-img" src="Images/editBtn.png"
                    class="w-5 z-92 hover:cursor-pointer
                    absolute top-2 right-2
                    transition-all duration-500 opacity-0"/>
                    
                </div>

                <input id="replace-name-input" type="text" value="${object.name}" placeholder="${object.originalName}"
                    class="px-2 text-white bg-white/10 border-2 border-white rounded-md focus:outline-white"/>`;

    // if the object is a song, add the option to change the songs artists
    if (isSong) {
        div.innerHTML += `
                <input id="replace-artist-input" type="text" value="${object.artist}" placeholder="${object.originalArtist}"
                    class="px-2 text-white bg-white/10 border-2 border-white rounded-md focus:outline-white"/>`;
    }

    // adds in the buttons
    div.innerHTML += `
                <div class="flex mt-auto gap-5">
                
                    <button class="w-30 h-10 text-white font-medium
                        bg-white/20 hover:bg-white/10
                        border-2 border-white rounded-3xl hover:cursor-pointer"
                        onclick="setObjectValues(${objectId}, ${isSong})">Confirm</button>
                        
                    <button class="w-30 h-10 text-white font-medium
                        bg-white/20 hover:bg-white/10
                        border-2 border-white rounded-3xl hover:cursor-pointer"
                        onclick="resetObjectValues(${objectId}, ${isSong})">Reset</button>
                        
                </div>`;

    // gives the menu the content
    modifyMenu.appendChild(div);

    // fades in the modify menu
    modifyMenu.classList.remove("hidden");

    setTimeout(() => {
        modifyMenu.classList.remove("opacity-0");
        
        modifyMenuOpen = true;
        innerMenuTransitioning = false;
    }, 10);
}

function hideAddPlaylistMenu() {
    // prevents menu from clipping
    if (innerMenuTransitioning) return;
    
    innerMenuTransitioning = true;

    
    // fades out the playlist menu
    addPlaylistMenu.classList.add("opacity-0");

    setTimeout(() => {
        addPlaylistMenu.classList.add("hidden");
        
        addPlaylistMenuOpen = false;
        innerMenuTransitioning = false;
    }, 200);
}

function hideModifyMenu() {
    // prevents menu from clipping
    if (innerMenuTransitioning) return;
    
    innerMenuTransitioning = true;

    
    // fades out the modify menu
    modifyMenu.classList.add("opacity-0");

    setTimeout(() => {
        modifyMenu.classList.add("hidden");

        modifyMenuOpen = false;
        innerMenuTransitioning = false;
    }, 200);
}


/* Modify Menu Related Values */

function setObjectValues(objectId, isSong) {
    // if the object is a song, find it in the viewingPlaylist array, else, find the playlist in the allPlaylists array
    const object = isSong ? findObjectByIdentifier(viewingPlaylist.songs, objectId) : findObjectByIdentifier(allPlaylists, objectId);
    
    // gets the objects corresponding HTML div then checks if it exists
    const objectDiv = document.getElementById(object.elementId);

    if (objectDiv) {
        // gets the divs paragraph and img tag to replace their values
        const objectPara = objectDiv.querySelector("p");
        const objectImg = objectDiv.querySelector("img");
    
        // replaces the object's name
        const replacementName = document.getElementById("replace-name-input").value;
        object.name = replacementName;

        // replaces the paragraph/span element's name
        if (isSong) {
            const songSpanName = objectPara.querySelector("span");
            songSpanName.innerHTML = replacementName;
        }
        else objectPara.innerHTML = replacementName;
        
    
        if (isSong) {
            // replaces the object's artist if it's a song
            const replacementArtist = document.getElementById("replace-artist-input").value;
            object.artist = replacementArtist;
    
            // replaces the span element's artist
            const songSpanArtist = objectPara.querySelectorAll("span")[1];
            songSpanArtist.innerHTML = replacementArtist;
        }
    
        
        const replacementPicture = document.getElementById("replace-picture-img").src;
        if (!replacementPicture.includes("Images/music_note_white.png")) {
    
            // replaces the object's picture if the image isn't the default
            object.picture = replacementPicture;
    
            // replaces the img element's picture
            objectImg.src = replacementPicture;
        }
    }
    
    // updates the html for the currently playing song
    if (isSong) updateCurrentlyPlayingSongSection();

    // hides the menu
    hideModifyMenu();
}

function resetObjectValues(objectId, isSong) {
    // if the object is a song, find it in the viewingPlaylist array, else, find the playlist in the allPlaylists array
    const object = isSong ? findObjectByIdentifier(viewingPlaylist.songs, objectId) : findObjectByIdentifier(allPlaylists, objectId);
    
    // resets it's values
    object.name = object.originalName;
    object.picture = object.originalPicture;
    if (isSong) object.artist = object.originalArtist;

    // gets the objects corresponding HTML div then checks if it exists
    const objectDiv = document.getElementById(object.elementId);

    if (objectDiv) {
        // gets the div paragraph and img tag to replace their values
        const objectPara = objectDiv.querySelector("p");
        const objectImg = objectDiv.querySelector("img");
    
        objectImg.src = object.picture;
    
        if (isSong) {
            const songSpanName = objectPara.querySelector("span");
            const songSpanArtist = objectPara.querySelectorAll("span")[1];
    
            songSpanName.innerHTML = object.name;
            songSpanArtist.innerHTML = object.artist;
            
        }
        else objectPara.innerHTML = object.name;
    }

    // updates the html for the currently playing song
    if (isSong) updateCurrentlyPlayingSongSection();
    
    // hides the menu
    hideModifyMenu();
}

function showBlur() {
    // prevents clipping
    if (blurTransitioning) return;

    blurTransitioning = true;

    
    const blurDiv = document.getElementById("replace-picture-blur");
    const editBtn = document.getElementById("edit-btn-img");

    // shows the elements
    blurDiv.classList.remove("hidden");
    editBtn.classList.remove("hidden");

    // removes opacity
    setTimeout(() => {
        blurDiv.classList.remove("opacity-0");
        editBtn.classList.remove("opacity-0");
        
        blurTransitioning = false;
    }, 10);
}

function hideBlur() {
    // prevents clipping
    if (blurTransitioning) return;

    blurTransitioning = true;

    
    const blurDiv = document.getElementById("replace-picture-blur");
    const editBtn = document.getElementById("edit-btn-img");

    // adds opacity
    blurDiv.classList.add("opacity-0");
    editBtn.classList.add("opacity-0");

    // hides the elements
    setTimeout(() => {
        blurDiv.classList.add("hidden");
        editBtn.classList.add("hidden");

        blurTransitioning = false;
    }, 500);
}




