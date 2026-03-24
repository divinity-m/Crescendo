// CRESCENDO //
// DOCUMENT ELEMENTS
let dropZone = document.getElementById("drop-zone");
let fileInput = document.getElementById("file-input");
let playlistsEl = document.getElementById("playlists-el");
let songsEl = document.getElementById("songs-el");


// GLOBAL VARIABLES & CLASSES
// basic bulding block for every song
class Song {
    constructor(name, file) {
        this.name = name;
        this.file = file;
        this.author = "unknown";
        this.elementId = `${name}-el`;
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
    }
    
    play() {
    
    }
    
    shuffle() {
    
    }
}

// the allSongs object keeps track of every song and the PLAYLISTS object may be furthur extended with new playlists
let allSongs = new Playlist("Songs");
let PLAYLISTS = [allSongs];


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
    // Gets the FileList object
    const files = e.dataTransfer.files;

    // Validates the files exist
    if (files && files.length > 0) {
        processFiles(Array.from(files));
        updateWebsite();
    }
}

function viewFiles(e) {
    // Gets the FileList object
    const files = e.target.files;

    // Validates the files exist
    if (files && files.length > 0) {
        processFiles(Array.from(files));
        updateWebsite();
    }
}

function processFiles(fileList) {
    // Validates every file then assigns the files to the hidden input element
    console.log(fileList);
    const audioFiles = fileList.filter(file => file.type.startsWith("audio/"));
    fileInput.files = audioFiles;
    
    [...audioFiles].forEach(file => {
        console.log(file);
        let songName = "song";

        // initializes a new song object containing the audio file then adds it to the allSongs object
        let newSong = new Song(songName, file);
        allSongs.songs.push(song);
    });
}

function updateWebsite() {
    playlistsEl.innerHTML = '<h2 class="text-4xl text-blue-700 ml-20">Playlists</h2>';
    songsEl.innerHTML = '<h2 class="text-4xl text-blue-700 ml-75">Songs</h2>';
    
    
    PLAYLISTS.forEach(playlist => {
        playlistsEl.innerHTML += `<button class="text-3xl text-blue-700">${playlist.name}</button>`;
        // songsEl.innerHTML += `<audio id="${song.elementId}" src="${song.file}"></audio>`;
    })

    
}
