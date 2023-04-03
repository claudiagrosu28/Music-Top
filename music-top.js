var editButtonid;
var editsongindex;
class Song {
  constructor(name, artist) {
    this.name = name;
    this.artist = artist;
    this._entryTopDate = new Date();
    this._votes = 0;
    this.songid = this._entryTopDate.getTime();
  }
  get entryTopDate() {
    return this._entryTopDate;
  }
  vote() {
    this._votes++;
  }
  getVoteCount() {
    return this._votes;
  }
}
class HtmlSong extends Song {
  constructor(name, artist) {
    super(name, artist);
  }
  getHTML() {
    return (
      '<form onsubmit="return submitForm()"><li>' +
      "Song Name:" +
      this.name +
      " Artist:" +
      this.artist +
      " Date:" +
      this._entryTopDate.getDate() +
      "/" +
      (this._entryTopDate.getMonth() + 1) +
      "/" +
      this._entryTopDate.getFullYear() +
      " " +
      this._entryTopDate.getHours() +
      ":" +
      this._entryTopDate.getMinutes() +
      " Votes:" +
      this._votes +
      ' <button type="submit">Vote</button> </li></form>'
    );
  }
}
class MusicTop {
  _songs = [];
  addsong(name, artist) {
    this._songs.push(new HtmlSong(name, artist));
    console.log("Song:", name, "of artist:", artist, "was succesfuly added.");
    addSongtoJSON(
      name,
      artist,
      this._songs[this._songs.length - 1]._entryTopDate,
      this._songs[this._songs.length - 1]._votes,
      this._songs[this._songs.length - 1].songid
    );
  }
  songTransfer(name, artist, date, votes, songid) {
    this._songs.push(new HtmlSong(name, artist));
    this._songs[this._songs.length - 1]._entryTopDate = new Date(date);
    this._songs[this._songs.length - 1].songid = songid;
    this._songs[this._songs.length - 1]._votes = votes;
  }
  getTop() {
    var topCopy = this._songs.slice();
    topCopy.sort(function (a, b) {
      if (a.getVoteCount() !== b.getVoteCount()) {
        return b.getVoteCount() - a.getVoteCount();
      }
      return b._entryTopDate.getTime() - a._entryTopDate.getTime();
    });
    return topCopy;
  }
  changeNameAndArtist(songid, name, artist) {
    this._songs[songid].name = name;
    this._songs[songid].artist = artist;
  }
}
class MusicTopHtmlGenerator {
  static getHtml(musictop) {
    var allSongs = musictop.getTop();
    let html = "<ol>";
    for (var i = 0; i < allSongs.length; i++) {
      html +=
        "<li>" +
        "Song name:" +
        allSongs[i].name +
        " Artist:" +
        allSongs[i].artist +
        " Date:" +
        allSongs[i]._entryTopDate.getDate() +
        "/" +
        (allSongs[i]._entryTopDate.getMonth() + 1) +
        "/" +
        allSongs[i]._entryTopDate.getFullYear() +
        " " +
        allSongs[i]._entryTopDate.getHours() +
        ":" +
        allSongs[i]._entryTopDate.getMinutes() +
        " Votes:" +
        allSongs[i]._votes +
        ' <button onclick="voteSong(' +
        allSongs[i].songid +
        ')"">Vote</button> ' +
        ' <button onclick="editSong(' +
        allSongs[i].songid +
        ')"">Edit</button> ' +
        ' <button onclick="deleteSong(' +
        allSongs[i].songid +
        ')"">Delete</button> </li>';
    }
    html += "</ol>";
    return html;
  }
}

const submitButton = document.getElementById("submit-button");
const searchButton = document.getElementById("search-button");
const artistInput = document.getElementById("artist-input");
const songInput = document.getElementById("song-input");
const applyButton = document.getElementById("apply-button");
const musicTopContainer = document.getElementById("music-top-container");

const musicTop = new MusicTop();

fetch("https://rapid-fine-mask.glitch.me/melodii/")
  .then((response) => response.json())
  .then((json) => addSongstoMusicTopJSON(json))
  .catch((error) => console.log("error: ", error.message));

function addSongstoMusicTopJSON(obj) {
  for (var i = 0; i < obj.length; i++) {
    musicTop.songTransfer(
      obj[i].name,
      obj[i].artist,
      obj[i].date,
      obj[i].votes,
      obj[i].songid
    );
  }
  refreshMusicTop();
}

submitButton.addEventListener("click", () => {
  const songName = songInput.value.trim();
  const songArtist = artistInput.value.trim();
  if (songName && songArtist) {
    musicTop.addsong(songName, songArtist);
    document.getElementById("form").reset();
    const topHtml = MusicTopHtmlGenerator.getHtml(musicTop);
    const container = document.getElementById("top-container");
    container.innerHTML = topHtml;
  }
});

