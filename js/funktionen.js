// indexed DB Import
import { get, set } from "./indexedDB.js";

// ################################### VARIABLEN ###################################

// Sound Vizualizer Variable
let animate = null;
// Variablen für Balken Farbe
let r, g, b;
// Variablen für invertierte Farben
let rr, gg, bb;

// Variablen für Songreihenfolge
let songindex = 0;
let songAnzahl;

// Variablen für Steuerung
let loopflag = 1;
let pauseflag = 0;
let muteflag = 0;
let volumeTemp;

// Variablen für Funktionen
let sound;
let party = 0;
// ################################### VARIABLEN ENDE ###################################

// Standard CSS/HTML Funktionen
function group(css) {
  return document.querySelectorAll(css);
}

function el(css) {
  return document.querySelector(css);
}

function create(html) {
  return document.createElement(html);
}

function hotButtons(HTMLElement) {
  group("#gui-buttons button").forEach((val) => {
    val.className = "passiv";
  });
  if (HTMLElement) {
    HTMLElement.className = "aktiv";
  }
}

// Delay Funktion mit Promise, Es wird somit immer auf das Timeout Ergebnis gewartet
const delay = (millisekunden) =>
  new Promise((ergebnis) => setTimeout(ergebnis, millisekunden));

// Gibt die Anzahl der gespeicherten Songs in der Liste zurück
// fängt bei 0 an
// muss mit Await aufgerufen werden
async function songAnzahlLesen() {
  songAnzahl = await get("songAnzahl").then((wert) => wert);
  return songAnzahl;
}

// Blocken des Standard (play) Verhalten des Browsers
function browserBlocken(evt) {
  evt.stopPropagation();
  evt.preventDefault();
}

// DragOver Funktion (nur das Rüberziehen)
function handleDragOver(evt) {
  browserBlocken(evt);
  // Tooltip Text auf "kopieren" ändern
  evt.dataTransfer.dropEffect = "copy";
}

