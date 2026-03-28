// CRESCENDO SCRIPT.JS //

// DOCUMENT ELEMENTS //
/* Files */
const dropZone = document.getElementById("drop-zone");
const audioFileInput = document.getElementById("audio-file-input");

/* Containers */
const playlistsEl = document.getElementById("playlists-el");
const songsEl = document.getElementById("songs-el");
const nowPlayingEl = document.getElementById("now-playing-el");
const audioEl = document.getElementById("audio-el");

/* Other */
const kebabMenu = document.getElementById("kebab-menu");
const modifyMenu = document.getElementById("modify-menu");
const addPlaylistMenu = document.getElementById("add-to-playlist-menu");



// GLOBAL VARIABLES & CLASSES //
/* Songs & Playlist Classes */
class Song {
  constructor(file) {
    this.file = file;
    this.name = file.name.split(".")[0];
    this.src = URL.createObjectURL(file);
    this.artist = "unknown artist";
    this.elementId = `${this.name}-song`;
    this.promise = null;
    this.picture = "Images/music_note.png";
    this._playImg = "Images/playBtn.png";
  }

  play(restart) {
    this.playImg = "Images/pauseBtn.png";

    // resets the song if it has already ended or the parameter is true
    if (audioEl.currentTime === audioEl.duration || restart)
      audioEl.currentTime = 0;
    // changes the audio elements src then plays it, storing the .play() in a promise
    if (audioEl.src !== this.src) audioEl.src = this.src;
    this.promise = audioEl.play().catch((err) => {
      console.warn("Play interrupted:", err);
    });
  }

  pause() {
    this.playImg = "Images/playBtn.png";
    audioEl.pause();
  }

  // changes the elements play button image whenever playImg changes
  set playImg(value) {
    this._playImg = value;
    let playBtnEl = document.getElementById(`${this.elementId}-play-btn`);
    if (playBtnEl) playBtnEl.src = value;
  }
}

class Playlist {
  constructor(name) {
    this.name = name;
    this.songs = [];
    this.elementId = `${name}-playlist`;
    this.picture = "Images/music_note.png";
    this._playImg = "Images/playBtn.png";
    this.loopOn = false;
    this.shuffleOn = false;
  }

  shuffle() {
    // i'll work on this later
    // assign every song a random value (like as a porperty to their object) then .sort() them based on their random values
    // or some import some random module or smn
  }

  // changes the elements play button image whenever playImg changes
  set playImg(value) {
    this._playImg = value;
    const playBtnEl = document.getElementById(`${this.elementId}-play-btn`);
    if (playBtnEl) playBtnEl.src = value;
  }
}

/* global variables */
const ALLSONGS = new Playlist("Songs"); // necessary to keep track of every song
let allPlaylists = [ALLSONGS];
let [currentPlaylist, currentSong] = [ALLSONGS, null];

let [kebabMenuOpen, modifyMenuOpen, addPlaylistMenuOpen] = [false, false, false];
let currentKebabMenuAnchor = null;



// EVENT LISTENERS //

// Updates the allPlaylists and songs once the document and script have loaded in
window.addEventListener("load", () => {
  updateWebsite();
});

// Prevents default browser behavior for drag events considering the dropZone and the whole window
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, preventDefaults);
  window.addEventListener(eventName, preventDefaults);
});

// Handles dropped files
dropZone.addEventListener("drop", handleDrop);

// Handles dropZone clicks
dropZone.addEventListener("click", () => {
  audioFileInput.click();
});
audioFileInput.addEventListener("change", viewFiles);

// Hides menus when the page is clicked
document.addEventListener("click", (e) => {
  if (!kebabMenu.contains(e.target) && kebabMenuOpen && e.target !== currentKebabMenuAnchor) hideKebabMenu();
    
  if (!modifyMenu.contains(e.target) && modifyMenuOpen && !kebabMenu.contains(e.target)) hideModifyMenu();
    
  if (!addPlaylistMenu.contains(e.target) && addPlaylistMenuOpen && !kebabMenu.contains(e.target)) hideAddPlaylistMenu();
});



// FUNCTIONS //

/* Drop Zone Related Functions */
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function handleDrop(e) {
  // gets the FileList object through dataTransfer
  const files = e.dataTransfer.files;

  // checks file validity then it processes them and updates the website
  const validatedFiles = validateFiles(Array.from(files));
  if (validatedFiles !== null) {
    processFiles(validatedFiles);
    updateWebsite();
  }
}

