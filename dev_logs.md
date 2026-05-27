Starting Date: March 23, 2026 \
Days are just days-since-started, so there may be a large void in days at some parts (like Day 13 - Day 17).

# Day 1 - Monday | In class & At home work #
I spent the entire day working on the basic UI and I chose to use Tailwind CSS to style everything. I also decided to name the website Crescendo, mainly because the word 'crescendo' is music-related and I think it sounds cool.
At home, I created a `Songs` class, `Playlist` class, and a default `allSongs` object (from the `Playlist` class) to keep track of every existing song. I also completed a little bit of the file-uploading code at home, it's still incomplete.

Things Added:
 - Basic UI (via HTML + Tailwind CSS)
 - A `Songs` and `Playlist` class
 - Some file-uploading code complete

<br>

# Day 2 - Tuesday | In class & At home work #
Audio files can now be added into the website by clicking the drag-and-drop box to open your file list, or dragging and dropping a file into the box. I also improved the basic UI.
I tried to add a safeguards to prevent duplicate-files, but nothing was working. I've been looking for a way to iterate through the fileList obtained from `e.target.files` and `e.dataTransfer.files` then compare it's files to the already existing/uploaded files in the `allSongs.songs` array.
To start, I made a function called `validateFiles` which accepts a `files` parameter and returns either `null` or an array of the validated/unduplicated files. I first converted the fileList into an array with `Array.from()` then passed that array into the `validateFiles` function. `validateFiles` iterates through the array of files, converts every file into a Song object like so: `const potentialDupe = new Song(file)`, then compares eachs potential duplicate song to the existing song objects in the allSongs.songs array with an if-statement:
` if (allSongs.songs.length < 1 || allSongs.songs.some(song => song.name !== potentialDupe.name)) unduplicatedFiles.push(file); `
This method was concise, but failed.

Things Added:
 - File-uploading system
 - UI improvements
 - Minimal progress on duplicate-files prevention
 - A play-pause system

<br>

# Day 3 - Wednesday (Career Day) | At home work #
With the console, I started heavily testing what may have been going wrong in the duplicate-prevention code and noticed something very important. When the standard built-in `.some()` method is paired with the `!==` operator, it returns true if there's an element in the array that's not equal to the provided value. I originally belived it only returned true if every single element is not equal to the provided value, and as a result, the duplicate files would always get improperly validated.
With this newfound knowledge, I quickly found a solution that worked: 
` if (allSongs.songs.length < 1 || !(allSongs.songs.some(song => song.name === potentialDupe.name)) ) unduplicatedFiles.push(file); `

After this, I spent a couple hours on the UI. I also created a logo for the website and a little tab-icon, the designs are based off of the standard crescendo musical notation.

Things Added:
 - Anti-duplicate file system
 - UI improvements
 - Created a logo

<br>

# Day 4 - Thursday | In class & At home work #
I decided to focus more on designing the website than writing new logic. I had trouble recoloring icons to match of my website's theme so Gavin gave me a short lesson on photoshop and the skills he learned from digital arts. His advice helped a ton and I can definitely see myself using them in future projects as well.

Things Added:
 - UI improvements

<br>

# Day 5 - Friday | In class & At home work #
I wanted to implement scrolling into the "Playlists" and "Songs" sections of the website, but I couldn't figure out how to make the header tags stay in place when their parent `div` element scrolled up and down. None of my friends could figure it out either so I asked Mr. Durstling and learned that I needed to use a CSS property called 'sticky' to keep the header in place. I also increased the z-index to position the header over every other element.

I discovered a very useful browser feature called 'Local Overrides', which allows me to make changes to web content locally with my own scripts. This breakthrough made coding with github much faster. Although, I still need to periodically update the repository scripts to keep the website up to date on the serverside.

I encountered a couple bugs while trying to make my code more readable. I wanted to change a structural aspect of my HTML, initually, every song div would have their own `<audio>` tag with its own unique attributes, I wanted to only have one `<audio>` tag that plays every song. I tried to implement this and quickly encountered an error. Whenever I would try to play new a song and pause & replace the previous one, this error message popped up.
` The play() request was interrupted by a call to pause(). `
I threw whatever I think of at my script but nothing fixed the error. I tried playing the song first then pausing the previous one. I tried seperating the pause and play into seperate functions. Then finally, I tried asking chatGPT what I could possibly be doing wrong.

