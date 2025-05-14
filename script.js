const songs = [
  {
    title: "People",
    artist: "Libianca",
    src: "./sound/Libianca - People (Lyrics).mp3",
    cover: "./img/artworks-Ffj8O8nSg6EyNc2w-pIcx0Q-t500x500.jpg",
    lyricsPath: "./lyrics/People.json",
  },
  {
    title: "Where We Are",
    artist: "One Direction",
    src: "./sound/One Direction - Where We Are (Official Audio).mp3",
    cover: "./img/Where_We_Are_29_-_One_Direction.webp",
  },
  {
    title: "See You Again",
    artist: "Wiz Khalifa",
    src: "./sound/Wiz Khalifa - See You Again ft. Charlie Puth [Official Video] Furious 7 Soundtrack.mp3",
    cover: "./img/artworks-000162897425-k8h6e5-t1080x1080.jpg",
  },
  {
    title: "Lebih Baik",
    artist: "CJR",
    src: "./sound/CJR - Lebih Baik (Official Music Video) Ost. CJR The Movie.mp3",
    cover: "./img/ab67616d0000b2730bb20cab37087324970c6013.jfif",
  },
  {
    title: "For The Rest of My Life",
    artist: "Maher Zain",
    src: "./sound/Maher Zain - For The Rest Of My Life.mp3",
    cover: "./img/logo.png",
    lyricsPath: "./lyrics/For The Rest of My Life.json",
  },
];

// =======================
// ELEMENT SELEKTOR
// =======================
const audio = document.getElementById("audioPlayer");
const coverImg = document.querySelector(".cover");
const titleEl = document.querySelector(".title");
const artistEl = document.querySelector(".artist");
const playPauseBtn = document.querySelector(".playPause");
const lyricsContainer = document.querySelector(".lyrics");
const currentTimeEl = document.querySelector(".current-time");
const durationEl = document.querySelector(".duration");
const progressBar = document.querySelector(".progress-bar");

let currentIndex = 0;

// =======================
// UTILITY FUNCTION
// =======================

// Mengubah format detik ke format menit:detik (misalnya 75 → "1:15")
function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

// =======================
// LOAD & CONTROL SONG
// =======================

// Memuat lagu berdasarkan indeks
function loadSong(index) {
  const song = songs[index];
  audio.src = song.src;
  coverImg.src = song.cover;
  titleEl.textContent = song.title;
  artistEl.textContent = song.artist;

  // Ambil lirik dari file JSON
  fetch(song.lyricsPath)
    .then((response) => response.json())
    .then((lyrics) => {
      loadLyrics(lyrics);
    })
    .catch((error) => {
      console.error("Gagal memuat lirik:", error);
      lyricsContainer.innerHTML = "<p>Lirik tidak tersedia</p>";
    });
}

// Memutar lagu dan ubah tombol menjadi pause
function playSong() {
  audio.play();
  playPauseBtn.innerHTML = "❚❚";
}

// Menjeda lagu dan ubah tombol menjadi play
function pauseSong() {
  audio.pause();
  playPauseBtn.innerHTML = "▶";
}

// =======================
// LIRIK HANDLING
// =======================

// Memuat lirik lagu ke dalam container
function loadLyrics(lyrics) {
  lyricsContainer.innerHTML = "";
  lyrics.forEach((line) => {
    const p = document.createElement("p");
    p.textContent = line.text;
    p.dataset.time = line.time;
    lyricsContainer.appendChild(p);
  });
}

// Menyorot lirik yang sesuai dengan waktu saat ini
function highlightLyrics(currentTime) {
  const lines = Array.from(lyricsContainer.querySelectorAll("p"));

  // Sembunyikan semua baris lirik
  lines.forEach((line) => {
    line.style.display = "none";
  });

  // Temukan indeks baris aktif (lirik yang cocok dengan waktu saat ini)
  let activeIndex = lines.findIndex((line, index) => {
    const time = parseFloat(line.dataset.time);
    const nextTime =
      index < lines.length - 1
        ? parseFloat(lines[index + 1].dataset.time)
        : Number.MAX_VALUE;

    return currentTime >= time && currentTime < nextTime;
  });

  // Tampilkan beberapa baris sekitar lirik aktif
  if (activeIndex !== -1) {
    const showRange = 1; // 1 baris sebelum dan sesudah

    for (let i = activeIndex - showRange; i <= activeIndex + showRange; i++) {
      if (i >= 0 && i < lines.length) {
        lines[i].style.display = "block";
        lines[i].classList.toggle("active", i === activeIndex);
      }
    }
  }
}

// =======================
// EVENT HANDLER
// =======================

// Tombol play/pause
playPauseBtn.addEventListener("click", () => {
  if (audio.paused) {
    playSong();
  } else {
    pauseSong();
  }
});

// Tombol lagu sebelumnya
document.querySelector(".prev").addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  loadSong(currentIndex);
  playSong();
});

// Tombol lagu berikutnya
document.querySelector(".next").addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % songs.length;
  loadSong(currentIndex);
  playSong();
});

// Saat metadata lagu dimuat (agar bisa set durasi total)
audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
  progressBar.max = Math.floor(audio.duration);
});

// Saat lagu berjalan, update progress bar dan highlight lirik
audio.addEventListener("timeupdate", () => {
  progressBar.value = Math.floor(audio.currentTime);
  currentTimeEl.textContent = formatTime(audio.currentTime);
  highlightLyrics(audio.currentTime);
});

// Seek saat progress bar digeser
progressBar.addEventListener("input", () => {
  audio.currentTime = progressBar.value;
});

// =======================
// INISIALISASI
// =======================
loadSong(currentIndex);
