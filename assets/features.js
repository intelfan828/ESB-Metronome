const songList = [
  { label: "A", bpm: 130, name: "Ain't No Mountain High Enough" },
  { label: "A", bpm: 124, name: "Ain't Too Proud to Beg" },
  { label: "A", bpm: 115, name: "American Girl" },
  { label: "A", bpm: 150, name: "Autumn Leaves" },

  { label: "B", bpm: 119, name: "Billie Jean" },
  { label: "B", bpm: 116, name: "Blame It on the Boogie" },
  { label: "B", bpm: 129, name: "Blue Bossa" },
  { label: "B", bpm: 108, name: "Brick House" },
  { label: "B", bpm: 148, name: "Brown Eyed Girl" },
  { label: "B", bpm: 132, name: "Boogie Shoes" },
  { label: "B", bpm: 116, name: "Bust a Move" },

  { label: "C", bpm: 113, name: "Can't Stop the Feeling!" },
  { label: "C", bpm: 150, name: "Crocodile Rock" },
  { label: "C", bpm: 135, name: "Crazy Train" },

  { label: "D", bpm: 119, name: "Dance With Somebody" },
  { label: "D", bpm: 126, name: "Dancing in the Street" },
  { label: "D", bpm: 104, name: "December 1963 (Oh What a Night)" },
  { label: "D", bpm: 132, name: "Disco Inferno" },
  { label: "D", bpm: 124, name: "Don't Start Now" },
  { label: "D", bpm: 119, name: "Don't Stop Believin'" },
  { label: "D", bpm: 122, name: "Drive My Car" },
  { label: "D", bpm: 120, name: "Dynamite" },

  { label: "F", bpm: 132, name: "Five Hundred Miles-500 Miles)" },

  { label: "G", bpm: 123, name: "Give It To Me Baby" },
  { label: "G", bpm: 113, name: "Get Down Tonight" },
  { label: "G", bpm: 129, name: "Girl from Ipanema" },
  { label: "G", bpm: 105, name: "Go Around In Circles" },

  { label: "H", bpm: 110, name: "Hold On, I'm Comin'" },
  { label: "H", bpm: 119, name: "Hot Hot Hot" },

  { label: "I", bpm: 90, name: "I'll Be There" },
  { label: "I", bpm: 108, name: "I Wish" },
  { label: "I", bpm: 118, name: "I Will Survive" },
  { label: "I", bpm: 128, name: "I Gotta Feeling" },
  { label: "I", bpm: 115, name: "It's Not Unusual" },

  { label: "J", bpm: 129, name: "Jump" },
  { label: "J", bpm: 93, name: "Just My Imagination" },
  { label: "J", bpm: 120, name: "Juice" },
  { label: "J", bpm: 111, name: "Jumpin' Jack Flash" },

  { label: "K", bpm: 111, name: "Kiss" },

  { label: "L", bpm: 120, name: "Le Freak" },
  { label: "L", bpm: 102, name: "Let's Stay Together" },
  { label: "L", bpm: 134, name: "Love Shack" },

  { label: "M", bpm: 108, name: "My Girl" },
  { label: "M", bpm: 136, name: "Mony Mony" },
  { label: "M", bpm: 148, name: "Mr. Brightside" },

  { label: "O", bpm: 122, name: "Old Time Rock and Roll" },
  { label: "O", bpm: 104, name: "Ob-La-Di, Ob-La-Da" },

  { label: "P", bpm: 120, name: "Power of Love" },
  { label: "P", bpm: 110, name: "Play That Funky Music" },
  { label: "P", bpm: 104, name: "Put a Little Love in Your Heart" },
  { label: "P", bpm: 121, name: "Proud Mary" },

  { label: "R", bpm: 115, name: "Respect" },

  { label: "S", bpm: 134, name: "Shake Your Groove Thing" },
  { label: "S", bpm: 119, name: "Shake Your Body (Down to the Ground)" },
  { label: "S", bpm: 128, name: "Shut Up and Dance" },
  { label: "S", bpm: 108, name: "Signed, Sealed, Delivered" },
  { label: "S", bpm: 139, name: "Summer of '69" },
  { label: "S", bpm: 127, name: "Sweet Caroline" },

  { label: "T", bpm: 104, name: "This Is How We Do It" },
  { label: "T", bpm: 128, name: "Twist and Shout" },

  { label: "U", bpm: 115, name: "Uptown Funk" },

  { label: "V", bpm: 108, name: "Valerie" },

  { label: "W", bpm: 121, name: "We Are Family" },
  { label: "W", bpm: 152, name: "We Got the Beat" },
  { label: "W", bpm: 112, name: "Wherever You Will Go" },

  { label: "Y", bpm: 108, name: "You Sexy Thing" },
  { label: "Y", bpm: 108, name: "You're the One That I Want" },
];

