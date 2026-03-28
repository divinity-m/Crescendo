// CRESCENDO SCRIPT.JS //
// DOCUMENT ELEMENTS //
/* Files */
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");

/* Containers */
const playlistsEl = document.getElementById("playlists-el");
const songsEl = document.getElementById("songs-el");
const nowPlayingEl = document.getElementById("now-playing-el");

/* Other */
const audioEl = document.getElementById("audio-el");
const kebabMenu = document.getElementById("kebab-menu");

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
    this.playImg = "Images/playBtn.png";
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
}

class Playlist {
  constructor(name) {
    this.name = name;
    this.songs = [];
    this.elementId = `${name}-playlist`;
    this.picture = "Images/music_note.png";
    this.playImg = "Images/playBtn.png";
    this.loopOn = false;
    this.shuffleOn = false;
  }

  shuffle() {
    // assign every song a random value (like as a porperty to their object) then .sort() them based on their random values
    // or some import some random module or smn
  }
}

/* global variables */
const ALLSONGS = new Playlist("Songs"); // necessary to keep track of every song
let allPlaylists = [ALLSONGS];
let [currentPlaylist, currentSong] = [ALLSONGS, null];

let menuOpen = false;
let currentMenuAnchor = null;

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
  fileInput.click();
});
fileInput.addEventListener("change", viewFiles);

// Hides the kebab menu when the page is clicked
document.addEventListener("click", (e) => {
  if (!kebabMenu.contains(e.target) && menuOpen && e.target !== currentMenuAnchor) hideMenu();
});

// FUNCTIONS //

/* Drop Zone Related Functions */
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
    const audioFiles = files.filter((file) => file.type.startsWith("audio/"));

    // stores unduped files
    let unduplicatedFiles = [];

    // iterates through the audioFiles array and compares its files to the existing songs in the ALLSONGS object
    audioFiles.forEach((file) => {
      const potentialDupe = new Song(file);
      if (
        ALLSONGS.songs.length < 1 ||
        !ALLSONGS.songs.some((song) => song.name === potentialDupe.name)
      )
        unduplicatedFiles.push(file);
    });

    // validates that there are any unduplicated files before returning them
    if (unduplicatedFiles.length > 0) return unduplicatedFiles;
  }
  // returns null if nothing useful is obtained from the files (all the conditions aren't met)
  return null;
}

function processFiles(files) {
  // iterates over the files
  [...Array.from(files)].forEach((file) => {
    // initializes a new song object containing the audio file then adds it to the ALLSONGS object
    const newSong = new Song(file);
    ALLSONGS.songs.push(newSong);
  });
}

