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
        this.author = "unknown";
        this.file = file;
    }
    
    play() {
    
    }
    
    pause() {
    
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
let allSongs = new Playlist("All Songs");
let PLAYLISTS = [allSongs];


// EVENT LISTENERS
// Prevent default browser behavior for drag events
["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults);
    // also prevent default bahaviour for the whole window
    window.addEventListener(eventName, preventDefaults); 
});

// Handles dropped files
dropArea.addEventListener("drop", handleDrop);

// Handles dropArea clicks
dropArea.addEventListener("click", () => { fileInput.click() });
fileInput.addEventListener("change", viewFiles);


// FUNCTIONS
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    // Get the FileList object
    const files = e.dataTransfer.files;

    // Validate the files exist
    if (files && files.length > 0) processFiles(files);
}

function viewFiles(e) {
    // Get the FileList object
    const files = e.target.files;

    // Validate the files exist
    if (files && files.length > 0) processFiles(files);
}

function processFiles(fileList) {
    // Validate every file before continuing
    const audioFiles = fileList.filter(file.type.startsWith("audio/"));
    
    // Assign the dropped files to the hidden input
    fileInput.files = audioFiles;
            
    // Process files by iterating over the FileList
    [...audioFiles].forEach(file => {
        console.log(file);
        let songName = "song";

        // initialize a new song object and add it to the allSongs object
        let newSong = new Song(songName, file);
        allSongs.songs.push(song);

        
        /* example code to get me started later
        
        audioPlayer.src = URL.createObjectURL(file);
        audioPlayer.play();
        */
    });
}

function updateWebsite() {
    
}