function viewFiles(e) {
  // gets the FileList object through target
  const files = e.target.files;

  // checks file validity then it processes them and updates the website
  const validatedFiles = validateFiles(Array.from(files));
  if (validatedFiles !== null) {
    processFiles(validatedFiles);
    updateSongsSection();
  }
}

function validateFiles(files) {
  // validates the files exist
  if (files && files.length > 0) {
    // filters the files for audio files
    const audioFiles = files.filter((file) => file.type.startsWith("audio/"));

    // stores unduped files
    let unduplicatedFiles = [];

    // iterates through the audioFiles array and compares its files to the existing songs in the ALLSONGS object
    audioFiles.forEach((file) => {
      const potentialDupe = new Song(file);
      if (
        ALLSONGS.songs.length < 1 ||
        !ALLSONGS.songs.some((song) => song.name === potentialDupe.name)
      ) unduplicatedFiles.push(file);
    });

    // validates that there are any unduplicated files before returning them
    if (unduplicatedFiles.length > 0) return unduplicatedFiles;
  }
  // returns null if nothing useful is obtained from the files (all the conditions aren't met)
  return null;
}

function processFiles(files) {
  [...Array.from(files)].forEach((file) => {
    // initializes a new song object containing the audio file then adds it to the ALLSONGS object
    const newSong = new Song(file);
    ALLSONGS.songs.push(newSong);
  });
}

/* Basic UI Related Functions */
function createPlaylistDiv(playlist) {
  const div = document.createElement("div");

  // sets div's id and class
  div.id = `${playlist.elementId}`
  div.className = "h-18 pl-5 flex items-center gap-3 hover:bg-blue-600/20"
  // creates the div's content
  div.innerHTML = `
              <img src="${playlist.picture}" class="w-15 h-15 p-1 bg-blue-600/60 rounded-md">
              <p class="text-3xl text-blue-700 hover:text-blue-700/60 hover:cursor-default"
                onclick="showPlaylistSongs('${playlist.name}')">${playlist.name}</p>
              <img id="${playlist.elementId}-play-btn"  src="${playlist._playImg}"
                class="w-7.5 h-7.5 hover:w-8 hover:h-8 hover:-ml-px hover:-mt-px"
                onclick="playPlaylist('${playlist.name}')">
              <img src="Images/editBtn.png"
                class="w-7.5 h-7.5 hover:bg-[#0000FF1A] rounded-3xl"
                onclick="openPlaylistMenu('${playlist.name}', this)">`
  return div;
}

function createSongDiv(song) {
  const div = document.createElement("div");

  // sets div's id and class
  div.id = `${song.elementId}`
  div.className = "h-18 pl-5 flex items-center gap-3 hover:bg-blue-600/20"

  // creates the div's content
  div.innerHTML = `
              <img src="${song.picture}" class="w-15 h-15 p-1 bg-blue-600/60 rounded-md">
              <p class="flex flex-col justify-center text-left">
                <span class="text-2xl text-blue-700 hover:text-blue-700/80 hover:cursor-default"
                  onclick="playSong('${song.name}')">
                    ${song.name}</span>
                <span class="text-md text-blue-600 hover:text-blue-600/50 hover:cursor-default">
                    ${song.artist}</span>
               </p>
               <img id="${song.elementId}-play-btn" src="${song._playImg}"
                 class="w-7.5 h-7.5 hover:w-8 hover:h-8 hover:-ml-px hover:-mt-px"
                 onclick="playSong('${song.name}')">
               <img src="Images/editBtn.png"
                 class="w-7.5 h-7.5 hover:bg-[#0000FF1A] rounded-3xl"
                 onclick="openSongMenu('${song.name}', this)">`

  return div;
}

function updatePlaylistsSection() {
  // clears the playlistsEl
  playlistsEl.querySelectorAll("div").forEach((div) => {
    playlistsEl.removeChild(div);
  })
    
  // creates a div for every playlist
  allPlaylists.forEach((object) => {
    const playlistDiv = createPlaylistDiv(object);
    playlistsEl.appendChild(playlistDiv);
  });
}

function updateSongsSection() {
  // clears the songsEl
  songsEl.querySelectorAll("div").forEach((div) => {
    songsEl.removeChild(div);
  })
    
  // adds every created song into the songs section
  currentPlaylist.songs.forEach((song) => { 
    const songDiv = createSongDiv(song);
    songsEl.appendChild(songDiv);
  });
}