/* Basic UI Related Functions */
function updateWebsite() {
  // Sets up the playlist and song html headers
  
  playlistsEl.innerHTML = `
        <header class="h-20 sticky top-0 z-1 bg-linear-to-b from-blue-600 to-inherit flex items-center gap-3">
            <h2 class="mb-5 pl-5 pt-2.5 text-5xl text-blue-700 hover:text-blue-700/80 font-bold">Playlists</h2>
            <img src="Images/addBtn.png"
                 class="w-10 h-10 hover:w-10.5 hover:h-10.5 hover:-ml-px hover:-mt-px"
                 onclick="addNewPlaylist()">
        </header>`;
  songsEl.innerHTML = `
        <header class="h-20 sticky top-0 z-1 bg-linear-to-b from-blue-600 to-inherit">
            <h2 class="mb-5 pl-5 pt-2.5 text-5xl text-blue-700 hover:text-blue-700/80 font-bold">Songs</h2>
        </header>`;

  // Adds every created playlist into the playlist section
  allPlaylists.forEach((playlist) => {
    playlistsEl.innerHTML += `
            <div id="${playlist.elementId}" class="h-18 pl-5 flex items-center gap-3 hover:bg-blue-600/20">
                <img src="${playlist.picture}" class="w-15 h-15 p-1 bg-blue-600/60 rounded-md">
                <p class="text-3xl text-blue-700 hover:text-blue-700/60 hover:cursor-default"
                   onclick="showPlaylistSongs('${playlist.name}')">${playlist.name}</p>
                <img src="${playlist.playImg}"
                     class="w-7.5 h-7.5 hover:w-8 hover:h-8 hover:-ml-px hover:-mt-px"
                     onclick="playPlaylist('${playlist.name}')">
                <img src="Images/editBtn.png"
                     class="w-7.5 h-7.5 hover:bg-[#0000FF1A] rounded-3xl"
                     onclick="openPlaylistMenu('${playlist.name}', this)">
            </div>
        `;
  });

  // Adds every created song into the songs section
  currentPlaylist.songs.forEach((song) => {
    songsEl.innerHTML += `
            <div id="${song.elementId}" class="h-18 pl-5 flex items-center gap-3 hover:bg-blue-600/20">
                <img src="${song.picture}" class="w-15 h-15 p-1 bg-blue-600/60 rounded-md">
                <div class="flex flex-col justify-center text-left">
                  <p class="text-3xl text-blue-700 hover:text-blue-700/80 hover:cursor-default"
                     onclick="playSong('${song.name}')">
                     ${song.name}</p>
                  <p class="text-xl text-blue-700/70 hover:text-blue-600/50 hover:cursor-default">
                     ${song.artist}</p>
                </div>
                <img src="${song.playImg}"
                     class="w-7.5 h-7.5 hover:w-8 hover:h-8 hover:-ml-px hover:-mt-px"
                     onclick="playSong('${song.name}')">
                <img src="Images/editBtn.png"
                   class="w-7.5 h-7.5 hover:bg-[#0000FF1A] rounded-3xl"
                   onclick="openSongMenu('${song.name}', this)">
            </div>
        `;
  });

  // sets up the image and text of the currently playing song
  if (currentSong != null) {
    nowPlayingEl.innerHTML = `
            <img src="${currentSong.picture}" class="w-60">
            <p class="text-3xl text-blue-700 hover:text-blue-700/80 hover:cursor-default">${currentSong.name}</p>
            <p class="text-xl text-blue-700/70 hover:text-blue-600/50 hover:cursor-default">${currentSong.artist}</p>
    `;
  } else {
    nowPlayingEl.innerHTML = `
            <img src="Images/music_note.png" class="w-60">
            <p class="text-3xl text-blue-700 hover:text-blue-700/80 hover:cursor-default">No Song Selected</p>
    `;
  }
}

function findObjectByName(array, name) {
  // finds the object's index through a findIndex search
  let index = array.findIndex((object) => object.name === name);

  // returns the object
  return array[index];
}

function playPlaylist(playlistName) {
  let playlistClicked = findObjectByName(allPlaylists, playlistName);

  // only proceeds with the logic if the playlist has songs
  if (playlistClicked.songs.length > 0) {
    // prevents errors caused by currentSong being null by default
    if (currentSong === null) currentSong = playlistClicked.songs[0];

    if (currentPlaylist.name !== playlistClicked.name) {
      // pauses the old song and swaps the image of the old playlist before redifining currentPlaylist
      currentPlaylist.playImg = "Images/playBtn.png";
      currentPlaylist = playlistClicked;
    }

    // plays the first song in the songs array
    playSong(playlistClicked.songs[0].name, true);

    updateWebsite();
  }
}

function playSong(songName, restart = false) {
  let songClicked = findObjectByName(currentPlaylist.songs, songName);

  // prevents errors caused by currentSong being null by default
  if (currentSong === null) currentSong = songClicked;

  // pauses the previously playing song a changes currentSong
  if (currentSong.name !== songClicked.name && !currentSong.paused)
    currentSong.pause();
  currentSong = songClicked;

  // plays or pauses the song based on the play button image
  if (songClicked.playImg === "Images/playBtn.png" || restart)
    songClicked.play(restart);
  else songClicked.pause();

  // updates the play button image of the current playlist
  currentPlaylist.playImg = songClicked.playImg;

  updateWebsite();
}

