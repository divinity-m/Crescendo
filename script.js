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
        this.elementId = `${this.name}-song`;
        this.promise = null;
        this.picture = "Images/music_note.png";
        this.playImg = "Images/playBtn.png";
    }

    play() { // resets the duration if the song is over then plays the song
        const audioEl = document.getElementById(this.elementId).querySelector("audio");
        if (audioEl.currentTime === audioEl.duration) audioEl.currentTime = 0;
        this.promise = audioEl.play();
    }
    
    pause() { // pauses music without causing any errors by using a promise
        const audioEl = document.getElementById(this.elementId).querySelector("audio");
        
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
        this.picture = "Images/music_note.png";
        this.playImg = "Images/playBtn.png";
    }
    
    play() {
    // plays the first song in the songs array
    }

    loop() {
    // when the last song is complete, play the first song again
    }
    
    shuffle() {
    // assign every song a random value (like as a porperty to their object) then .sort() them based on their random values
    // or some import some random module or smn
    }
}

// the allSongs object keeps track of every song and the PLAYLISTS object may be furthur extended with new playlists
const allSongs = new Playlist("Songs");
let PLAYLISTS = [allSongs];
let CURRENT_PLAYLIST = allSongs;
let CURRENT_SONG = null;


// EVENT LISTENERS
// Prevents default browser behavior for drag events considering the dropZone and the whole window
["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults);
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
    if (validateFiles(Array.from(files)) !== null) {
        processFiles(files);
        updateWebsite();
    }
}

function viewFiles(e) {
    // gets the FileList object and converts it into an array
    const files = e.target.files;
    
    // if the files are valid, then it processes them and updates the website
    const validatedFiles = validateFiles(Array.from(files));
    if (validatedFiles !== null) {
        processFiles(validatedFiles);
        updateWebsite();
    }
}

function validateFiles(files) {
    // validates the files exist
    if (files && files.length > 0) {
        
        // filters the files for audio files 
        const audioFiles = files.filter(file => file.type.startsWith("audio/"));
        
        // stores unduped files
        let unduplicatedFiles = [];

        // iterates through the audioFiles array and compares its files to the existing songs in the allSongs array
        audioFiles.forEach(file => {
            // allSongs.songs.forEach(existingSong => {
            //     const potentialDupe = new Song(file);
                
            //     if (potentialDupe.name !== existingSong.name) unduplicatedFiles.push(file);
            //     else console.log(`Duplicate Song Name: ${potentialDupe.name} - Existing Song Name: ${existingSong.name}`);
            // })
            const potentialDupe = new Song(file);
            if (allSongs.songs.length < 1 || !(allSongs.songs.some(song => song.name === potentialDupe.name)) ) unduplicatedFiles.push(file);
        })

        // validates that there are any unduplicated files before returning them
        if (unduplicatedFiles.length > 0) return unduplicatedFiles;
    }
    // returns null if nothing useful is obtained from the files (all the conditions aren't met)
    return null;
}

function processFiles(files) {
    // iterates over the files
    [...Array.from(files)].forEach(file => {
        // initializes a new song object containing the audio file then adds it to the allSongs object
        const newSong = new Song(file);
        allSongs.songs.push(newSong);
    });
}

function updateWebsite() {
    playlistsEl.innerHTML = '<h2 class="text-5xl text-blue-700 font-bold mb-5 pl-5 pt-2.5">Playlists</h2>';
    songsEl.innerHTML = '<h2 class="text-5xl text-blue-700 font-bold mb-5 pl-5 pt-2.5">Songs</h2>';
    
    
    PLAYLISTS.forEach(playlist => {
        playlistsEl.innerHTML += `
            <div id="${playlist.elementId}" class="h-18 pl-5 flex items-center gap-3 hover:bg-blue-600/20">
                <img src="${playlist.picture}" class="w-15 h-15 p-1 bg-blue-600/60 rounded-md">
                <p class="text-3xl text-blue-700 hover:text-blue-700/80">${playlist.name}</p>
                <img src="${playlist.playImg}"
                     class="w-7.5 h-7.5 hover:w-8 hover:h-8 hover:-ml-px hover:-mt-px"
                     onclick="playPlaylist(${playlist.name})">
            </div>
        `;
    })

    CURRENT_PLAYLIST.songs.forEach(song => {
        songsEl.innerHTML += `
            <div id="${song.elementId}" class="h-18 pl-5 flex items-center gap-3 hover:bg-blue-600/20">
                <img src="${song.picture}" class="w-15 h-15 p-1 bg-blue-600/60 rounded-md">
                <p class="text-3xl text-blue-700 hover:text-blue-700/80">${song.name}</p>
                <img src="${song.playImg}"
                     class="w-7.5 h-7.5 hover:w-8 hover:h-8 hover:-ml-px hover:-mt-px"
                     onclick="playSong(${song.name})">
                <audio src="${song.src}" class="text-xl text-blue-700"></audio>
            </div>
        `;
    })
}

// Plays the first song in a playlist if the playlist was just chosen, or plays/pauses the currently playing/paused song in a playlist
function playPlaylist(playlistName) {
    // finds the playlist through a findIndex search
    let index = PLAYLISTS.findIndex(playlist => playlist.name === playlistName);
    let playlistClicked = PLAYLISTS[index];
    
    if (playlistClicked.songs.length > 0) {
        if (CURRENT_SONG === null) CURRENT_SONG = playlistClicked.songs[0];
        
        if (CURRENT_PLAYLIST.name === playlistClicked.name) {
            playSong(CURRENT_SONG);
        }
        else {
            CURRENT_SONG.pause();
            CURRENT_PLAYLIST = playlistClicked;
            if (CURRENT_PLAYLIST.songs.length > 0) playSong(CURRENT_PLAYLIST.songs[0]);
        }
            
        updateWebsite();
    }
}


// Plays or pauses a song
function playSong(songName) {
    // finds the song through a findIndex search
    let index = CURRENT_PLAYLIST.songs.findIndex(song => song.name === songName);
    let songClicked = CURRENT_PLAYLIST.songs[index];
    CURRENT_SONG = songClicked;

    if (CURRENT_SONG.playImg === "Images/playBtn.png") {
        CURRENT_SONG.playImg = "Images/pauseBtn.png";
        CURRENT_SONG.play();
    }
    else {
        CURRENT_SONG.playImg = "Images/playBtn.png";
        CURRENT_SONG.pause();
    }

    updateWebsite();
}