function updateCurrentlyPlayingSongSection() {
  // sets up the image and text of the currently playing song
  let potentialSong = {
      "picture": "Images/music_note.png",
      "name": "No Song Selected",
      "artist": "...",
  }
    
  // checks if a song has been chosen
  if (currentSong != null) potentialSong = currentSong;

  // updates the inner html
  nowPlayingEl.innerHTML = `
            <img src="${potentialSong.picture}" class="w-60">
            <p class="text-3xl text-blue-700 hover:text-blue-700/80 hover:cursor-default">${potentialSong.name}</p>
            <p class="text-xl text-blue-600 hover:text-blue-600/50 hover:cursor-default">${potentialSong.artist}</p>`;
}


function updateWebsite() {
  updatePlaylistsSection();
  updateSongsSection();
  updateCurrentlyPlayingSongSection();
}

function addNewPlaylist() {
  let index = 1;

  // iterate through the allPlaylists to find one with the basic 'Playlist #' format
  // if a playlist with the default format exists, the index becomes a number higher than it
  allPlaylists.forEach((playlist) => {
    if (playlist.name.startsWith("Playlist")) {
      let playlistNum = playlist.name.split(" ")[1];
      if (+playlistNum >= index) index = +playlistNum + 1;
    }
  });

  // makes a playlist with the index then pushes it into allPlaylists
  const newPlaylist = new Playlist(`Playlist ${index}`);
  allPlaylists.push(newPlaylist);

  // makes a new div for the playlist
  const playlistDiv = createPlaylistDiv(newPlaylist);
  playlistsEl.appendChild(playlistDiv);
}

function findObjectByName(array, name) {
  // finds the object's index through a findIndex search
  const index = array.findIndex((object) => object.name === name);

  // returns the object
  if (array[index]) return array[index];
  else return null;
}

function playPlaylist(playlistName) {
  const playlistClicked = findObjectByName(allPlaylists, playlistName);

  // only proceeds with the logic if the playlist has songs
  if (playlistClicked.songs.length > 0) {
    // prevents errors caused by currentSong being null by default
    if (currentSong === null) currentSong = playlistClicked.songs[0];

    if (currentPlaylist.name !== playlistClicked.name) {
      // swaps the image of the old playlist before redifining currentPlaylist
      currentPlaylist.playImg = "Images/playBtn.png";
      
      currentPlaylist = playlistClicked;
    }

    // plays the first song in the songs array
    playSong(playlistClicked.songs[0].name, true);
  }
}

function playSong(songName, restart = false) {
  const songClicked = findObjectByName(currentPlaylist.songs, songName);

  // prevents errors caused by currentSong being null by default
  if (currentSong === null) currentSong = songClicked;

  // pauses the previously playing song before redifining currentSong
  if (currentSong.name !== songClicked.name && !currentSong.paused) {
      currentSong.pause();
  }
    
  currentSong = songClicked;

  // plays or pauses the song based on the play button image
  if (songClicked._playImg === "Images/playBtn.png" || restart) songClicked.play(restart);
  else songClicked.pause();

  // updates the play button image of the current playlist
  currentPlaylist.playImg = songClicked._playImg;

  // updates the html
  updateCurrentlyPlayingSongSection();
}

function showPlaylistSongs(playlistName) {
  const playlistClicked = findObjectByName(allPlaylists, playlistName);
  currentPlaylist = playlistClicked;

  updateSongsSection();
}

/* Kebab Menu Functions */
function openPlaylistMenu(playlistName, element) {
  let options = [
    {
      label: "Change Details",
      action: () => toggleModifyPlaylistMenu(playlistName),
    },
    {
      label: "Delete Playlist",
      action: () => deletePlaylist(playlistName),
    }
  ]

  // removes option two if ALLSONGS is the chosen playlist
  if (playlistName === "Songs") options.splice(1, 1);
    
  toggleMenu(element, options);
}

function openSongMenu(songName, element) {
  let options = [
    {
      label: "Add to playlist",
      action: () => toggleAddPlaylistMenu(songName),
    },
    {
      label: "Remove from this playlist",
      action: () => removeFromPlaylist(songName),
    },
    {
      label: "Change Details",
      action: () => toggleModifySongMenu(songName),
    },
    {
      label: "Delete song",
      action: () => deleteSong(songName),
    },
  ]
    
  // removes option two if ALLSONGS is currently open
  if (currentPlaylist.name === "Songs") options.splice(1, 1);
    
  toggleMenu(element, options);
}