function addNewPlaylist() {
  let index = 1;

  // iterate through the allPlaylists to find one with the basic 'Playlist #' format
  // if a playlist with the default format exists, the index becomes a number higher than it
  allPlaylists.forEach((playlist) => {
    if (playlist.name.startsWith("Playlist")) {
      let playlistNum = playlist.name.split(" ")[1];
      if (+playlistNum === index) index = +playlistNum + 1;
    }
  });

  // makes a playlist with the index then pushes it into allPlaylists
  let newPlaylist = new Playlist(`Playlist ${index}`);
  allPlaylists.push(newPlaylist);

  updateWebsite();
}

function showPlaylistSongs(playlistName) {
  let playlistClicked = findObjectByName(allPlaylists, playlistName);
  currentPlaylist = playlistClicked;

  updateWebsite();
}

/* Kebab Menu Functions */
function openPlaylistMenu(playlistName, element) {
  toggleMenu(element, [
    {
      label: "Rename Playlist",
      action: () => renamePlaylist(playlistName),
    },
    {
      label: "Delete Playlist",
      action: () => deletePlaylist(playlistName),
    },
  ]);
}

function openSongMenu(songName, element) {
  toggleMenu(element, [
    {
      label: "Add to playlist",
      action: () => addToPlaylist(songName),
    },
    {
      label: "Remove from playlist",
      action: () => removeFromPlaylist(songName),
    },
    {
      label: "Rename song",
      action: () => renameSong(songName),
    },
    {
      label: "Delete song",
      action: () => deleteSong(songName),
    },
  ]);
}

function toggleMenu(element, options) {
  // checks if the menu is already open
  if (menuOpen && currentMenuAnchor === element) {
    hideMenu();
    return;
  }
  
  menuOpen = true;
  currentMenuAnchor = element;
  
  // clears the menu
  kebabMenu.querySelectorAll('p').forEach(p => {
    kebabMenu.removeChild(p)
  })
  
  // adds options
  options.forEach((option) => {
    if (
      (option.label !== "Remove from playlist" &&
        currentPlaylist.name !== "Songs") ||
      (option.label === "Remove from playlist" &&
        currentPlaylist.name !== "Songs") ||
      (option.label !== "Remove from playlist" &&
        currentPlaylist.name === "Songs")
    ) {
      const item = document.createElement("p");
      item.textContent = option.label;
      item.className =
        "px-4 py-2 hover:bg-[#FFFFFF10] cursor-pointer";

      item.onclick = () => {
        option.action();
        hideMenu();
      };

      kebabMenu.appendChild(item);
    }
  });

  // positions the menu next to the clicked element
  const rect = element.getBoundingClientRect();

  kebabMenu.style.top = `${rect.top + window.scrollY}px`;
  kebabMenu.style.left = `${rect.right + 5}px`;

  // the menu slides outward and fades in
  kebabMenu.classList.remove("hidden");

  setTimeout(() => {
    kebabMenu.classList.remove("opacity-0", "-translate-x-2");
  }, 10);
}

function hideMenu() {
  // the menu slides inward and fades out
  kebabMenu.classList.add("opacity-0", "-translate-x-2");

  setTimeout(() => {
    kebabMenu.classList.add("hidden");
  }, 200);
  menuOpen = false
  currentMenuAnchor = null;
}

/* Functions For The Kebab Menu Options */
function addToPlaylist(songName) {
  let song = findObjectByName(currentPlaylist, songName);
  allPlaylists.push(song);

  updateWebsite();
}

function renameSong(songName) {
  let song = findObjectByName(currentPlaylist, songName);

  updateWebsite();
}

function deleteSong(songName) {
  let song = findObjectByName(currentPlaylist, songName);

  updateWebsite();
}

function renamePlaylist(playlistName) {
  let playlist = findObjectByName(allPlaylists, playlistName);

  updateWebsite();
}

function deletePlaylist(playlistName) {
  let playlist = findObjectByName(allPlaylists, playlistName);

  updateWebsite();
}
