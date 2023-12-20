// Importierte Funktionen
import {
  el,
  create,
  playAudioFunktionen,
  songAnzahlLesen,
  browserBlocken,
  handleDragOver,
  loadSongsFunktionen,
} from "./funktionen.js";

// indexed DB Import
import {
  get,
  set,
  getMany,
  clear,
  // verfügbare, aber nicht eingesetzte Funktionen
  setMany,
  update,
  del,
  createStore,
  entries,
  keys,
  promisifyRequest,
  values,
} from "./indexedDB.js";

(function () {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./service-worker.js", { scope: "./" })
      .then((reg) => {
        console.log("Service Worker ist erfolgreich registriert");
      })
      .catch((error) => {
        console.log("Service Worker: Unbekannter Fehler :-( " + error);
      });
  }

  // ################################### VARIABLEN ###################################

  let songAnzahl;

  // ################################### VARIABLEN ENDE ###################################

  // ################################### SEITENAUFRUF START ###################################

  // Diese Funktionen werden beim Laden der Seite aufgerufen

  // Liest Songs und Einstellungen für den Start
  async function seiteStart() {
    // Liest die Songs aus der IndexedDB und schreibt den Namen in die Playlist
    // Anzahl der Songs getten
    songAnzahl = await songAnzahlLesen();

    // Schleife, die von 0 bis songAnzahl zählt
    for (let songIndex = 0; songIndex <= songAnzahl; songIndex++) {
      // Variablen Deklaration für die Songs
      let audioName, songGeladen;

      // IF Abfrage ob es ein Drag&Drop Song ist oder ein Click-Json Song ist
      let songArray = await get(`Song${songIndex}`).then((wert) => wert);

      // IF -> JSON Song
      // es wird überprüft ob es ein Array ist
      if (songArray.constructor == Array) {
        // Informationen werden in Variablen gespeichert
        audioName = songArray[0];
      }

      // ELSE -> Drag&Drop Songs
      else {
        // aus DB laden
        songGeladen = await get(`Song${songIndex}`).then((wert) => wert);
        // Song Name wird in Variable gespeichert
        audioName = songGeladen.name.split(".")[0];
      }

      // neues div archiv-song erzeugen mit div class="song-pl" und class="select-pl"
      let archivDiv = create("div");
      archivDiv.setAttribute("id", "archiv-song");

      let audioDiv = create("div");
      audioDiv.innerHTML = audioName;

      // Div in das div "list" einfügen
      el(" #list").appendChild(archivDiv);
      archivDiv.appendChild(audioDiv);

      // den neuen Divs Klassen mitgeben
      audioDiv.className = "song-pl";
    } // Ende Schleife

    // Werte der Einstellungen aus IndexedDB Lesen und eintragen
    // es wird getMany benutzt, anstatt jedes einzeln zu getten
    let alleWerte = await getMany([
      "fade",
      "visual",
      "abstand",
      "volume",
      "vor",
      "zurueck",
      "loop",
      "geschwindigkeit",
    ]);

    // Überprüfung ob Wert vorhanden. Kein Wert ist undefined, somit wird If nicht ausgeführt
    // beim erstmaligen Start sind bspw. keine Werte gespeichert
    if (alleWerte[0]) {
      el("#fadeslider").value = alleWerte[0];
      el("#fadesliderlabel").innerHTML = `Fade `;
    }
    if (alleWerte[1]) {
      el("#visualslider").value = alleWerte[1];
      el("#visualsliderlabel").innerHTML = `Balken-Breite `;
    }
    if (alleWerte[2]) {
      el("#abstandslider").value = alleWerte[2];
      el("#abstandsliderlabel").innerHTML = `Balken-Abstand `;
    }
    if (alleWerte[3]) {
      el("#volumeslider").value = alleWerte[3];
      el(
        "#volume"
      ).innerHTML = `<img src="img/icons/volume.jpg" width="auto" height="auto" alt="Lautstärke" title="Lautstärke"> ${alleWerte[3]}%`;
    }
    if (alleWerte[4]) {
      el("#vorslider").value = alleWerte[4];
      el(
        "#vor"
      ).innerHTML = `${alleWerte[4]}s&nbsp; <img src="img/icons/right-arrow.png" width="auto" height="auto" alt="vorspulen" title="vorspulen">`;
    }
    if (alleWerte[5]) {
      el("#zurueckslider").value = alleWerte[5];
      el(
        "#zurueck"
      ).innerHTML = `<img src="img/icons/left-arrow.png" width="auto" height="auto" alt="zurückspulen" title="zurückspulen"> &nbsp;${alleWerte[5]}s`;
    }
    if (alleWerte[6]) {
      el("#loopslider").value = alleWerte[6];
      el(
        "#loop"
      ).innerHTML = `${alleWerte[6]}s <img src="img/icons/loop.png" width="auto" height="auto" alt="loop" title="loop"> ein`;
    }
    if (alleWerte[7]) {
      el("#geschwindigkeitslider").value = alleWerte[7];
      el(
        "#geschwindigkeitsliderlabel"
      ).innerHTML = `<img src="img/icons/speed-o-meter.jpg" width="auto" height="auto" alt="Geschwindigkeit" title="Geschwindigkeit"> ${
        alleWerte[7] / 10
      }`;
    }
  } // Ende seiteStart funktion

  // Checken ob der Browser bestimmte Funktionen unterstützt
  function checkBrowser() {
    if (window.FileReader && window.Blob && window.FileList && window.File) {
      // Alles ok und nichts machen, wenn untersützt
    } else {
      // Fehlermeldung bei nicht unterstützt
      alert("Bitte keinen Steinzeitbrowser benutzen. Danke.");
    }
  } // Ende Checkbrowser Funktion

  // Beide Startfunktionen werden direkt aufgerufen
  seiteStart();
  checkBrowser();

  // ################################### SEITENAUFRUF ENDE ###################################

  // ################################### FUNKTIONEN START ###################################

  // processFile Funktion für den Drag & Drop
  async function processFile(evt) {
    browserBlocken(evt);

    // speichert die gedraggte Datei in Variable
    let file = evt.dataTransfer.files[0];

    // Checken ob Audio Datei
    // es werden die letzten 4 Stellen abgetrennt und die Endung überprüft
    let nameCheck = file.name.slice(-4);
    if (nameCheck === ".mp3" || nameCheck === ".m4a") {
      el("#drag-drop").innerHTML = "<br><br>Drop";
    } else {
      // Warnung und Abbrechen wenn keine unterstützte Datei ist
      alert("Das ist kein unterstütztes Audio-Format (mp3, m4a)!");
      return;
    }

    // Make List Funktion mit Namen als Übergabeparameter
    makeList(file.name.split(".")[0]);

    // Anschließend folgt Speicherung des files (Blob) in IndexedDB
    // songAnzahl wird ebenfalls gespeichert

    // Song Anzahl getten
    songAnzahl = await songAnzahlLesen();

    // Song speichern
    songSpeichern(songAnzahl, file);
  } // Process File Funktion ende

  // Erstellt Liste der hinzugefügten Lieder
  function makeList(audioName) {
    // neues div und Unter-divs mit Eigenschaften erstellen
    let plDiv = create("div");
    plDiv.setAttribute("id", "pl-song");

    let audioDiv = create("div");
    audioDiv.innerHTML = audioName;

    // Div der Liste hinzufügen
    el("#list").appendChild(plDiv);
    plDiv.appendChild(audioDiv);

    // den neuen Divs Klassen mitgeben
    audioDiv.className = "song-pl";
  } // Ende makeList Funktion

  // Funktion zum Speichern der Songs (JSON und DROP Songs)
  // Song ist somit entweder file (aus dem drop) oder array (aus json liste)
  function songSpeichern(songAnzahl, song) {
    // Wenn bereits Songs drin sind
    if (songAnzahl >= 0) {
      songAnzahl++;
      set(`Song${songAnzahl}`, song);
      set("songAnzahl", songAnzahl);
    }
    // Wenn nicht, dann erster Song
    // SongAnzahl (aus indexedDB) ist dann nämlich nicht vorhanden, also undefined
    else {
      set("Song0", song);
      set("songAnzahl", 0);
    }
  } // songSpeichern Ende

  // ############################## JSON FUNKTIONEN ##############################

  // jsonLaden Funktion
  // input ist das Genre oder die Art des Chart
  function songsJsonLaden(input) {
    Promise.all([
      // loadJson Funktion mit Übergabeparameter
      loadJson("data/songs.json"),
    ]).then((result) => {
      // bei Erfolg Funktion aufrufen
      // Ruft in Abhängigkeit des inputs verschiedene Funktionen auf
      if (input === "pie" || input === "bar") {
        // Test Input-Content
        console.log("Input songsJsonLaden: ", input);
        // Funktionen für die Chart-Implementierung
        anzahlGenreFiltern(result[0], input);
      } else {
        // Funktion für die weitere Jukebox Funktionalität
        ergebnisseFiltern(result[0], input);
      }
    });
  }

  // loadJson funktion
  async function loadJson(quelle) {
    return await (await fetch(quelle)).json();
  }

  // für alphabetische Sortierung der Json Ergebnisse
  function vergleichKuenstler(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a < b ? -1 : a > b ? 1 : 0;
  }

  // Funktion für das Filtern der Ergebnisse
  function ergebnisseFiltern(array, genre) {
    // Genre in der Überschrift anzeigen
    el("#auswahl-liste").innerHTML = `<h2 id="songs-head">${genre}</h2><br>    
    <div id="song-liste"></div>`;
    // Nach Genre Filtern und in neues Array speichern
    let arrayGenre = array.filter((val) => val["Genre"] === genre);

    // Ergnisse nach Künstlername sortieren
    arrayGenre.sort(function (a, b) {
      return vergleichKuenstler(a.Künstlername, b.Künstlername);
    });

    // Schleife, die alle Lieder für das ausgewählte Genre durchgeht
    // Speichert relevante Eigenschaften in Variablen zum Übergeben
    for (let i = 0; i < arrayGenre.length; i++) {
      let titel = arrayGenre[i].Titel;
      let kuenstlerName = arrayGenre[i].Künstlername;
      let erscheinungsDatum = arrayGenre[i].Veröffentlichungsjahr;
      let dauer = arrayGenre[i].Spieldauer;
      let dateipfad = arrayGenre[i].Src;

      // Button für jedes Lied erstellen
      makeGenreButton(
        titel,
        kuenstlerName,
        erscheinungsDatum,
        dauer,
        dateipfad
      );
    } // Ende for Schleife
  } // ergebnisseFiltern Ende

  // Erstellt Buttons für die Liedauswahl aus dem Json
  function makeGenreButton(
    titel,
    kuenstlerName,
    erscheinungsDatum,
    dauer,
    dateipfad
  ) {
    // erstellt Div um jeden Button
    let genreDiv = create("div");
    genreDiv.setAttribute("id", "geladen-song");

    // Erstellt Button mit Inhalt
    let genreButton = create("div");
    genreButton.innerHTML = `${kuenstlerName} - ${titel} - ${dauer}`;

    let playlistButton = create("div");
    playlistButton.innerHTML = ` + `;

    // Div und Button anfügen
    el("#song-liste").appendChild(genreDiv);
    genreDiv.appendChild(genreButton);
    genreDiv.appendChild(playlistButton);

    // den neuen Divs Klassen mitgeben
    genreButton.className = "song-s";
    playlistButton.className = "select-s";

    // EventListener für die Buttons erstellen mit Übergabeparameter
    // Lied direkt aus der Liste anhören
    genreButton.addEventListener("click", () => {
      playAudioFunktionen(titel, kuenstlerName, erscheinungsDatum, dateipfad);
    });
    // Lied der Playlist hinzufügen
    playlistButton.addEventListener("click", () => {
      playlistButtonClick(titel, kuenstlerName, erscheinungsDatum, dateipfad);
    });
  } // makeGenreButton Funktion Ende

  // Funktion beim hinzufügen eines Songs zur Playlist durch Klick (aus dem Json)
  async function playlistButtonClick(
    titel,
    kuenstlerName,
    erscheinungsDatum,
    dateipfad
  ) {
    // Make List Funktion mit Namen als Übergabeparameter
    makeList(titel);

    // Es wird ein Array erstellt mit den übergebenen Songinformationen
    let songArray = [titel, kuenstlerName, erscheinungsDatum, dateipfad];

    // Song Anzahl getten
    songAnzahl = await songAnzahlLesen();

    // Song speichern
    songSpeichern(songAnzahl, songArray);
  } // playlistButtonClick Funktion Ende

  // ############################# !!! Anfang aus Funstepper !!! #############################
  // ############################# aus Funstepper #############################

  // Speicher-Variablen
  let key = "Play-Lists";

  let storageData = {};

  let storage = {
    update: function (playlist) {
      // ruft Methode read auf zum Auslesen des Speichers
      this.read();
      // wenn eine Komposition gefunden wurde,
      //-> dann soll das storageData-Obj um die aktuelle Composition erweitert werden
      // hier Schreibweise mit eckigen Klammern für Obj: statt obj.a  auch  obj['a']
      // Übergeben des Compositionstitels als key
      storageData[playlist.title] = playlist;

      // um die neue Composition im Storage abzuspeichern, muss sie erst umgewandelt werden
      let temp = JSON.stringify(storageData);

      // neue Composition in den Local Storage
      localStorage.setItem(key, temp);
    },
    read: function () {
      let data = localStorage.getItem(key);
      // wenn Storage leer, dann Abbruch
      if (!data) {
        return;
      } // Ende if Speicher leer
      // wenn Storgae nicht leer, dann Inhalt in storageData-Object
      storageData = JSON.parse(data);
    },
    // zum Löschen des gesamten Local Storage! -> Achtung!
    clearStorage: function () {
      localStorage.removeItem(key);
    },
    save: function (data) {
      let temp = JSON.stringify(data);
      localStorage.setItem(key, temp);
    },
  }; // Ende Speicher-Object

  // gespeicherte Kompositionen laden und zeigen
  function showArchiv() {
    el("#visualizer-wrapper").className = "hide";
    el("#wrapper-auswahl").style.display = "none";

    // damit die Speicher-Liste nicht doppelt angezeigt wird, hier leeren
    el("#vorhandene-pl").className = "show";
    el("#pl-archiv").className = "show";

    // Speicher auslesen
    storage.read();
    console.log(storageData);

    let objKeys = Object.keys(storageData);
    console.log(objKeys);
    if (objKeys.length === 0) {
      el("#info-lesen").innerHTML = "Es sind keine Daten vorhanden.";
      return;
    } // Ende if

    let div, span, wahlButton, deleteButton;

    objKeys.forEach((val) => {
      // pro Titel ein div kreieren
      div = create("div");

      // Button zur Wahl einer gespeicherten Komposition
      wahlButton = create("button");
      wahlButton.setAttribute("data-titel", storageData[val].title);
      wahlButton.innerHTML = "Play-List wählen";

      // Button zum Löschen einer gespeicherten Komposition
      deleteButton = create("button");
      deleteButton.setAttribute("data-titel", storageData[val].title);
      deleteButton.innerHTML = "Play-List löschen";

      // Titel anzeigen
      span = create("span");
      span.innerHTML = storageData[val].title;

      div.appendChild(wahlButton);
      div.appendChild(span);
      div.appendChild(deleteButton);

      // #################################################################
      // EventListener für verschiedene Buttons einrichten

      // Lösch-Button auf Load-Seite aktiuvieren
      deleteButton.addEventListener("click", function () {
        // vor dem Löschen nochmal warnen -> mit fertiger Funktion confirm
        let check = false;

        if (
          confirm("Achtung! Diese Play-List wird unwiederbringlich gelösch!")
        ) {
          // check = true;
        } else {
          // check = false;
          // Abbruch
          return;
        } // Ende if-else
        // cl( check );

        let deletePlayList = this.getAttribute("data-titel");

        // Löschen aus dem Object im Storage
        // zum Auslesen eines Attributwertes eckige Klammern
        delete storageData[deletePlayList];

        // Local Storage wird vor dem Abspeichern noch einmal komplett geleert
        // -> ist Sicherheitsnetz/ redundant
        // -> so muss das Leeren nicht allein durch Überschreiben passieren
        storage.clearStorage();

        // Update im Local Storage
        // aktuelles Object in den Speicher schreiben
        storage.save(storageData);

        // Update Ausgabe-Liste
        // 1. Parent-div ermitteln
        let parentDiv = this.parentNode;
        el("#show-pl").removeChild(parentDiv);
      }); // Ende f in Event-Handler deleteButton

      // Titel-Wahl-Button auf Load-Seite
      wahlButton.addEventListener("click", function () {
        el("#pl-archiv").className = "hide";

        // Titel auslesen via Attribute data-titel
        let selected = this.getAttribute("data-titel");
        el("#titel-info").innerHTML = `Play-List-Titel: ${selected}`;
        let selectedPlayList = storageData[selected];

        // cl( selectedPlayList );
      }); // Ende f in Event-Handler wahlButton

      el("#show-pl").appendChild(div);
    }); // Ende foreach objKey
  } // Ende f load Play-List-Archiv

  // Funktion Funktion für Speicher-Button ->
  function savePlayList() {
    el("#visualizer-wrapper").className = "hide";
    el("#wrapper-auswahl").style.display = "none";

    el("#vorhandene-pl").className = "show";
    el("#neue-pl").className = "show";

    // Leerzeichen oder auch nupsi ;-)
    el("#speicher-info").innerHTML = "&nbsp;";
    let plTitel = el("#pl-titel").value;

    if (plTitel[0] === "" || plTitel.length === 0) {
      el("#speicher-info").innerHTML =
        "Bitte einen Titel für die Song-Zusammenstellung eingeben!";
      // mit return wird abgebrochen
      return;
    } // Ende if
    // ab hier haben wir einen Titel für die Komposition

    // Speicher-Eingaben und Eingabe-Masken wieder entfernen
    el("#neue-pl").className = "hide";

    let sample = {};

    sample.title = plTitel;
    sample.checked = {};
    // bpm steht für beats per minute
    // sample.bpm = speed;

    storage.update(sample);
  } // Ende f Speichern der aktuellen Komposition

  // ############################# Ende Funstepper #############################

  // ####################### JSON FUNKTIONEN ENDE ##################

  // ############################# ALLE FUNKTIONEN ENDE #############################

  // ############################# EVENT LISTENER #############################

  // Drag & Drop Events
  el("#drag-drop").addEventListener("dragover", handleDragOver);
  el("#drag-drop").addEventListener("drop", processFile);

  // Click Events
  el("#abbrechen").addEventListener("click", function () {
    // IndexedDB löschen
    clear();
    // Seite neuladen
    location.reload();
  });

  // Spielt die Playliste
  el("#abspielen").addEventListener("click", function () {
    // Überprüfung ob Songs vorhanden sind
    if (songAnzahl >= 0) {
      loadSongsFunktionen();

      // mittlere Song-Liste mit Abspielstart ausblenden, wenn vorhanden
      if (el("#song-liste")) {
        el("#song-liste").setAttribute("class", "hide");
        el("#auswahl-liste h2").setAttribute("class", "hide");
        el("#drag-drop").setAttribute("class", "show");
      } // kein else
      // wenn nur ein Song in der Playlist, dann Fehlermeldung
    } else {
      el("#drag-drop").innerHTML =
        "Eine Liste besteht aus mindestens 2 Inhalten<br>Finde den Fehler!";
    }
  });

  // Speichern der Slider Einstellungen bei mouseleave
  // Bei Neuladen erscheinen somit die vom Benutzer eingestellten Werte
  // Wichtig z.b. bei Lautstärke
  el("#visualslider").addEventListener("mouseleave", function () {
    set("visual", Number(this.value));
  });

  el("#fadeslider").addEventListener("mouseleave", function () {
    set("fade", Number(this.value));
  });

  el("#abstandslider").addEventListener("mouseleave", function () {
    set("abstand", Number(this.value));
  });

  // Click EventListener für Genre anzeigen Funktionen
  el("#pop").addEventListener("click", function () {
    songsJsonLaden("Pop");
  });
  el("#rock").addEventListener("click", function () {
    songsJsonLaden("Rock");
  });
  el("#schlager").addEventListener("click", function () {
    songsJsonLaden("Schlager");
  });
  el("#techno").addEventListener("click", function () {
    songsJsonLaden("Techno");
  });
  el("#chanson").addEventListener("click", function () {
    songsJsonLaden("Chanson");
  });
  el("#acapella").addEventListener("click", function () {
    songsJsonLaden("A capella");
  });
  el("#filmmusik").addEventListener("click", function () {
    songsJsonLaden("Filmmusik");
  });
  el("#instrumental").addEventListener("click", function () {
    songsJsonLaden("Instrumental");
  });
  el("#metal").addEventListener("click", function () {
    songsJsonLaden("Metal");
  });
  el("#swing").addEventListener("click", function () {
    songsJsonLaden("Swing");
  });
  el("#weltmusik").addEventListener("click", function () {
    songsJsonLaden("Weltmusik");
  });
  el("#notenspur").addEventListener("click", function () {
    songsJsonLaden("Notenspur");
  });

  // inaktiver Teil:
  el("#lade-pl").addEventListener("click", showArchiv);
  el("#archiv-hide").addEventListener("click", function () {
    // ergänzt 2023
    location.reload();
    // el("#visualizer-wrapper").className = "show";
    // el("#wrapper-auswahl").style.display = "flex";
    el("#pl-archiv").className = "hide";
    el("#vorhandene-pl").className = "hide";
  }); // Ende f in Event-Handler
  el("#neue-pl").addEventListener("click", savePlayList);
  el("#pl-fertig").addEventListener("click", savePlayList);

  // ############################# CHART JS #############################

  // Chart JS Implemenetierung
  // ist lsogelöst vom gesamten Projekt
  // https://www.domainssaubillig.de/blog/blog-artikel/items/id-5-javascript-loesungen-zum-erstellen-von-interaktiven-charts.html

  let ctx2;
  let chartflag = 0;
  // Buttons mit balken Chart
  // Funktioniert mit einem 3-er Flag

  el("#kuchen").addEventListener("click", function () {
    console.log("Chart-Flag: ", chartflag);
    // 0: Startwert - Chart noch nicht vorhanden und wird somit erstellt
    // Somit wird Chart bei jedem Click nicht neu erstellt
    if (chartflag === 0) {
      // https://www.tutorialspoint.com/how-to-clear-cache-memory-using-javascript
      // 1) location.reload(true);
      // 2)
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then(function (registrations) {
            for (let registration of registrations) {
              registration.unregister();
            }
          });
      }
      el("#canvas-chart").style.display = "block";
      // songsJsonLaden("pie");
      songsJsonLaden("bar");
      chartflag = 1;
    }
    // 1: Chart vorhanden, Chart Canvas wird unsichtbar gemacht
    else if (chartflag === 1) {
      el("#canvas-chart").style.display = "none";
      chartflag = 2;
    }
    // 2: Chart vorhanden, Chart Canvas wird sichtbar gemacht
    else {
      el("#canvas-chart").style.display = "block";
      chartflag = 1;
    }
  });

  // Schreibt ein neues Objekt mit der Anzahl der Genres und dem Namen der Genres
  function anzahlGenreFiltern(result, type) {
    // Info zu Arbeitsschritt
    console.log("Anzahl je Genre wird abgerufen");
    // zum Testen, was hier angekommen ist
    console.log("result-Obj: ", result, ", type-Obj: ", type);
    let anzahlGenre = {
      anzahl: [
        result.filter(function (a) {
          return a.Genre == "Schlager";
        }).length,
        result.filter(function (a) {
          return a.Genre == "Techno";
        }).length,
        result.filter(function (a) {
          return a.Genre == "Pop";
        }).length,
        result.filter(function (a) {
          return a.Genre == "Rock";
        }).length,
        result.filter(function (a) {
          return a.Genre == "Metal";
        }).length,
        result.filter(function (a) {
          return a.Genre == "A capella";
        }).length,
        result.filter(function (a) {
          return a.Genre == "Chanson";
        }).length,
        result.filter(function (a) {
          return a.Genre == "Filmmusik";
        }).length,
        result.filter(function (a) {
          return a.Genre == "Instrumental";
        }).length,
        result.filter(function (a) {
          return a.Genre == "Weltmusik";
        }).length,
        result.filter(function (a) {
          return a.Genre == "Swing";
        }).length,
      ],
      label: [
        "Schlager",
        "Techno",
        "Pop",
        "Rock",
        "Metal",
        "A capella",
        "Chanson",
        "Filmmusik",
        "Instrumental",
        "Weltmusik",
        "Swing",
      ],
    }; // Ojekt Ende
    // Funktion zum erstellen des Charts aufrufen
    chartErstellen(anzahlGenre, type);
  } // anzahlGenreFiltern Ende

  // Erstellt den Chart mit den Ergnissen der Filterfunktion
  // mittels verschiedenen type-Parametern kann die Art (z.b. pie) geändert werden
  function chartErstellen(data, type) {
    console.log("Chart erstellen, data; ", data, "type: ", type);
    ctx2 = document.getElementById("canvas-chart").getContext("2d");
    new Chart(ctx2, {
      // type: "pie",
      // type: "bar",
      type: type,
      data: {
        labels: data.label,
        datasets: [
          {
            label: "Musik-Mix im Speicher",
            color: "rgb(206, 206, 164)",
            fontSize: 25,
            data: data.anzahl,
            backgroundColor: [
              "magenta",
              "blueviolet",
              "royalblue",
              "teal",
              "green",
              "greenyellow",
              "rgba(206, 206, 164,1.0)",
              "gold",
              "orange",
              "red",
              "mediumvioletred",
              "purple",
            ],
            borderWidth: "solid 1vw rgb(206, 206, 164)",
          },
        ],
      },
      // options: {
      //   legend: {
      //     labels: {
      //       fontColor: "rgb(206, 206, 164)",
      //       fontSize: 15,
      //     },
      //   },
      //   scales: {
      //     yAxes: [
      //       {
      //         ticks: {
      //           display: false,
      //         },
      //       },
      //     ],
      //   },
      // },
      options: {
        responsive: true,
        // plugins: {
        //   legend: {
        //     position: "right",
        //   },
        //   title: {
        //     display: true,
        //     text: "Musik-Mix im Speicher",
        //   },
        // },
      },
    });
  } // Ende Chart erstellen Funktion

  el("#kuchen").addEventListener("click", function () {
    el("#chart").style.display = "block";
    el("#canvas").style.display = "none";
    el("#canvas-vis-regler").style.display = "none";
    el("#visualizer-wrapper").style.display = "none";
    el("#wrapper-auswahl").style.display = "none";
    el("#footer-jukebox").style.display = "block";
  });
  el("#juke-box").addEventListener("click", function () {
    location.reload();
  });
  // ENDE Chart
})();