// Render Funktion (hauptsächlich Visualisierung)
function render(audioData) {
  // Animate zurücksetzen
  // Ansonsten erscheint kein Vizualizer mehr, wenn man während eines Lieds ein neues Lied spielt
  animate = 0;

  // Canvas deklaration
  // const ctx = document.querySelector("canvas").getContext("2d");
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  resizeCanvasToDisplaySize(ctx.canvas);

  // Originalteil der Visualizer funktion
  let context = new AudioContext(); // (Interface) Audio-processing graph
  let src = context.createMediaElementSource(audioData); // Give the audio context an audio source,
  // to which can then be played and manipulated
  const analyser = context.createAnalyser(); // Create an analyser for the audio context
  src.connect(analyser); // Connects the audio context source to the analyser
  analyser.connect(context.destination); // End destination of an audio graph in a given context

  const bufferLength = analyser.frequencyBinCount; // (read-only property)
  // Unsigned integer, half of fftSize
  // Equates to number of data values you have to play with for the visualization
  const dataArray = new Uint8Array(bufferLength); // Converts to 8-bit unsigned integer array
  // At this point dataArray is an array with length of bufferLength but no values

  // Startwerte der Balken
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  let barWidth = (WIDTH / bufferLength) * 13;
  let barHeight;
  let x;
  let bars;

  // Variablen für Dauer Anzeige
  let songVerbleibendDuration, songGesamtDuration, dauerVerbleibend;

  // Start der Render Funktion (AnimationFrame)
  function renderFrame() {
    animate = requestAnimationFrame(renderFrame);

    // kann man Einkommentieren um einen Schallplattensprung zu simulieren
    //schallPlattenSprung(audioData);

    // Hier können die Anzahl der Balken dynamisch während der Laufzeit geändert werden
    // FFTSize muss Potenz von 2 sein, daher sind die Werte fest vorgegeben
    // ist bei Abstand Wert 1 passend
    if (Number(visualslider.value) === 0) {
      analyser.fftSize = 256;
      bars = 10;
    } else if (Number(visualslider.value) === 1) {
      analyser.fftSize = 512;
      bars = 20;
    } else if (Number(visualslider.value) === 2) {
      analyser.fftSize = 1024;
      bars = 40;
    } else if (Number(visualslider.value) === 3) {
      analyser.fftSize = 2048;
      bars = 80;
    } else if (Number(visualslider.value) === 4) {
      analyser.fftSize = 4096;
      bars = 160;
    } else if (Number(visualslider.value) === 5) {
      analyser.fftSize = 8192;
      bars = 320;
    } // Ende if

    barWidth = (WIDTH / analyser.frequencyBinCount) * 13;

    // verbleibende Dauer Berechnung
    songVerbleibendDuration = audioData.duration - audioData.currentTime;
    songGesamtDuration =
      Math.floor(audioData.duration / 60) +
      "min " +
      Math.floor(audioData.duration % 60) +
      "s";
    dauerVerbleibend =
      Math.floor(songVerbleibendDuration / 60) +
      "min " +
      Math.floor(songVerbleibendDuration % 60) +
      "s";

    // Gesamtdauer und verbleibende Dauer in einem Feld anzeigen
    el(
      "#laenge-anzeige"
    ).value = `${songGesamtDuration}  /  ${dauerVerbleibend}`;

    // Fortschrittsbalken dem Wert zuweisen
    el("#fortschrittsbalken-inner").value = songVerbleibendDuration;

    // Lautstärke während der Laufzeit änderbar
    audioData.volume = Number(volumeslider.value) / 100;

    // Wenn das aktuelle AudioFile abgelaufen ist
    // renderFrame durch return und cancelAnimationFrame(animate) stoppen
    // Canvas wird zurückgesetzt
    if (audioData.currentTime >= audioData.duration) {
      // Canvas Leeren
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Animationframe canceln
      cancelAnimationFrame(animate);
      hotButtons(false);
      animate = false;

      // Funktion aufrufen, neuer Titel wird hier gestartet
      loadSongsFunktionen();

      // Funktion beenden
      return;
    } // Ende if

    // Canvas X Wert
    x = 0;

    // weiterer Originalteil der Visualizer Funktion
    analyser.getByteFrequencyData(dataArray); // Copies the frequency data into dataArray
    // Results in a normalized array of values between 0 and 255
    // Before this step, dataArray's values are all zeros (but with length of 8192)

    // Canvas Leeren bevor neue Balken angezeigt werden.
    // Leztzter Wert ist der Fade Wert, dieser kommt dynamisch aus dem slider
    ctx.fillStyle = `rgba(0,0,0,${Number(fadeslider.value) / 10})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Hier werden die einzelnen Farben gesetzt
    for (let i = 0; i < bars; i++) {
      // Balken Höhe. Wert passt gut zu Canvas Höhe mit 300px
      barHeight = dataArray[i] * 1.1;

      if (dataArray[i] > 220) {
        // Pink
        r = 250;
        g = 0;
        b = 220;
      } else if (dataArray[i] > 210) {
        // Rot
        r = 250;
        g = 0;
        b = 0;
      } else if (dataArray[i] > 195) {
        // Orange
        r = 250;
        g = 100;
        b = 0;
      } else if (dataArray[i] > 180) {
        // yellow
        r = 250;
        g = 255;
        b = 0;
      } else if (dataArray[i] > 165) {
        // Grün Gelb
        r = 204;
        g = 255;
        b = 0;
      } else if (dataArray[i] > 150) {
        // Grün
        r = 80;
        g = 255;
        b = 80;
      } else if (dataArray[i] > 135) {
        // Grün Blau
        r = 0;
        g = 219;
        b = 131;
      } else if (dataArray[i] > 120) {
        // Blau
        r = 80;
        g = 80;
        b = 250;
      } else {
        // Hell blau für alles andere
        r = 40;
        g = 100;
        b = 255;
      }
      // Farben invertieren
      rr = 255 - r;
      gg = 255 - g;
      bb = 255 - b;

      // Farben den Elementen zuweisen
      el("#canvas").style.border = `solid 10px rgb(${r}, ${g}, ${b})`;
      el("#drag-drop").style.background = `rgb(${r}, ${g}, ${b})`;
      el("#drag-drop").style.color = `rgb(${rr}, ${gg}, ${bb})`;
      el("#drag-drop").style.border = `solid 10px rgb(${rr}, ${gg}, ${bb})`;

      // Balken mit den Farben zuweisen
      ctx.fillStyle = `rgb(${r},${g},${b})`;

      // (Startpunkt X, Starpunkt y, Endpunkt X, Endpunkt Y)
      if (party === 1) {
        ctx.fillRect(x, 0, barWidth, barHeight);
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
      } else {
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
      }

      // -1 da bei 0 ein Pixel zwischen den Balken ist
      x += barWidth + Number(abstandslider.value - 1);
    } // Ende for Schleife
  } // Animation Ende

  if (!animate) {
    renderFrame();
  }
} // Render Funktion Ende

// Funktion zum Resizen des Canvas
function resizeCanvasToDisplaySize(canvas) {
  // look up the size the canvas is being displayed
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  // If it's resolution does not match change it
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}

// Funktion zum Lesen des Songs
// gibt File Blob zurück
function songLesen(file) {
  // Mit Pfeilfunktion
  return new Promise((resolve, reject) => {
    // neuen Filereader
    let reader = new FileReader();
    // Wenn er fertig ist wird funktion ausgeführt
    reader.onload = () => {
      // reader.result ist das Resultat, also das was reingedroppt wird
      resolve(reader.result);
    }; // Ende Onload

    // Fehlermeldung wenn es nicht geht
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
} // SongLesen Ende

// Funktion zum Laden der Songs, Liest Songs aus Speicher, übergibt sie dem Player
async function loadSongsFunktionen() {
  // Anzahl der Songs getten
  songAnzahl = await songAnzahlLesen();

  // If Abfrage songindex mit songAnzahl vergleichen
  // setzt index wieder auf 0, wenn der letzte Song erreicht wurde (Liste beginnt von vorn)
  if (songAnzahl + 1 === songindex) {
    songindex = 0;
  }

  // Variablen Deklaration für die Songs
  // audioQuelle ist dateipfad oder file (blob)
  let titel, kuenstlerName, erscheinungsDatum, audioQuelle;

  // IF Abfrage Ob es ein Drag&Drop Sing ist oder ein Click-Json Sing ist
  let songArray = await get(`Song${songindex}`).then((wert) => wert);

  // IF JSON Song
  if (songArray.constructor == Array) {
    // Werte speichern
    titel = songArray[0];
    kuenstlerName = songArray[1];
    erscheinungsDatum = songArray[2];
    // Audio Pfad
    audioQuelle = songArray[3];
  }
  // ELSE Drag&Drop Song
  else {
    // file blob lesen
    let songGeladen = await get(`Song${songindex}`).then((wert) => wert);

    // audioQuelle = Song
    audioQuelle = await songLesen(songGeladen);

    // Anzeige Variablen füllen
    titel = songGeladen.name.split(".")[0];
    // sind beim Drag&Drop Song nicht bekannt
    kuenstlerName = "";
    erscheinungsDatum = "";
  } // Ende IF

  // Funktion zum Abspielen des Lieds aufrufen
  playAudioFunktionen(titel, kuenstlerName, erscheinungsDatum, audioQuelle);

  // Index hochzählen
  songindex++;
} // Ende loadSong Funktion

// Audio Funktion
function playAudioFunktionen(
  titel,
  kuenstlerName,
  erscheinungsDatum,
  audioQuelle
) {
  // Anzeigen ändern
  el("#titel-anzeige").value = titel;
  el("#interpret-anzeige").value = kuenstlerName;
  el("#veroeff-anzeige").value = erscheinungsDatum;

  // inaktiver Teil:
  // el('#lade-pl').className = 'hide';
  // el('#pl-fertig').className = 'hide';

  // alten Sound stoppen
  if (sound) {
    sound.pause();
  }

  // falls Pause gedrückt wurde und danach nächste Titel kommt
  if (pauseflag === 1) {
    pauseflag = 0;
    el(
      "#playpause"
    ).innerHTML = `<img src="img/icons/pause.jpg" alt="Abspielen und Anhalten" title="Abspielen und Anhalten">`;
  }

  // Standard Audio Funktionen
  sound = new Audio();
  sound.src = audioQuelle;
  sound.playbackRate = Number(geschwindigkeitslider.value) / 10;
  sound.play();

  // Visualizer aufrufen und CSS Elemente ändern
  el("#visualizer-wrapper").style.display = "block";
  el("#canvas").style.display = "block";
  el("#canvas").width = window.innerWidth - 100;
  el("#canvas").height = 300;
  el("#canvas-vis-regler").style.display = "block";

  // muss Onload sein, da es erst vollständig geladen werden muss
  sound.onloadeddata = function () {
    // Maximaldauer dem Fortschrittsbalken zuweisen
    // Der Momentane Wert wird im Animationframe (render funktion) berechnet und angezeigt
    el("#fortschrittsbalken-inner").max = sound.duration;
  }; // Ende onload

  // Aufruf render Funktion
  render(sound);
} // Ende Audio Funktion

// ################################### EVENT LISTENER ###################################

el("#fortschrittsbalken-inner").addEventListener("input", function () {
  sound.currentTime = sound.duration - Number(this.value);
});

// Alle Steuerungsfunktionen beinhalten jeweils den Eventlistener
// Dazu wird jeweils die anonyme Funktion direkt aufgerufen

// Alle Werte werden beim Mouseleave Event in die DB gespeichert, da performancemäßig besser

// volumeslider
el("#volumeslider").addEventListener("input", function () {
  el(
    "#volume"
  ).innerHTML = `<img src="img/icons/volume.jpg" alt="Lautstärke" title="Lautstärke" height="15"> ${Number(
    this.value
  )}%`;
  // Muteflag muss hier zurückgesetzt werden, falls nach dem Mute der Slider angefasst wird
  muteflag = 0;
});
el("#volumeslider").addEventListener("mouseleave", function () {
  set("volume", Number(this.value));
});

//vor slider
el("#vorslider").addEventListener("input", function () {
  el("#vor").innerHTML = `${Number(
    this.value
  )}s <img src="img/icons/right-arrow.png" alt="vorspulen" title="vorspulen" height="15">`;
});
el("#vorslider").addEventListener("mouseleave", function () {
  set("vor", Number(this.value));
});

// zurück slider
el("#zurueckslider").addEventListener("input", function () {
  el(
    "#zurueck"
  ).innerHTML = `<img src="img/icons/left-arrow.png" alt="zurückspulen" title="zurückspulen" height="15"> &nbsp;${Number(
    this.value
  )}s`;
});
el("#zurueckslider").addEventListener("mouseleave", function () {
  set("zurueck", Number(this.value));
});

// Loop slider
el("#loopslider").addEventListener("input", function () {
  if (loopflag === 0) {
    el(
      "#loop"
    ).innerHTML = `<img src="img/icons/loop.png" alt="loop" title="loop" height="15"> Aus`;
  } else {
    el("#loop").innerHTML = `${Number(
      this.value
    )}s <img src="img/icons/loop.png" alt="loop" title="loop" height="15"> ein`;
  }
});
el("#loopslider").addEventListener("mouseleave", function () {
  set("loop", Number(this.value));
});

// Geschwindigkeit Slider
el("#geschwindigkeitslider").addEventListener("input", function () {
  // Überprüfung, ob Sound vorhanden ist
  if (sound) {
    sound.playbackRate = Number(this.value) / 10;
  }
  // Zahl immer mit einer Nachkommastelle
  el(
    "#geschwindigkeitsliderlabel"
  ).innerHTML = `<img src="img/icons/speed-o-meter.jpg" alt="Geschwindigkeit" title="Geschwindigkeit"> ${(
    Number(this.value) / 10
  ).toFixed(1)}`;
});
el("#geschwindigkeitslider").addEventListener("mouseleave", function () {
  set("geschwindigkeit", Number(this.value));
});

// Play oder Pause Funktion
// ändert Button Text, mithilfe des Flags wird pause oder play ausgeführt
el("#playpause").addEventListener("click", function () {
  if (pauseflag === 0) {
    sound.pause();
    pauseflag = 1;
    el(
      "#playpause"
    ).innerHTML = `<img src="img/icons/play.jpg" alt="Abspielen und Anhalten" title="Abspielen und Anhalten">`;
  } else {
    sound.play();
    pauseflag = 0;
    el(
      "#playpause"
    ).innerHTML = `<img src="img/icons/pause.jpg" alt="Abspielen und Anhalten" title="Abspielen und Anhalten">`;
  }
});

// mute / unmute Funktion
// mithilfe des Flags wird mute oder unmute ausgeführt
el("#volume").addEventListener("click", function () {
  if (muteflag === 0) {
    // derzeitige Lautstärke speichern
    volumeTemp = sound.volume * 100;
    // Lautstärke 0 in Slider und Button anzeigen
    el("#volumeslider").value = 0;
    el(
      "#volume"
    ).innerHTML = `<img src="img/icons/no-volume.jpg" alt="Lautstärke" title="Lautstärke"> 0%`;
    // Flag ändern
    muteflag = 1;
  } else {
    // alte Lautstärke in Slider und Button anzeigen
    el("#volumeslider").value = volumeTemp;
    el(
      "#volume"
    ).innerHTML = `<img src="img/icons/volume.jpg" alt="Lautstärke" title="Lautstärke"> ${Number(
      volumeslider.value
    )}%`;
    // Flag ändern
    muteflag = 0;
  }
}); // Ende EventListener mute / unmute Funktion

// Titel zurück
el("#skip-back").addEventListener("click", function () {
  // Überprüfung ob nicht erster Song
  if (songindex > 1) {
    // zählt index zurück, ruft Funktion zum Laden des Songs auf
    songindex = songindex - 2;
    loadSongsFunktionen();
  } else {
    // wiederholt den aktuellen Song
    sound.currentTime = 0;
  }
});

// Vorspulen um X Sekunden, Addiert X Sekunden auf die CurrentTime
el("#vor").addEventListener("click", function () {
  let zeit = Number(vorslider.value);
  sound.currentTime = sound.currentTime + zeit;
});

// Zurückspulen um X Sekunden, Subrahiert X Sekunden von der CurrentTime
el("#zurueck").addEventListener("click", function () {
  let zeit = Number(zurueckslider.value);
  sound.currentTime = sound.currentTime - zeit;
});

// Nächster Titel
el("#skip-to-next").addEventListener("click", async function () {
  // Überprüfung ob mehr als 1 Song in Playlist
  let songAnzahl = await get("songAnzahl").then((wert) => wert);
  if (songAnzahl > 0) {
    loadSongsFunktionen();
  }
  // Nichts machen, wenn nur ein Song vorhanden ist
});

// Loopfunktion. Alle x Sekunden für der Abschnitt wiederholt
// mit Flag, der bei nochmaligem Klicken deaktiviert wird
// asynchrone Funktion wegen delay implementierung
el("#loop").addEventListener("click", async function () {
  let zeit = Number(loopslider.value);
  if (loopflag === 0) {
    loopflag = 1;
    el("#loop").innerHTML = `${Number(
      loopslider.value
    )}s <img src="img/icons/loop.png" alt="loop" title="loop" height="15"> ein`;
  } else {
    loopflag = 0;
    el(
      "#loop"
    ).innerHTML = `<img src="img/icons/loop.png" alt="loop" title="loop" height="15"> Aus`;
  }
  while (loopflag === 0) {
    sound.currentTime = sound.currentTime - zeit;

    // Muss am Ende durch den Wert der eingestellten Geschwindigkeit dividiert werden
    await delay((zeit * 1000) / Number(geschwindigkeitslider.value / 10));
  }
}); // Ende EventListener Loop Funktion

// aktuellen Titel wiederholen, setzt die Zeit auf 0
el("#titel-wiederholen").addEventListener("click", function () {
  sound.currentTime = 0;
});

// ################################### EVENT LISTENER ENDE ###################################

// experimentelle geheime Top-Secret Funktionen :>

// Party Modus
document.addEventListener("keydown", keyDown);

function keyDown(b) {
  if (b.key === "b" && party === 0) {
    party = 1;
  } else {
    party = 0;
  }
}

// Schallplattensprung - leider nicht eingesetzt
function schallPlattenSprung(audioData) {
  // 1/1000 -> 0,1% Chance, dass der Zufall 1 wird
  let zufall = Math.floor(Math.random() * 1000);
  if (zufall == 1) {
    // 2 mal einen 0,5 sekündigen "Sprung" erzeugen
    setTimeout(function () {
      audioData.currentTime = audioData.currentTime - 0.5;
    }, 500);
    setTimeout(function () {
      audioData.currentTime = audioData.currentTime - 0.5;
    }, 1000);
  }
}

// Exportierte Funktionen
export {
  el,
  create,
  playAudioFunktionen,
  songAnzahlLesen,
  browserBlocken,
  handleDragOver,
  loadSongsFunktionen,
};