The issue revolves around how `.pause()` is synchronous while `.play()` is asynchronous, causing it to have a slight delay with the overall process. With the way my code originally worked, I stored the `audio.play()` in a `promise` whenever I played a song. Whenever a song is paused, the `promise` is checked first before pausing. As a result, both the `.pause()` and `.play()` become asynchronous, and due to how I started using only a single audio element to handle all the songs, the `.pause()` and `.play()` fight over who does what, meanwhile the audio element has no clue whats going on, and everything just breaks. To fix this, I scrapped the `promise` entirely, ensuring that the previous song would pause before a new song played, a simple and straightforward fix.
I dissapointed that I couldn't fix the issue with my own coding knowledge, but I learned something new in the process so I think it balances out.

I began working on a kebab menu (the little 3 dots that open up a small menu) so users can add a specific song to a playlist or change the name of a song/playlist. I've never made anything like it before so I did a lot of research on youtube and also got some help from chatGPT to figure out the setup for the UI and pop-up logic. This was definietly a lot less complex than I originally thought it was. So far, only the UI is set up, the logic for each button is still incomplete.

Things Added:
 - UI improvements (scrolling)
 - Improved code-readability
 - Fixed bugs in the play-pause system
 - Kebab menu design

<br>

# Day 6 - Saturday (Spring Break has begun) | At home work #
I spent around an hour revamping a lot of the code in a function called `updatewebsite()`. This function refreshed all the playlist and song divs in the HTML, it used `.innerHTML` quite often. It was called everytime something in the page changed, so even the slightest update would have it be called. Initially, I didn't really care too much about it, but then I realized, there's absolutely no reason to refresh 80% of the paged because a single song was uploaded into the website. So I split updateWebsite() into 3 separate functions that could refresh parts of the page independently. The 3 separate functions also had their own modifications as well:
``` javascript
// ORIGINAL STYLE //
songsEl.innerHTML = "";
songsEl.innerHTML += "<div>a bunch of content</div>" // this would be looped to create a div for every song


// REVAMP
songsEl.replaceChildren();

// this section below would be looped to create a div for every song
const div = document.createElement(div);
div.innerHTML = "a bunch of content";
songsEl.appendChild(div);
```
Despite the revamp having more lines, I believe it's a more efficient approach because it avoids the re-parsing and rebuilding caused by using `element.innerHTML +=` on an existing element.

I also used up about another hour working on the basic buttons for the kebab menu. I didn't encounter many issues with buttons like "Delete Song" and "Delete Playlist".

Where things became complicated is the buttons which involved the creation of another pop-up menu, such as "Add song to playlist", and "Change Details". I probably spent about 5 hours working on the "Add song to playlist" option alone—mainly because I vehemently chose not to get outside help.
I lost track of the amount of times my functions would clash with each other while I was working on this, it really was a struggle, but I managed to fully completed the button with nothing but my existing knowledge.
The the "Add song to playlist option" is selected, a function named `toggleAddPlaylistMenu` is called. This function reveals a menu in the middle of the screen. This menu contains every playlist excluding the default 'Songs' playlist. When one of the playlists in the menu is clicked, a song is added into it.

After that I spent another hour making updates to the UI. Now, the currently viewing playlist and currently playing song is bolded. Certain buttons also become transaprent when they're pressed.

I started working on the "Change Details" kebab-menu option, which reveals a menu div (named `modifyMenu`) when its clicked. Some of it's functionality was already complete when I started because I worked on this alongside the "Add to playlist" button.
I implemented logic to provide the modifyMenu with an image element, input elements, and a button element.
The image element calls an anonymous function when its clicked. The function requests an image file to replace the image of the song/playlist. The input elements accept string data for replacing the name or music artist of a song/playlist. The button calls a function called `setObjectValues` to confirm every replacement. `setObjectValues` is currently unfinished, but I plan to work on it later.

Things Added:
 - Improved website performance through splitting functions into smaller parts
 - Comlpleted a lot of the kebab menu logic
 - UI improvements

<br>

