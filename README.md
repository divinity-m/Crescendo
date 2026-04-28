# CRESCENDO - CSE Project
Crescendo is a website for uploading and enjoying your favourite music. The functionality is programmed entirely out of Javascript while the website formatting and user interface and is built with HTML and Tailwind CSS. Audio files can be uploaded through drag & drop or via clicking on the drag & drop button. When a song is uploaded it's automatically added into a default "Songs" playlist, which collects and stores every song the user uploads. New playlists can be added with the "+" button next to the "Playlist" header and songs can be played by clicking on their names or the play-button within the "Now Playing" section.

I was expecting to put a lot of effort into developing this project as there were many new concepts I knew I would be completely unfamilar with for the features I wanted to add; however, what I was not expecting was how captivated and completely invested I would be in almost every aspect of it's development. I've lost count of how many times I lost track of time and spent several hours working on this. I especially loved the straightforward solution I used to create song and playlist containers. In a JS function, I simply created a div node, then inserted in all of it's information with `.innerHTML`, this approach allowed me to code in both HTML and JS simutaneously while also maximising performance, there may have been a better way to do this somewhere out there, but I'm very satisfied with the results.

``` javascript
div = document.createElement("div")
div.innerHTML = `<p>example text</p>`
return div
```

I also believe that the file-uploading system, although not incredibly complex, was implemented very effectively, especially the drag & drop which I had no piror experience with.
