// CRESCENDO //
// Elements
dropZone = document.getElementById("drop-zone");
fileInput = document.getElementById("file-input");
playlistsEl = document.getElementById("playlists");
songsEl = document.getElementById("songs");

// Global Variables & Classes
// stores every song and playlist
let songs, playlists = [], [];
//
class Song = {
  def _init() {
    
  }
  def play() {
    
  }
  def pause() {
    
  }
}
class Playlist = {
  def _init() {
    
  }
  def play() {
    
  }
  def shuffle() {
    
  }
}

// Event Listeners
// Prevent default browser behavior for drag events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults);
    // Also prevent default for the whole window to stop the browser from opening the file
    window.addEventListener(eventName, preventDefaults); 
});
// Handles dropped files
dropArea.addEventListener('drop', handleDrop);

// Functions
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    // Get the FileList object from the event
    const files = e.dataTransfer.files;

    if (files.length > 0) {
        audioFile = files[0];

        // Furthur validation
        if (audioFile.type.startsWith('audio/')) {
            
            // Assign the dropped files to the hidden input
            fileInput.files = files;
            
            // Process files by iterating over the FileList
            [...files].forEach(file => {
                console.log(file)
            });
        }
    }
}