// Audio context and oscillator setup
let audioContext;
let clickBuffer;
let isSoundEnabled = false;

// Initialize audio
async function initAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create a simple click sound
    const sampleRate = audioContext.sampleRate;
    const duration = 0.05; // 50ms click
    const buffer = audioContext.createBuffer(
      1,
      sampleRate * duration,
      sampleRate
    );
    const data = buffer.getChannelData(0);

    // Create a click sound with a quick attack and decay
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      data[i] = Math.sin(2 * Math.PI * 1000 * t) * Math.exp(-t * 50);
    }

    clickBuffer = buffer;
  } catch (error) {
    console.error("Error initializing audio:", error);
    isSoundEnabled = false;
    document.getElementById("sound-toggle").disabled = true;
  }
}

// Play click sound
function playClick() {
  if (!isSoundEnabled || !audioContext || !clickBuffer) return;

  const source = audioContext.createBufferSource();
  source.buffer = clickBuffer;
  source.connect(audioContext.destination);
  source.start();
}

// Register service worker for offline functionality
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log("ServiceWorker registration successful");
        // Check for updates
        registration.update();
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed: ", err);
      });
  });
}

// Prevent zooming on double tap
document.addEventListener(
  "touchstart",
  function (event) {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  },
  { passive: false }
);

let lastTouchEnd = 0;
document.addEventListener(
  "touchend",
  function (event) {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  },
  false
);

const bpmInput = document.getElementById("bpm");
const bpmDisplay = document.getElementById("bpm-display");
const startStopButton = document.getElementById("start-stop");
const songSelect = document.getElementById("song-select");
const soundToggleButton = document.getElementById("sound-toggle");
const saveBpmButton = document.getElementById("save-bpm");
const addSongToggle = document.getElementById("add-song-toggle");
const addSongForm = document.getElementById("add-song-form");
const submitNewSong = document.getElementById("submit-new-song");
const cancelAddSong = document.getElementById("cancel-add-song");
const createSetlistToggle = document.getElementById("create-setlist-toggle");
const createSetlistForm = document.getElementById("create-setlist-form");
const submitNewSetlist = document.getElementById("submit-new-setlist");
const cancelCreateSetlist = document.getElementById("cancel-create-setlist");
const setlistSelect = document.getElementById("setlist-select");
const activeSetlist = document.getElementById("active-setlist");
const currentSetlistName = document.getElementById("current-setlist-name");
const setlistSongs = document.getElementById("setlist-songs");
const exportSetlist = document.getElementById("export-setlist");
const deleteSetlist = document.getElementById("delete-setlist");
const importSetlist = document.getElementById("import-setlist");
const importFile = document.getElementById("import-file");

let isRunning = false;
let interval;
let currentBeat = 0;
const beatCount = 4;
const lights = [
  document.getElementById("light-0"),
  document.getElementById("light-1"),
  document.getElementById("light-2"),
  document.getElementById("light-3"),
];

function flashBeat(index) {
  lights.forEach((light, i) => {
    light.classList.remove("bright", "pulse");
    if (i === index) {
      light.classList.add(i === 0 ? "bright" : "pulse");
    }
  });
  if (isSoundEnabled) {
    playClick();
  }
}

function startMetronome() {
  const bpm = parseInt(bpmInput.value);
  const intervalTime = 60000 / bpm;
  interval = setInterval(() => {
    flashBeat(currentBeat);
    currentBeat = (currentBeat + 1) % beatCount;
  }, intervalTime);
  isRunning = true;
  startStopButton.textContent = "Stop";
}

function stopMetronome() {
  clearInterval(interval);
  isRunning = false;
  currentBeat = 0;
  lights.forEach((light) => light.classList.remove("bright", "pulse"));
  startStopButton.textContent = "Start";
}

// Initialize audio when user interacts with the page
document.addEventListener(
  "click",
  () => {
    if (!audioContext) {
      initAudio();
    }
  },
  { once: true }
);

// Sound toggle functionality
soundToggleButton.addEventListener("click", () => {
  isSoundEnabled = !isSoundEnabled;
  soundToggleButton.textContent = isSoundEnabled ? "🔊 Sound" : "🔇 Sound";
  soundToggleButton.classList.toggle("active", isSoundEnabled);
});

