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

function toggleSound() {
  isSoundEnabled = !isSoundEnabled;
  return isSoundEnabled;
}

// Metronome functionality
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
  playClick();
}

function startMetronome(bpm) {
  const intervalTime = 60000 / bpm;
  interval = setInterval(() => {
    flashBeat(currentBeat);
    currentBeat = (currentBeat + 1) % beatCount;
  }, intervalTime);
  isRunning = true;
  return true;
}

function stopMetronome() {
  clearInterval(interval);
  isRunning = false;
  currentBeat = 0;
  lights.forEach((light) => light.classList.remove("bright", "pulse"));
  return false;
}

function isMetronomeRunning() {
  return isRunning;
}

// DOM Elements
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

const songListContainer = document.getElementById("song-list-container");
let customSongList = [];
let selectedSongs = new Set();
let selectAllChecked = false;
let selectedSongId = null;

// Update references for dropdown
const songDropdownTrigger = document.getElementById("song-dropdown-trigger");
const songListDropdown = document.getElementById("song-list-dropdown");

let dropdownOpen = false;

function openSongDropdown() {
  songListDropdown.style.display = 'block';
  dropdownOpen = true;
}
function closeSongDropdown() {
  songListDropdown.style.display = 'none';
  dropdownOpen = false;
}

songDropdownTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  if (dropdownOpen) {
    closeSongDropdown();
  } else {
    openSongDropdown();
    renderSongList();
  }
});

document.addEventListener('click', (e) => {
  if (dropdownOpen && !songListDropdown.contains(e.target) && e.target !== songDropdownTrigger) {
    closeSongDropdown();
  }
});

const dropdownTriggerText = document.querySelector('.dropdown-trigger-text');

function updateDropdownTriggerText() {
  if (selectedSongId) {
    const song = customSongList.find(s => s.id === selectedSongId);
    if (song) {
      dropdownTriggerText.textContent = song.artist && song.artist.trim() ? `${song.name} - ${song.artist}` : song.name;
      return;
    }
  }
  dropdownTriggerText.textContent = 'Choose a Song';
}

function handleSongRowClick(song) {
  selectedSongId = song.id;
  bpmInput.value = song.bpm;
  bpmDisplay.textContent = song.bpm;
  renderSongList(); // highlight selected
  updateDropdownTriggerText();

  // Add to setlist if one is selected
  const selectedSetlistId = setlistSelect.value;
  if (selectedSetlistId) {
    const songToAdd = {
      name: song.name,
      artist: song.artist,
      bpm: song.bpm
    };
    const updatedSetlist = addSongToSetlist(songToAdd, selectedSetlistId);
    if (updatedSetlist) {
      displaySetlist(updatedSetlist);
    }
  }
}