function toggleMenu(element, options) {
  // checks if the menu is already open
  if (kebabMenuOpen && currentKebabMenuAnchor === element) {
    hideKebabMenu();
    return;
  }
  
  kebabMenuOpen = true;
  currentKebabMenuAnchor = element;
  
  // clears the menu
  kebabMenu.replaceChildren();
  
  // adds options
  options.forEach((option) => {
    const para = document.createElement("p");
    para.textContent = option.label;
    para.className = "px-4 py-2 hover:bg-[#FFFFFF10] cursor-pointer";

    para.onclick = () => {
    option.action();
    hideKebabMenu();
    };

    kebabMenu.appendChild(para);
  });

  // positions the menu next to the clicked element
  const rect = element.getBoundingClientRect();

  kebabMenu.style.top = `${rect.top + window.scrollY}px`;
  kebabMenu.style.left = `${rect.right + 5}px`;

  // provides classes so the menu slides outward and fades in
  kebabMenu.classList.remove("hidden");

  setTimeout(() => {
    kebabMenu.classList.remove("opacity-0", "-translate-x-2");
  }, 10);
}

function hideKebabMenu() {
  // provides classes so the menu slides inward and fades out
  kebabMenu.classList.add("opacity-0", "-translate-x-2");

  setTimeout(() => {
    kebabMenu.classList.add("hidden");
  }, 200);
    
  kebabMenuOpen = false
  currentKebabMenuAnchor = null;
}

/* Functions For The Kebab Menu Options */
function removeFromPlaylist(songName) {
  // targets the index, then splices the song
  const index = currentPlaylist.songs.findIndex((song) => song.name === songName);
  currentPlaylist.songs.splice(index, 1);
}


function deleteSong(songName) {
  allPlaylists.forEach((playlist) => {
    // targets the index, checks if it's valid, then splices the song
    const index = playlist.songs.findIndex((song) => song.name === songName);
    if (index > -1) playlist.songs.splice(index, 1);
  })

  updateSongsSection();
}

function deletePlaylist(playlistName) {
  const playlist = findObjectByName(allPlaylists, playlistName);

  // deletes the playlist's div
  const div = document.getElementById(playlist.elementId);
  playlistsEl.removeChild(div);

  // bug prevention
  if (currentPlaylist.name === playlist.name) {
    currentPlaylist = ALLSONGS;
    updateSongsSection();
  }

  // deletes the playlist from the playlists array
  const index = allPlaylists.findIndex((object) => object.name === playlistName);
  allPlaylists.splice(index, 1);
}

/* Functions For The Kebab Menu Options Which Involve Menu Creation */
function toggleAddPlaylistMenu(songName) {
  addPlaylistMenuOpen = true;

  // clears the menu
  addPlaylistMenu.replaceChildren();

  // adds content to the menu
  if (allPlaylists.length === 1) {
    const para = document.createElement("p");
    para.textContent = "You have no unique playlists to add songs to.";
    para.id = "user-lacks-playlist-popup";
    para.className = "text-blue-800";

    addPlaylistMenu.appendChild(para);
  }
  else {
    allPlaylists.forEach((playlist) => {
      const div = document.createElement("div");
    })
  }

  // fades in the playlist menu
  addPlaylistMenu.classList.remove("hidden");
    
  setTimeout(() => {
    addPlaylistMenu.classList.remove("opacity-0");
  }, 10);
}

function toggleModifySongMenu(songName) {
  const song = findObjectByName(currentPlaylist.songs, songName);
  modifyMenuOpen = true;

  // fades in the modify menu
  modifyMenu.classList.remove("hidden");
    
  setTimeout(() => {
    modifyMenu.classList.remove("opacity-0");
  }, 10);
}

function toggleModifyPlaylistMenu(playlistName) {
  const playlist = findObjectByName(allPlaylists, playlistName);
  modifyMenuOpen = true;

  // fades in the modify menu
  modifyMenu.classList.remove("hidden");
    
  setTimeout(() => {
    modifyMenu.classList.remove("opacity-0");
  }, 10);
}

function hideAddPlaylistMenu() {
  // fades out the playlist menu
  addPlaylistMenu.classList.add("opacity-0");
    
  setTimeout(() => {
    addPlaylistMenu.classList.add("hidden");
  }, 200);

  addPlaylistMenuOpen = false;
}

function hideModifyMenu() {
  // fades out the playlist menu
  modifyMenu.classList.add("opacity-0");
    
  setTimeout(() => {
    modifyMenu.classList.add("hidden");
  }, 200);
    
  modifyMenuOpen = false;
}