searchButton.addEventListener("click", () => {
  const songName = songInput.value.trim();
  const songArtist = artistInput.value.trim();
  fetch(
    `https://rapid-fine-mask.glitch.me/melodii/?name=${songName}&artist=${songArtist}`
  )
    .then((response) => response.json())
    .then((json) => {
      if (json.length > 0) {
        window.alert("The song was found in the top!");
      } else {
        window.alert("The song wasn't found in the top!");
      }
    })
    .catch((error) => console.log("error: ", error.message));
  /*fetch(`https://rapid-fine-mask.glitch.me/melodii/?q=${songName}`)
    .then((response) => response.json())
    .then((arrayForName) => {
      if (arrayForName.length == 0) {
        window.alert("The song wasn't found in the top!");
      } else if (arrayForName.length == 1) {
        fetch(`https://rapid-fine-mask.glitch.me/melodii/?q=${songArtist}`)
          .then((response) => response.json())
          .then((arrayForArtist) => {
            for (var i = 0; i < arrayForArtist.length; i++)
              if (arrayForArtist[i].artist == arrayForName[0].artist) {
                window.alert("The song was found in the top!");
                return;
              }
            window.alert("The song wasn't found in the top!");
          })
          .catch((error) => console.log("error: ", error.message));
      } else {
        fetch(`https://rapid-fine-mask.glitch.me/melodii/?q=${songArtist}`)
          .then((response) => response.json())
          .then((arrayForArtist) => {
            if (arrayForArtist.length > 0) {
              if (
                arrayForArtist.find(
                  (x) =>
                    x.name ===
                    arrayForName.find((y) => y.name === songName).name
                ).name ==
                  arrayForName.find(
                    (x) =>
                      x.artist ===
                      arrayForArtist.find((y) => y.artist === songArtist).artist
                  ).name &&
                arrayForArtist.find(
                  (x) =>
                    x.name ===
                    arrayForName.find((y) => y.name === songName).name
                ).artist ==
                  arrayForName.find(
                    (x) =>
                      x.artist ===
                      arrayForArtist.find((y) => y.artist === songArtist).artist
                  ).artist
              )
                window.alert("The song was found in the top!");
              else window.alert("The song wasn't found in the top!");
            } else window.alert("The song wasn't found in the top!");
          })
          .catch((error) => console.log("error: ", error.message));
      }
    })
    .catch((error) => console.log("error: ", error.message));*/
  document.getElementById("form").reset();
});

applyButton.addEventListener("click", () => {
  const songName = songInput.value.trim();
  const songArtist = artistInput.value.trim();
  musicTop.changeNameAndArtist(editsongindex, songName, songArtist);
  fetch("https://rapid-fine-mask.glitch.me/melodii/" + editButtonid, {
    method: "PATCH",
    body: JSON.stringify({
      name: songName,
      artist: songArtist,
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .catch((error) => console.log("error: ", error.message));
  refreshMusicTop();
  document.getElementById("form").reset();
});

function refreshMusicTop() {
  const topContainer = document.getElementById("top-container");
  topContainer.innerHTML = MusicTopHtmlGenerator.getHtml(musicTop);
}

function voteSong(songid) {
  for (var i = 0; i < musicTop._songs.length; i++)
    if (songid == musicTop._songs[i].songid) {
      musicTop._songs[i].vote();
      voteUpdateJSON(songid, musicTop._songs[i].getVoteCount());
    }
  refreshMusicTop();
}

function addSongtoJSON(name, artist, date, votes, songid) {
  fetch("https://rapid-fine-mask.glitch.me/melodii/", {
    method: "POST",
    body: JSON.stringify({
      name: name,
      artist: artist,
      date: date,
      votes: votes,
      songid: songid,
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .catch((error) => console.log("error: ", error.message));
}

function voteUpdateJSON(songid, votes) {
  fetch("https://rapid-fine-mask.glitch.me/melodii/")
    .then((response) => response.json())
    .then((json) => {
      var x = json;
      var idGeneratedByJSON;
      for (var i = 0; i < x.length; i++) {
        if (songid == x[i].songid) {
          idGeneratedByJSON = x[i].id;
        }
      }
      fetch("https://rapid-fine-mask.glitch.me/melodii/" + idGeneratedByJSON, {
        method: "PATCH",
        body: JSON.stringify({
          votes: votes,
        }),
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
      })
        .then((response) => response.json())
        .catch((error) => console.log("error: ", error.message));
    });
}

function deleteSong(songid) {
  fetch("https://rapid-fine-mask.glitch.me/melodii/")
    .then((response) => response.json())
    .then((json) => {
      var x = json;
      var idGeneratedByJSON;
      for (var i = 0; i < x.length; i++) {
        if (songid == x[i].songid) {
          idGeneratedByJSON = x[i].id;
        }
      }
      fetch("https://rapid-fine-mask.glitch.me/melodii/" + idGeneratedByJSON, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .catch((error) => console.log("error: ", error.message));
    });
  for (var j = 0; j < musicTop._songs.length; j++)
    if (songid == musicTop._songs[j].songid) musicTop._songs.splice(j, 1);
  refreshMusicTop();
}

function editSong(songid) {
  fetch("https://rapid-fine-mask.glitch.me/melodii/")
    .then((response) => response.json())
    .then((json) => {
      var x = json;
      var idGeneratedByJSON;
      for (var i = 0; i < x.length; i++) {
        if (songid == x[i].songid) {
          idGeneratedByJSON = x[i].id;
          document
            .getElementById("artist-input")
            .setAttribute("value", x[i].artist);
          document
            .getElementById("song-input")
            .setAttribute("value", x[i].name);
          editsongindex = i;
        }
      }
      editButtonid = idGeneratedByJSON;
    });
}
