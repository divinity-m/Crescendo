# CRESCENDO - CSE Project
Crescendo is a website for uploading and enjoying your favourite music. Although websites such as spotify already exist for listening to music, they don't allow you to upload your own songs (not without paying for a subscription at the very least) and are often flooded with audio/video ads, which directly interfere with the music listening experience. This project was made for music enjoyers who want to upload their own songs freely, organize them, and play them without any audio-type interruptions.

The functionality is programmed entirely out of Javascript while the website formatting and user interface and is built with HTML and Tailwind CSS. Audio files can be uploaded through drag & drop or via clicking on the drag & drop button. When a song is uploaded it's automatically added into a default "Songs" playlist, which collects and stores every song the user uploads. New playlists can be added with the "+" button next to the "Playlist" header and songs can be played by clicking on their names or the play-button within the "Now Playing" section.

I was expecting to put a lot of effort into developing this project as there were many new concepts I knew I would be completely unfamilar with for the features I wanted to add; however, what I was not expecting was how captivated and completely invested I would be in almost every aspect of it's development. I've lost count of how many times I lost track of time and spent several hours working on this. I especially loved the straightforward solution I used to create song and playlist containers. In a JS function, I simply created a div node, then inserted in all of it's information with `.innerHTML`, this approach allowed me to code in both HTML and JS simutaneously while also maximising performance, there may have been a better way to do this somewhere out there, but I'm very satisfied with the results.

``` javascript
div = document.createElement("div")
div.innerHTML = `<p>example text</p>`
return div
```

I also believe that the file-uploading system, although not incredibly complex, was implemented effectively, especially the drag & drop feature which I had no piror experience with.

Despite the fact that I do like the bright blue theme, a couple of friends have told me that it's either very bright, or difficult to read due to the blue text. I'll admit that I did fall short in this category of web-design, I could have solved this through a dark-mode feature or sticking to the standard black/white text.

I was able to get the music visualizer working, but I dislike how it looks. I would prefer if it was more erratic and spiked more in the right side, but I wasn't able to get it to work.