bpmInput.addEventListener("input", () => {
  bpmDisplay.textContent = bpmInput.value;
  if (isRunning) {
    stopMetronome();
    startMetronome();
  }
});

songSelect.addEventListener("change", () => {
  const selectedBpm = songSelect.value;
  if (selectedBpm) {
    bpmInput.value = selectedBpm;
    bpmDisplay.textContent = selectedBpm;
    if (isRunning) {
      stopMetronome();
      startMetronome();
    }
  }
});

startStopButton.addEventListener("click", () => {
  isRunning ? stopMetronome() : startMetronome();
});

// Load saved songs from localStorage
function loadSavedSongs() {
  const savedSongs = localStorage.getItem("customSongs");
  if (savedSongs) {
    const songs = JSON.parse(savedSongs);
    songs.forEach((song) => addSongToSelect(song));
  }
}

// Add a new song to the select element
function addSongToSelect(song) {
  const { name, artist, bpm } = song;
  const firstLetter = name.charAt(0).toUpperCase();

  // Find or create the appropriate optgroup
  let optgroup = Array.from(songSelect.getElementsByTagName("optgroup")).find(
    (group) => group.label === firstLetter
  );

  if (!optgroup) {
    optgroup = document.createElement("optgroup");
    optgroup.label = firstLetter;
    songSelect.appendChild(optgroup);
  }

  // Create the option element
  const option = document.createElement("option");
  option.value = bpm;
  option.text = `${name} - ${artist}`;
  option.dataset.artist = artist;

  // Insert the option in alphabetical order
  const options = Array.from(optgroup.getElementsByTagName("option"));
  const insertIndex = options.findIndex((opt) => opt.text > option.text);

  if (insertIndex === -1) {
    optgroup.appendChild(option);
  } else {
    optgroup.insertBefore(option, options[insertIndex]);
  }
}

// Save a new song
function saveNewSong() {
  const nameInput = document.getElementById("new-song-name");
  const artistInput = document.getElementById("new-song-artist");
  const bpmInput = document.getElementById("new-song-bpm");

  const name = nameInput.value.trim();
  const artist = artistInput.value.trim();
  const bpm = parseInt(bpmInput.value);

  if (!name || !artist || isNaN(bpm) || bpm < 40 || bpm > 240) {
    alert(
      "Please fill in all fields correctly. BPM must be between 40 and 240."
    );
    return;
  }

  const song = { name, artist, bpm };

  // Get existing songs
  const savedSongs = localStorage.getItem("customSongs");
  const songs = savedSongs ? JSON.parse(savedSongs) : [];

  // Add new song
  songs.push(song);
  localStorage.setItem("customSongs", JSON.stringify(songs));

  // Add to select element
  addSongToSelect(song);

  // Clear form and hide it
  nameInput.value = "";
  artistInput.value = "";
  bpmInput.value = "";
  addSongForm.style.display = "none";
}

// Toggle add song form
addSongToggle.addEventListener("click", () => {
  addSongForm.style.display =
    addSongForm.style.display === "none" ? "block" : "none";
});

// Handle form submission
submitNewSong.addEventListener("click", saveNewSong);

// Handle form cancellation
cancelAddSong.addEventListener("click", () => {
  addSongForm.style.display = "none";
});

// Load saved songs when page loads
loadSavedSongs();

// Load saved BPM values from localStorage
function loadSavedBpm() {
  const savedBpm = localStorage.getItem("savedBpm");
  if (savedBpm) {
    const bpmMap = JSON.parse(savedBpm);
    // Update select options with saved BPM values
    Array.from(songSelect.options).forEach((option) => {
      if (option.value && bpmMap[option.text]) {
        option.value = bpmMap[option.text];
      }
    });
  }
}

// Save current BPM for selected song
function saveCurrentBpm() {
  const selectedSong = songSelect.options[songSelect.selectedIndex].text;
  if (selectedSong === "-- Select a song --") return;

  const savedBpm = localStorage.getItem("savedBpm");
  const bpmMap = savedBpm ? JSON.parse(savedBpm) : {};
  bpmMap[selectedSong] = bpmInput.value;
  localStorage.setItem("savedBpm", JSON.stringify(bpmMap));

  // Update the select option value
  songSelect.options[songSelect.selectedIndex].value = bpmInput.value;

  // Add visual feedback
  const saveButton = document.getElementById("save-bpm");
  const originalText = saveButton.innerHTML;
  saveButton.innerHTML = "✓ Saved!";
  saveButton.style.backgroundColor = "#45a049";

  // Reset button after 1.5 seconds
  setTimeout(() => {
    saveButton.innerHTML = originalText;
    saveButton.style.backgroundColor = "#2196F3";
  }, 1500);
}