# Day 7 - Sunday | At home work #
I wanted to make a new property for the `Playlist` and `Song` classes called `identifier`. Currently, for my code to compare two songs or two playlists, it checks for their `name` property. This is how it finds duplicates and creates certain div-element id's.
That logic would clash heavily with code for renaming songs, so I decided to make an `identifier` property for the classes. I then made a function called `createNewId` to efficiently create identifiers for songs and playlists. Lastly I scanned every single line to change up recurring logic like `if (existingSong.name === newSong.name)` to `if (existingSong.identifier === newSong.identifier)`.
I also had to update `validateFiles`. Now it detects duplicates by comparing file name, file size, and file type. I'm aware that this also has it's limits, but it's an improvement in its own right. I also discovered javascripts ternary operator while researching duplicate-prevention methods.

After this, I finished up all of the logic for `setObjectValues` without much issue and I added a backdrop blur to the img-element in the modify menu. The effect appears when the cursor hovers over it.

I started to work on a custom slider for the audio element that syncs with the songs current time. I got the logic working, but getting the styling to look right has been a real pain, it includes working with `-webkit` in CSS, which is almost foreign to me.
Right now the slider's design is very unfinished but I've made a little progress after finding this website which provides a lot of useful informaition on how to design range-type input's. [Website]("https://codepen.io/ShadowShahriar/pen/zYPPYrQ")

Things Added:
 - Created a property for identifying songs & playlists, requiring many adjustments in the script
 - Improved the anti-duplicate system
 - Finished the kebab menu logic
 - UI improvements + Started making a custom audio-element slider

<br>

# Day 8 - Monday | At home work #
It took a few hours, but after using the website above as a template, filtering out the css-logic I couldn't make sense of, then mixing in javascript into the styling, I made a functional and decent looking slider for the audio element.
I also wanted to put numbers on both sides of the slider to show the current time into the song and the total time of the song. Completing this didn't nearly as long as it did for the slider the slider, but I still had to do a bit of research because I didn't know how to convert seconds into a HH:MM:SS format.

I started working on 4 new buttons: shuffle, previous song, next song, and loop. Can't have a music player without them. I also decided to make all of their icons .svg files instead of the typical .png which I've been using this entire project. I only did this because I recently remembered that .svg files scale with the screen, otherwise, I would've made every other one of my images a .svg.

The previous song, next song, and loop buttons were very straightforward, it was only the shuffle button I had to do research to figure out how to get working. It's still incomplete right now, but I have a Fisher-Yates shuffle algorithm in place for it's basic functionality.

Things Added:
 - Finished the custom audio-element slider
 - Previous song, next song, and loop buttons
 - A bit of the shuffle button

<br>

# Day 9 - Tuesday | At home work #
Okay. Coding the shuffle button was a lot more of a pain than I originally thought it would be. The shuffle button's logic itself wasn't the issue, rather, it was while I was testing it's logic that I discovered a fundamentally website breaking bug which took me from yesterday until today to find a solution for.
When a user looks into another playlist while a song is playing in a different playlist, the song continues playing on it's own without any issues, but if 'looping' is enabled and that song ends, what should happen is that the playlist which was playing the song should simply move onto the next song in it's array. But what was happening, was that the playlist the user is currently viewing would try to play the next song actual playlist's array, then an error would be thrown if that song didn't exist in the viewing playlists array. This issue makes it impossible to look through other playlists while listening to music, so I couldn't just overlook it.
To fix it, I was very lost, in fact, I didn't even touch my code until today. I spent around 30 minutes to an hour just thinking of possible solutions then never going about using them them either because they would create more issues or they would be very inefficient and severely reduce code-readability. Nonetheless, I found something that worked. One new parameter.
My playSong() function sounds simple but it does several checks and redefines a couple global variables before even touching `.play()`. It had 3 parameters, `songId`, `restart`, and `preshuffled`, the most important one here is songId, which is necessary for deciding what song is to be played. But the songId just tells the function what song to interact with, it doesn't give the function and information on what playlist is playing that song, to figure that out I originally just inserted this line into the function: `playingPlaylist === viewingPlaylist`. I honestly have no idea how I never saw any issues with that up until now, after all, the playing playlist isn't always the playlist the user is looking at. So I removed that line and instead gave the function a `playlistId` parameter so it can properly define `playingPlaylist`.
I thought of implementing the solution yesterday but I avoided it because I believed that giving one function 4 parameters was unnecessary and overkill, but right now, see it as one of the best and probably most effective solutions with minimal drawbacks.
After I finally fixed this issue, I spent a short while getting the shuffle logic to integrate correctly with the rest of the code.

