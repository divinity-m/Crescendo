/// CRESCENDO KEBAB-MENU.JS ///

/// Document Elements
const kebabMenu = document.getElementById("kebab-menu");
const modifyMenu = document.getElementById("modify-menu");
const addPlaylistMenu = document.getElementById("add-to-playlist-menu");


/// Global Variables
let [kebabMenuOpen, modifyMenuOpen, addPlaylistMenuOpen] = [ false, false, false, ];
let [kebabMenuTransitioning, innerMenuTransitioning, blurTransitioning] = [ false, false, false, ];
let currentKebabMenuAnchor = null;
let modifyMenuImageFile = null;


/// Event listeners
// Hides pop up menus when the page is clicked
document.addEventListener("click", hideMenusHandler);


/// Functions
function hideMenusHandler(e) {
    // if the kabab menu is open, the click wasn't inside the kebab menu, then hide the kebab menu
    if (
        kebabMenuOpen &&
        !kebabMenu.contains(e.target)
    )
        hideKebabMenu();
    
    // if the modify menu is open and the click wasn't inside it and the click wasn't inside the kebab menu
    // and the click wasn't inside the modify menu's image, then hide the modify menu
    if (
        modifyMenuOpen &&
        !modifyMenu.contains(e.target) &&
        !kebabMenu.contains(e.target) &&
        !imageFileInput.contains(e.target)
    )
        hideModifyMenu();

    // if the add playlist menu is open and the click wasn't inside it
    // and e.target wasn't inside the kebab menu, then close the add playlist menu
    if (
        addPlaylistMenuOpen &&
        !addPlaylistMenu.contains(e.target) &&
        !kebabMenu.contains(e.target)
    )
        hideAddPlaylistMenu();
}

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

    
    kebabMenu.classList.remove("hidden");

    setTimeout(() => {
        // removes classes so the menu slides outward and fades in
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
    
    
    // sets up the classes that make menu slide inward and fade out
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

    saveData();
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

    saveData();
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

    saveData();
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
                "w-98/100 h-20 px-5 flex items-center gap-3 hover:bg-blue-600/20 rounded-md";
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

                    saveData();
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
                    onclick="(() => { imageFileInput.click() })()"
                    ondrop="getImageFile(event)">
                            
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
            object.pictureFile = modifyMenuImageFile;
    
            // replaces the img element's picture
            objectImg.src = replacementPicture;
        }
    }
    
    // updates every song in every playlist and the current song section of the website
    if (isSong) {
        changeEverySong(objectId, object);
        updateCurrentlyPlayingSongSection();
    }

    // hides the menu
    hideModifyMenu();

    saveData();
}

function resetObjectValues(objectId, isSong) {
    // if the object is a song, find it in the viewingPlaylist array, else, find the playlist in the allPlaylists array
    const object = isSong ? findObjectByIdentifier(viewingPlaylist.songs, objectId) : findObjectByIdentifier(allPlaylists, objectId);
    
    // resets it's values
    object.name = object.originalName;
    object.picture = object.originalPicture;
    object.pictureFile = null;
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

    // updates every song in every playlist and the current song section of the website
    if (isSong) {
        changeEverySong(objectId, object);
        updateCurrentlyPlayingSongSection();
    }
    
    // hides the menu
    hideModifyMenu();

    saveData();
}


function changeEverySong(songId, newSong) {
    allPlaylists.forEach((playlist) => {
        const index = playlist.songs.findIndex((song) => song.identifier === songId);
        
        if (index > -1) {
            // replaces the following properties
            ["name", "artist", "picture"].forEach((property) => {
                playlist.songs[index][property] = newSong[property];
            })

            // "pictureFile" causes errors when places in the above array
            if (newSong.pictureFile) playlist.songs[index].pictureFile = newSong.pictureFile;
        }
    })
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