// Load saved BPM values when page loads
loadSavedBpm();

// Save BPM button click handler
saveBpmButton.addEventListener("click", saveCurrentBpm);

// Setlist management
function loadSetlists() {
  const savedSetlists = localStorage.getItem("setlists");
  if (savedSetlists) {
    const setlists = JSON.parse(savedSetlists);
    setlistSelect.innerHTML =
      '<option value="">-- Select a Setlist --</option>';
    setlists.forEach((setlist) => {
      const option = document.createElement("option");
      option.value = setlist.id;
      option.text = setlist.name;
      setlistSelect.appendChild(option);
    });
  }
}

function createSetlist(name) {
  const savedSetlists = localStorage.getItem("setlists");
  const setlists = savedSetlists ? JSON.parse(savedSetlists) : [];

  if (setlists.length >= 5) {
    alert(
      "Maximum of 5 setlists allowed. Please delete one before creating a new one."
    );
    return;
  }

  const newSetlist = {
    id: Date.now().toString(),
    name: name,
    songs: [],
  };

  setlists.push(newSetlist);
  localStorage.setItem("setlists", JSON.stringify(setlists));

  const option = document.createElement("option");
  option.value = newSetlist.id;
  option.text = newSetlist.name;
  setlistSelect.appendChild(option);
  setlistSelect.value = newSetlist.id;
  displaySetlist(newSetlist);
}

function displaySetlist(setlist) {
  currentSetlistName.textContent = setlist.name;
  setlistSongs.innerHTML = "";

  setlist.songs.forEach((song, index) => {
    const songElement = document.createElement("div");
    songElement.className = "setlist-song";
    songElement.innerHTML = `
          <div class="setlist-song-info">${song.name} - ${song.artist} (${song.bpm} BPM)</div>
          <div class="setlist-song-actions">
            <button class="move-button" onclick="moveSong(${index}, -1)">↑</button>
            <button class="move-button" onclick="moveSong(${index}, 1)">↓</button>
            <button class="move-button" onclick="removeSong(${index})">×</button>
          </div>
        `;
    setlistSongs.appendChild(songElement);
  });

  activeSetlist.style.display = "block";
}

function addSongToSetlist(song) {
  const selectedSetlistId = setlistSelect.value;
  if (!selectedSetlistId) {
    return; // Silently return if no setlist is selected
  }

  const savedSetlists = localStorage.getItem("setlists");
  const setlists = JSON.parse(savedSetlists);
  const setlistIndex = setlists.findIndex((s) => s.id === selectedSetlistId);

  if (setlistIndex === -1) return;

  const songInfo = {
    name: song.name,
    artist: song.artist,
    bpm: song.bpm,
  };

  setlists[setlistIndex].songs.push(songInfo);
  localStorage.setItem("setlists", JSON.stringify(setlists));
  displaySetlist(setlists[setlistIndex]);
}

function moveSong(index, direction) {
  const selectedSetlistId = setlistSelect.value;
  const savedSetlists = localStorage.getItem("setlists");
  const setlists = JSON.parse(savedSetlists);
  const setlistIndex = setlists.findIndex((s) => s.id === selectedSetlistId);

  if (setlistIndex === -1) return;

  const songs = setlists[setlistIndex].songs;
  const newIndex = index + direction;

  if (newIndex >= 0 && newIndex < songs.length) {
    [songs[index], songs[newIndex]] = [songs[newIndex], songs[index]];
    localStorage.setItem("setlists", JSON.stringify(setlists));
    displaySetlist(setlists[setlistIndex]);
  }
}

function removeSong(index) {
  const selectedSetlistId = setlistSelect.value;
  const savedSetlists = localStorage.getItem("setlists");
  const setlists = JSON.parse(savedSetlists);
  const setlistIndex = setlists.findIndex((s) => s.id === selectedSetlistId);

  if (setlistIndex === -1) return;

  setlists[setlistIndex].songs.splice(index, 1);
  localStorage.setItem("setlists", JSON.stringify(setlists));
  displaySetlist(setlists[setlistIndex]);
}