The website is basically complete now. There are just 3 more features I want to add. A search bar, a music visualizer which uses an API, and local data saving.
I started working on a `searchBarHandler` function for the search bar's event listener, and I found out that it's structurally very similar to a function I already made `updateSongsSection` which fully refreshes a portion of the page, but it had a few key differences needed locating specific songs.

Things Added:
 - Fixed a bug which prevented music from playing while viewing other playlists
 - Finished the shuffle button
 - Started making a search bar

<br>

# Day 10 - Wednesday | At home work #
I finished up the `searchBarHandler` function fairly quickly, and I made sure to make it avoid recreating song-divs that fit the searches query and already exist in the page. 
I made an 'ondrop' event handler attribute for the `<img>` tag in the modify menu, allowing users to drop image files into the tag if they want to.

Things Added:
 - Finished the search bar
 - Images files can now be dropped onto the image in the modify menu

<br>

# Day 11 - Thursday | At home work #
I started working on data saving and since I've already worked with saving local data in old projects, I thought it wouldn't be much of a issue. Then I encountered an issue. Javascript's `localStorage` API can't handle large files, it can barely handle 5MB, so there's no way I could get it to save audio files. Due to this, I had to learn about a whole new way to save data locally.
I chose to learn how to work with `indexedDB`. At first, it was incredibly difficult to understand how it functions and it's methods. Even just `indexedDB.open("DB", 1)` made zero sense to me, but that's just how learning new things is. I had to use a lot of Youtube, Stackoverflow, and ChatGPT before things started making sense.
Right now, the database only stores one items, a variable called `allPlaylists` which contains every playlist, and so by extension, every song, which is all I think actually matters.

Things Added:
 - A local auto save system

<br>

# Day 13 - Saturday | At home work #
I started and finished working on the music visualizer. This was another new concept to me, but I quickly understood the basics setup after this video https://www.youtube.com/watch?v=AQggCuH4QkM. I created a new `visualizer.js` file to store all of the new code I added due to the fact that my main `script.js` file was getting crammed to the point where even I was struggling to navigate the code. From there I did a lot of extra research on how to make the visualizer more appealing, such as smoothening out the movement of its bars and making the bars near the center larger.

Things Added:
 - The Music Visualizer
 - A visualizer.js file

<br>

# Day 17 - Tuesday | At school work #
I encountered an incredibly elusive issue with my website. When I open the page normally (via the github link or refreshing the page), the audio-element would never make noise, even if I tried to force it with `audioEl.play()`, but if I were to save my code (with ctrl+s in VSCode), all audio-related functionality worked just fine. Just deciphering took a very long time, so I determined that this bug was too far out of my programming knowledge to fix on my own. I asked Mr. Durstling if he was familiar with the bug, and fortunately he knew the exact reason and solution for it.
The bug was directly related to the newly implemented music visualizer. Similarly to how browsers prevent `audioEl.play()` from making and noise when the page loads, browsers also suspend `AudioContext` objects on page load. To add to this, the `createMediaElementSource` method of the `AudioContext` class controls the output generated by the element attatched to it via the Web Audio API graph (if `AudioContext` is suspended, the graph doesn't generate any data). When the browser auto-suspended my `AudioContext` object, my audio-element linked to it through `createMediaElementSource` was blocked from creating noise.
The fix was incredibly simple, I just had to create an event listener that unsuspends the `AudioContext` when the user interacts with the page.
```javascript
/* resume the audio context on first user interaction */
document.addEventListener("click", () => { 
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    } 
}, { once: true });
```

Things Fixed:
 - Audio element not playing

<br>

# Day 18 - Wednesday | In class & At home work #
I decided to shorten the script.js file by creating a seperate file for all of the kebab-menu related code. This separated about 600 lines of code. \
I've also added a new feature which allows users to drag their songs up and down a playlist. Adding the drag/drop mechanism was no issue, but I did have to research methods for reordering items in an array. For this feature I didn't want songs to swap places when they were moved around, I wanted them to simply "shift" up or down the playlist, while the songs around it shifted up or down by 1. Thankfully I could do this easily by using `.splice()` to reorder the array of songs.

Things Added:
 - A kebab-menu.js file
 - A drag/drop mechanism for organizing songs

<br>

# Day 23 - Monday | In class work #
I used to same logic for the songs to make the playlists reorganizable.

Things Added:
 - A drag/drop mechanism for organizing playlists
