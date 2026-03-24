// CRESCENDO //
// Elements
let dropZone = document.getElementById("drop-zone");
let fileInput = document.getElementById("file-input");
let playlistsEl = document.getElementById("playlists-el");
let songsEl = document.getElementById("songs-el");

// Global Variables & Classes
// variables to store every song and playlist
let [songs, playlists] = [[], []];

// basic bulding block for every song
class Song {
    title, author, filetype;

    constructor(title, filetype) {
        this.title = title;
        this.author = "unknown";
        this.filetype = filetype;
    }
    
    play() {
    
    }
    
    pause() {
    
    }
}

// basic bulding block for every playlist
class Playlist {
    name;
    
    constructor(name) {
        this.name = name;
    }
    
    play() {
    
    }
    
    shuffle() {
    
    }
}

// Event Listeners
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

// Functions
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    // Get the FileList object
    const files = e.dataTransfer.files;

    if (files && files.length > 0) {
        processFiles(files);
    }
}

function viewFiles(e) {
    // Get the FileList object
    const files = e.target.files;

    if (files && files.length > 0) {
        processFiles(files);
    }
}

function processFiles(fileList) {
    // Validate every file before continuing
    const audioFiles = fileList.filter(file.type.startsWith("audio/"));
    
    // Assign the dropped files to the hidden input
    fileInput.files = audioFiles;
            
    // Process files by iterating over the FileList
    [...audioFiles].forEach(file => {
        console.log(file);
        /* example code to get me started later
        
        audioPlayer.src = URL.createObjectURL(file);
        audioPlayer.play();
        */
    });
}