function exportSetlistToFile() {
  const selectedSetlistId = setlistSelect.value;
  const savedSetlists = localStorage.getItem("setlists");
  const setlists = JSON.parse(savedSetlists);
  const setlist = setlists.find((s) => s.id === selectedSetlistId);

  if (!setlist) return;

  let content = `${setlist.name}\n\n`;
  setlist.songs.forEach((song, index) => {
    content += `${index + 1}. ${song.name} - ${song.artist} (${
      song.bpm
    } BPM)\n`;
  });

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${setlist.name}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function deleteCurrentSetlist() {
  if (!confirm("Are you sure you want to delete this setlist?")) return;

  const selectedSetlistId = setlistSelect.value;
  const savedSetlists = localStorage.getItem("setlists");
  const setlists = JSON.parse(savedSetlists);
  const newSetlists = setlists.filter((s) => s.id !== selectedSetlistId);

  localStorage.setItem("setlists", JSON.stringify(newSetlists));
  loadSetlists();
  activeSetlist.style.display = "none";
}

// Event listeners for setlist management
createSetlistToggle.addEventListener("click", () => {
  createSetlistForm.style.display =
    createSetlistForm.style.display === "none" ? "block" : "none";
});

submitNewSetlist.addEventListener("click", () => {
  const nameInput = document.getElementById("new-setlist-name");
  const name = nameInput.value.trim();

  if (!name) {
    alert("Please enter a setlist name");
    return;
  }

  createSetlist(name);
  nameInput.value = "";
  createSetlistForm.style.display = "none";
});

cancelCreateSetlist.addEventListener("click", () => {
  createSetlistForm.style.display = "none";
});

setlistSelect.addEventListener("change", () => {
  const selectedSetlistId = setlistSelect.value;
  if (!selectedSetlistId) {
    activeSetlist.style.display = "none";
    return;
  }

  const savedSetlists = localStorage.getItem("setlists");
  const setlists = JSON.parse(savedSetlists);
  const setlist = setlists.find((s) => s.id === selectedSetlistId);

  if (setlist) {
    displaySetlist(setlist);
  }
});

exportSetlist.addEventListener("click", exportSetlistToFile);
deleteSetlist.addEventListener("click", deleteCurrentSetlist);

// Modify song selection to add to setlist
songSelect.addEventListener("change", () => {
  const selectedOption = songSelect.options[songSelect.selectedIndex];
  if (selectedOption.value) {
    const song = {
      name: selectedOption.text.split(" - ")[0],
      artist: selectedOption.dataset.artist,
      bpm: selectedOption.value,
    };
    addSongToSetlist(song);
  }
});

// Load setlists when page loads
loadSetlists();

// Import functionality
function parseSongLine(line) {
  // Expected format: "Song Name - Artist Name (BPM)"
  const match = line.match(/^(.*?)\s*-\s*(.*?)\s*\((\d+)\s*BPM\)$/);
  if (match) {
    return {
      name: match[1].trim(),
      artist: match[2].trim(),
      bpm: parseInt(match[3]),
    };
  }
  return null;
}

function addSongToLibrary(song) {
  const firstLetter = song.name.charAt(0).toUpperCase();
  let optgroup = Array.from(songSelect.getElementsByTagName("optgroup")).find(
    (group) => group.label === firstLetter
  );

  if (!optgroup) {
    optgroup = document.createElement("optgroup");
    optgroup.label = firstLetter;
    songSelect.appendChild(optgroup);
  }

  // Check if song already exists
  const existingSong = Array.from(optgroup.getElementsByTagName("option")).find(
    (option) => option.text === `${song.name} - ${song.artist}`
  );

  if (!existingSong) {
    const option = document.createElement("option");
    option.value = song.bpm;
    option.text = `${song.name} - ${song.artist}`;
    option.dataset.artist = song.artist;

    // Insert in alphabetical order
    const options = Array.from(optgroup.getElementsByTagName("option"));
    const insertIndex = options.findIndex((opt) => opt.text > option.text);

    if (insertIndex === -1) {
      optgroup.appendChild(option);
    } else {
      optgroup.insertBefore(option, options[insertIndex]);
    }
  }
}

function importSongList(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result;
    const lines = content.split("\n").filter((line) => line.trim());

    // Create new setlist with file name
    const setName = file.name.replace(".txt", "");
    createSetlist(setName);

    // Process each line
    lines.forEach((line) => {
      const song = parseSongLine(line);
      if (song) {
        // Add to song library if it doesn't exist
        addSongToLibrary(song);
        // Add to current setlist
        addSongToSetlist(song);
      }
    });
  };
  reader.readAsText(file);
}

// Import button click handler
importSetlist.addEventListener("click", () => {
  importFile.click();
});

// File selection handler
importFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    importSongList(file);
  }
  // Reset file input
  e.target.value = "";
});
