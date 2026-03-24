// CRESCENDO //
// DOCUMENT ELEMENTS
let dropZone = document.getElementById("drop-zone");
let fileInput = document.getElementById("file-input");
let playlistsEl = document.getElementById("playlists-el");
let songsEl = document.getElementById("songs-el");


// GLOBAL VARIABLES & CLASSES
// basic bulding block for every song
class Song {
    constructor(file) {
        this.file = file;
        this.name = file.name.split(".")[0];
        this.src = URL.createObjectURL(file);
        this.author = "unknown";
        this.elementId = `${name}-song`;
        this.promise = null;
    }

    play() { // resets the duration and plays the song
        const audioEl = document.getElementById(this.elementId);
        audioEl.currentTime = 0;
        this.promise = audioEl.play();
    }
    
    pause() { // pause music without causing any errors with a promise
        const audioEl = document.getElementById(this.elementId);
        
        if (this.promise !== undefined) {
            this.promise.then(_ => {
                audioEl.pause();
            })
            .catch(error => {
                console.warn(error);
            });
        }
    }
}

// basic bulding block for every playlist
class Playlist {
    constructor(name) {
        this.name = name;
        this.songs = [];
        this.elementId = `${name}-playlist`;
    }
    
    play() {
    
    }
    
    shuffle() {
    
    }
}

// the allSongs object keeps track of every song and the PLAYLISTS object may be furthur extended with new playlists
const allSongs = new Playlist("Songs");
let PLAYLISTS = [allSongs];
let CURRENT_PLAYLIST = allSongs;


// EVENT LISTENERS
// Prevents default browser behavior for drag events
["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults);
    // also prevents default bahaviour for the whole window
    window.addEventListener(eventName, preventDefaults); 
});

// Handles dropped files
dropZone.addEventListener("drop", handleDrop);

// Handles dropZone clicks
dropZone.addEventListener("click", () => { fileInput.click() });
fileInput.addEventListener("change", viewFiles);


// FUNCTIONS
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    // gets the FileList object and converts it into an array
    const files = e.dataTransfer.files;

    // if the files are valid, then it processes them and updates the website
    if (validateFiles(Array.from(files)) != null) {
        processFiles(files);
        updateWebsite();
    }
}

function viewFiles(e) {
    // gets the FileList object and converts it into an array
    const files = e.target.files;
    
    // if the files are valid, then it processes them and updates the website
    if (validateFiles(Array.from(files))) != null) {
        processFiles(files);
        updateWebsite();
    }
}

function validateFiles(files) {
    // validates the files exist
    if (files && files.length > 0) {
        
        // filters the files for audio files 
        const audioFiles = files.filter(file => file.type.startsWith("audio/"));
        
        // validates that there are any audio files
        if (audioFiles.length > 0) return audioFiles;
    }
    // returns null if nothing useful is obtained from the files
    return null
}

function processFiles(files) {
    // iterates over the files
    [...Array.from(files)].forEach(file => {
        // initializes a new song object containing the audio file then adds it to the allSongs object
        let newSong = new Song(file);
        allSongs.songs.push(newSong);
    });
}

function updateWebsite() {
    playlistsEl.innerHTML = '<h2 class="text-4xl text-blue-700 ml-20">Playlists</h2>';
    songsEl.innerHTML = '<h2 class="text-4xl text-blue-700 ml-75">Songs</h2>';
    
    
    PLAYLISTS.forEach(playlist => {
        playlistsEl.innerHTML += `<button id="${playlist.elementId}" class="text-3xl text-blue-700">${playlist.name}</button>`;
    })

    CURRENT_PLAYLIST.songs.forEach(song => {
        songsEl.innerHTML += `<audio id="${song.elementId}" src="${song.src}" class="text-xl text-blue-700">${song.name}</audio>`;
    })
}