function renderSongList() {
  songListDropdown.innerHTML = '';

  // Select All row
  const selectAllRow = document.createElement('div');
  selectAllRow.className = 'song-list-row select-all-row';
  selectAllRow.innerHTML = `
    <input type=\"checkbox\" id=\"select-all-songs\" ${selectAllChecked ? 'checked' : ''}>
    <span class=\"song-divider\"></span>
    <span class=\"select-all-label\" style=\"flex:1; text-align:center; font-weight:bold;\">Select All Songs</span>
    <span class=\"song-divider\"></span>
    <button id=\"delete-selected-songs\" class=\"delete-song-btn\">🗑️</button>
  `;
  songListDropdown.appendChild(selectAllRow);

  selectAllRow.querySelector('#select-all-songs').addEventListener('change', (e) => {
    selectAllChecked = e.target.checked;
    if (selectAllChecked) {
      customSongList.forEach(song => selectedSongs.add(song.id));
    } else {
      selectedSongs.clear();
    }
    renderSongList();
  });

  selectAllRow.querySelector('#delete-selected-songs').addEventListener('click', () => {
    if (selectedSongs.size === 0) return;
    if (!confirm('Delete all selected songs?')) return;
    customSongList = customSongList.filter(song => !selectedSongs.has(song.id));
    selectedSongs.clear();
    selectAllChecked = false;
    saveCustomSongList();
    renderSongList();
    updateDropdownTriggerText();
  });

  // Group and sort songs by label
  const groups = {};
  customSongList.forEach(song => {
    const label = song.label ? song.label.toUpperCase() : '#';
    if (!groups[label]) groups[label] = [];
    groups[label].push(song);
  });
  const sortedLabels = Object.keys(groups).sort();

  sortedLabels.forEach(label => {
    // Label header
    const labelRow = document.createElement('div');
    labelRow.className = 'song-list-label-row';
    labelRow.innerHTML = `
      <span class=\"label-placeholder\"></span>
      <span class=\"label-text\">${label}</span>
    `;
    songListDropdown.appendChild(labelRow);

    // Sort songs in this group
    groups[label].sort((a, b) => a.name.localeCompare(b.name));
    groups[label].forEach(song => {
      const row = document.createElement('div');
      row.className = 'song-list-row';
      if (song.id === selectedSongId) {
        row.style.background = '#1976D2';
        row.style.color = 'white';
      }
      row.innerHTML = `
        <input type=\"checkbox\" class=\"song-checkbox\" data-id=\"${song.id}\" ${selectedSongs.has(song.id) ? 'checked' : ''}>
        <span class=\"song-divider\"></span>
        <span class=\"song-name\" style=\"flex:1; cursor:pointer;\">${song.artist && song.artist.trim() ? `${song.name} - ${song.artist}` : song.name}</span>
        <span class=\"song-divider\"></span>
        <button class=\"delete-song-btn\" data-id=\"${song.id}\">🗑️</button>
      `;
      // Checkbox event
      row.querySelector('.song-checkbox').addEventListener('change', (e) => {
        if (e.target.checked) {
          selectedSongs.add(song.id);
        } else {
          selectedSongs.delete(song.id);
          selectAllChecked = false;
        }
        renderSongList();
      });
      // Delete button event
      row.querySelector('.delete-song-btn').addEventListener('click', () => {
        if (!confirm(`Delete song: ${song.name}?`)) return;
        customSongList = customSongList.filter(s => s.id !== song.id);
        selectedSongs.delete(song.id);
        if (selectedSongId === song.id) selectedSongId = null;
        saveCustomSongList();
        renderSongList();
        updateDropdownTriggerText();
      });
      // Song row click (select song)
      row.querySelector('.song-name').addEventListener('click', () => {
        handleSongRowClick(song);
        closeSongDropdown();
      });
      songListDropdown.appendChild(row);
    });
  });
}

function saveCustomSongList() {
  // Save only custom songs to localStorage
  localStorage.setItem('customSongs', JSON.stringify(customSongList.filter(s => s.isCustom)));
}

function loadCustomSongList() {
  // Load from window.songList and customSongs
  customSongList = [];
  if (window.songList) {
    // Get saved core song BPMs from localStorage
    const savedCoreBpms = localStorage.getItem('coreSongBpms');
    const coreBpms = savedCoreBpms ? JSON.parse(savedCoreBpms) : {};
    
    window.songList.forEach(song => {
      // Use saved BPM if it exists, otherwise use original BPM
      const savedBpm = coreBpms[song.name];
      customSongList.push({ 
        ...song, 
        bpm: savedBpm !== undefined ? savedBpm : song.bpm,
        id: `core-${song.name}-${song.artist}` 
      });
    });
  }
  const savedSongs = localStorage.getItem('customSongs');
  if (savedSongs) {
    JSON.parse(savedSongs).forEach(song => {
      // Ensure label exists
      if (!song.label) song.label = song.name.charAt(0).toUpperCase();
      customSongList.push({ ...song, id: `custom-${song.name}-${song.artist}`, isCustom: true });
    });
  }
}

// Replace loadSavedSongs(songSelect) with:
function initializeSongListUI() {
  loadCustomSongList();
  renderSongList();
}

// Setlist Management
function createSetlist(name) {
  const savedSetlists = localStorage.getItem("setlists");
  const setlists = savedSetlists ? JSON.parse(savedSetlists) : [];

  if (setlists.length >= 5) {
    return null;
  }

  const newSetlist = {
    id: Date.now().toString(),
    name: name,
    songs: [],
  };

  setlists.push(newSetlist);
  localStorage.setItem("setlists", JSON.stringify(setlists));
  return newSetlist;
}

function loadSetlists(setlistSelect) {
  const savedSetlists = localStorage.getItem("setlists");
  if (savedSetlists) {
    const setlists = JSON.parse(savedSetlists);
    setlistSelect.innerHTML = '<option value="">-- Select a Setlist --</option>';
    setlists.forEach((setlist) => {
      const option = document.createElement("option");
      option.value = setlist.id;
      option.text = setlist.name;
      setlistSelect.appendChild(option);
    });
  }
}

function addSongToSetlist(song, setlistId) {
  const savedSetlists = localStorage.getItem("setlists");
  const setlists = JSON.parse(savedSetlists);
  const setlistIndex = setlists.findIndex((s) => s.id === setlistId);

  if (setlistIndex === -1) return null;

  setlists[setlistIndex].songs.push(song);
  localStorage.setItem("setlists", JSON.stringify(setlists));
  return setlists[setlistIndex];
}

function moveSongInSetlist(setlistId, index, direction) {
  const savedSetlists = localStorage.getItem("setlists");
  const setlists = JSON.parse(savedSetlists);
  const setlistIndex = setlists.findIndex((s) => s.id === setlistId);

  if (setlistIndex === -1) return null;

  const songs = setlists[setlistIndex].songs;
  const newIndex = index + direction;

  if (newIndex >= 0 && newIndex < songs.length) {
    [songs[index], songs[newIndex]] = [songs[newIndex], songs[index]];
    localStorage.setItem("setlists", JSON.stringify(setlists));
    return setlists[setlistIndex];
  }
  return null;
}

function removeSongFromSetlist(setlistId, index) {
  const savedSetlists = localStorage.getItem("setlists");
  const setlists = JSON.parse(savedSetlists);
  const setlistIndex = setlists.findIndex((s) => s.id === setlistId);

  if (setlistIndex === -1) return null;

  setlists[setlistIndex].songs.splice(index, 1);
  localStorage.setItem("setlists", JSON.stringify(setlists));
  return setlists[setlistIndex];
}

function removeSetlist(setlistId) {
  const savedSetlists = localStorage.getItem("setlists");
  const setlists = JSON.parse(savedSetlists);
  const newSetlists = setlists.filter((s) => s.id !== setlistId);
  localStorage.setItem("setlists", JSON.stringify(newSetlists));
}

function parseSongLine(line) {
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

function exportSetlistToFile(setlist) {
  let content = `${setlist.name}\n\n`;
  setlist.songs.forEach((song, index) => {
    content += `${index + 1}. ${song.name} - ${song.artist} (${song.bpm} BPM)\n`;
  });
  return new Blob([content], { type: "text/plain" });
}

// Helper function to display setlist
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

// Make functions available globally for onclick handlers
window.moveSong = function(index, direction) {
  const selectedSetlistId = setlistSelect.value;
  const updatedSetlist = moveSongInSetlist(selectedSetlistId, index, direction);
  if (updatedSetlist) {
    displaySetlist(updatedSetlist);
  }
};

window.removeSong = function(index) {
  const selectedSetlistId = setlistSelect.value;
  const updatedSetlist = removeSongFromSetlist(selectedSetlistId, index);
  if (updatedSetlist) {
    displaySetlist(updatedSetlist);
  }
};

// Initialize UI
function initializeUI() {
  // Sound toggle
  soundToggleButton.addEventListener("click", () => {
    const isEnabled = toggleSound();
    soundToggleButton.textContent = isEnabled ? "🔊 Sound" : "🔇 Sound";
    soundToggleButton.classList.toggle("active", isEnabled);
  });

  // BPM input
  bpmInput.addEventListener("input", () => {
    bpmDisplay.textContent = bpmInput.value;
    if (isMetronomeRunning()) {
      stopMetronome();
      startMetronome(parseInt(bpmInput.value));
    }
  });

  // Save BPM button
  saveBpmButton.addEventListener("click", () => {
    if (!selectedSongId) {
      alert("Please select a song first");
      return;
    }
    const newBpm = parseInt(bpmInput.value);
    if (isNaN(newBpm) || newBpm < 40 || newBpm > 240) {
      alert("BPM must be between 40 and 240");
      return;
    }
    // Update in customSongList
    const song = customSongList.find(s => s.id === selectedSongId);
    if (song) {
      song.bpm = newBpm;
      saveCustomSongList();
      renderSongList();

      // Save core song BPM changes to localStorage
      if (selectedSongId.startsWith('core-')) {
        const savedCoreBpms = localStorage.getItem('coreSongBpms');
        const coreBpms = savedCoreBpms ? JSON.parse(savedCoreBpms) : {};
        coreBpms[song.name] = newBpm;
        localStorage.setItem('coreSongBpms', JSON.stringify(coreBpms));
      }
    }
    // Update in setlists
    const savedSetlists = localStorage.getItem("setlists");
    if (savedSetlists) {
      const setlists = JSON.parse(savedSetlists);
      let updated = false;
      setlists.forEach(setlist => {
        setlist.songs.forEach(s => {
          if (s.name === song.name) {
            s.bpm = newBpm;
            updated = true;
          }
        });
      });
      if (updated) {
        localStorage.setItem("setlists", JSON.stringify(setlists));
        const selectedSetlistId = setlistSelect.value;
        if (selectedSetlistId) {
          const currentSetlist = setlists.find(s => s.id === selectedSetlistId);
          if (currentSetlist) {
            displaySetlist(currentSetlist);
          }
        }
      }
    }
    alert("BPM saved successfully!");
  });

  // Start/Stop button
  startStopButton.addEventListener("click", () => {
    if (isMetronomeRunning()) {
      stopMetronome();
      startStopButton.textContent = "Start";
    } else {
      startMetronome(parseInt(bpmInput.value));
      startStopButton.textContent = "Stop";
    }
  });

  // Add song form
  addSongToggle.addEventListener("click", () => {
    addSongForm.style.display = addSongForm.style.display === "none" ? "block" : "none";
  });

  submitNewSong.addEventListener("click", () => {
    const nameInput = document.getElementById("new-song-name");
    const artistInput = document.getElementById("new-song-artist");
    const bpmInput = document.getElementById("new-song-bpm");

    const name = nameInput.value.trim();
    const artist = artistInput.value.trim();
    const bpm = parseInt(bpmInput.value);

    if (!name || !artist || isNaN(bpm) || bpm < 40 || bpm > 240) {
      alert("Please fill in all fields correctly. BPM must be between 40 and 240.");
      return;
    }

    if (confirm(`Add new song:\nName: ${name}\nArtist: ${artist}\nBPM: ${bpm}`)) {
      const song = saveNewSong(name, artist, bpm);
      if (song) {
        customSongList.push({ ...song, id: `custom-${song.name}-${song.artist}`, isCustom: true });
        saveCustomSongList();
        renderSongList();
        nameInput.value = "";
        artistInput.value = "";
        bpmInput.value = "";
        addSongForm.style.display = "none";
      }
    }
  });

  cancelAddSong.addEventListener("click", () => {
    addSongForm.style.display = "none";
  });

  // Setlist management
  createSetlistToggle.addEventListener("click", () => {
    createSetlistForm.style.display = createSetlistForm.style.display === "none" ? "block" : "none";
  });

  submitNewSetlist.addEventListener("click", () => {
    const nameInput = document.getElementById("new-setlist-name");
    const name = nameInput.value.trim();

    if (!name) {
      alert("Please enter a setlist name");
      return;
    }

    const newSetlist = createSetlist(name);
    if (newSetlist) {
      nameInput.value = "";
      createSetlistForm.style.display = "none";
      loadSetlists(setlistSelect);
      setlistSelect.value = newSetlist.id;
      displaySetlist(newSetlist);
    } else {
      alert("Maximum of 5 setlists allowed. Please delete one before creating a new one.");
    }
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

    const savedSetlists = JSON.parse(localStorage.getItem("setlists"));
    const setlist = savedSetlists.find((s) => s.id === selectedSetlistId);
    if (setlist) {
      displaySetlist(setlist);
    }
  });

  exportSetlist.addEventListener("click", () => {
    const selectedSetlistId = setlistSelect.value;
    const savedSetlists = JSON.parse(localStorage.getItem("setlists"));
    const setlist = savedSetlists.find((s) => s.id === selectedSetlistId);

    if (setlist) {
      const blob = exportSetlistToFile(setlist);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${setlist.name}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  });

  deleteSetlist.addEventListener("click", () => {
    if (!confirm("Are you sure you want to delete this setlist?")) return;

    const selectedSetlistId = setlistSelect.value;
    removeSetlist(selectedSetlistId);
    loadSetlists(setlistSelect);
    activeSetlist.style.display = "none";
  });

  // Import functionality
  importSetlist.addEventListener("click", () => {
    importFile.click();
  });

  importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target.result;
        const lines = content.split("\n").filter((line) => line.trim());

        const setName = file.name.replace(".txt", "");
        const newSetlist = createSetlist(setName);

        if (newSetlist) {
          lines.forEach((line) => {
            const song = parseSongLine(line);
            if (song) {
              addSongToSetlist(song, newSetlist.id);
            }
          });
          loadSetlists(setlistSelect);
          setlistSelect.value = newSetlist.id;
          displaySetlist(newSetlist);
        }
      };
      reader.readAsText(file);
    }
    e.target.value = "";
  });

  // Initialize
  initializeSongListUI();
  updateDropdownTriggerText();
  loadSetlists(setlistSelect);
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

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeUI);

function saveNewSong(name, artist, bpm) {
  if (!name || !artist || isNaN(bpm) || bpm < 40 || bpm > 240) {
    return null;
  }
  // Set label to first letter of name (uppercased)
  const label = name.charAt(0).toUpperCase();
  const song = { name, artist, bpm, label };
  const savedSongs = localStorage.getItem("customSongs");
  const songs = savedSongs ? JSON.parse(savedSongs) : [];
  songs.push(song);
  localStorage.setItem("customSongs", JSON.stringify(songs));
  return song;
}
