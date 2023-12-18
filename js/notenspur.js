(function () {
  let map;

  // Funktion zum Anzeigen der Karte
  function showMap() {
    map = L.map("map", {
      // FullScreen Implementierung
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: "topleft",
      },
    });
    // Koordinaten von Leipzig-West, mit Zoomfaktor (je größer desto kleiner der Ausschnitt)
    // https://www.rdocumentation.org/packages/leaflet/versions/2.2.1/topics/setView
    map.setView([51.34, 12.3747], 14);

    // Karte von OpenStreetMap -> attribution muss drin bleiben -> Lizenz und Nutzungsbedingung!
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Koordinaten bei Klick zeigen
    map.on("click", function (e) {
      // Popup-Fenster in der Karte mit Inhalten
      L.popup()
        // Koordinaten setzen -> müssen aus einem Array kommen
        .setLatLng(e.latlng)
        // Inhalte setzen (Array-Werte ggf. mit .toString() gleich in Strings umwandeln, war aber hier nicht zwingend nötig)
        .setContent(
          `<p><strong>Koordinaten in Dezimalgraden:</strong><br>geogr. Breite: ${e.latlng.lat.toFixed(
            4
          )},  
            <br>geogr. L&auml;nge: ${e.latlng.lng.toFixed(4)}</p>`.toString()
        )
        // Popup-Fenster öffnen
        .openOn(map);
    }); // Ende f map.on
  } // Ende f showMap

  // #################################### Notenweg #######################################################
  // Funktion zum Laden der Daten für den 8 km langen Notenweg
  // https://notenspur-leipzig.de/notenrouten/leipziger-notenweg/karte-stationen/

  function loadDataNotenweg() {
    // Fetch-Dings-Funktion
    fetch("data/notenweg.geojson")
      .then((response) => response.json())
      .then((data) => {
        // type: Feature in Json.
        data.features.forEach((feature) => {
          showMarkerNotenweg(feature);
        });
      });
  } // Ende f loadData

  // Route in die Karte einzeichnen
  // https://www.mapsdirections.info/de/zeichnen-zie-eine-route-google-maps/

  // anzeigen der vorhandenen Marker auf der Karte
  // -> bestehen aus 2 Bildern marker-icon und marker-shadow
  function showMarkerNotenweg(feature) {
    // jede Koordinate (da Schleife in loadData) wird durchgegangen und gespeichert
    let coords = feature.geometry.coordinates;

    // Tausch von Longitude und Latitude
    coords = [coords[1], coords[0]];

    // extra Variable um Schreibareit zu sparen
    let daten = feature.properties;

    // Popup mit Inhalt aus dem .geojson füllen
    let popContent = `<h2>Notenweg - Station ${daten.nr}: </h2><h4>${daten.name}</h4>
        <img class="popupimage" src=${daten.bild} alt=${daten.alt} title="${daten.title}">
        <br>${daten.text} <a href="${daten.mehr}" target="_blank">Mehr...</a><br>
        <br>Reinh&ouml;ren: <audio class="audio" src=${daten.mp3} type="audio/mp3" controls></audio><br>
        <br><a href="${daten.route}" target="_blank">Wegvorschlag (pdf)</a>`;

    // eigenes Icon festlegen als Marker für die Karte
    let markerNotenweg = L.icon({
      iconUrl: `../leaflet/images/marker-notenweg_${daten.nr}.png`,
      iconSize: [29, 42],
      iconAnchor: [20, 0],
    });

    // Marker mit angebundenem Popup in der Karte erscheinen lassen
    L.marker(coords, { icon: markerNotenweg }).addTo(map).bindPopup(popContent);
  } // Ende showMarker

  // #################################### Notenspur #######################################################
  // Funktion zum Laden der Daten für die 5,3 km lange Notenspur
  // https://notenspur-leipzig.de/notenrouten/notenspur/karte-stationen/

  function loadDataNotenspur() {
    // Fetch-Dings-Funktion
    fetch("data/notenspur.geojson")
      .then((response) => response.json())
      .then((data) => {
        // type: Feature in Json.
        data.features.forEach((feature) => {
          showMarkerNotenspur(feature);
        });
      });
  } // Ende f loadData

  // anzeigen der vorhandenen Marker auf der Karte
  // -> bestehen aus 2 Bildern marker-icon und marker-shadow
  function showMarkerNotenspur(feature) {
    // jede Koordinate (da Schleife in loadData) wird durchgegangen und gespeichert
    let coords = feature.geometry.coordinates;

    // Tausch von Longitude und Latitude
    coords = [coords[1], coords[0]];

    // extra Variable um Schreibareit zu sparen
    let daten = feature.properties;

    // Popup mit Inhalt aus dem .geojson füllen
    let popContent = `<p>Notenspur - Station ${daten.nr}: </p><h2>${daten.name}</h2>
        <img class="popupimage" src=${daten.bild} alt=${daten.alt} title="${daten.title}">
        <br>${daten.text} <a href="${daten.mehr}" target="_blank">Mehr...</a><br>
        <br>Reinh&ouml;ren: <audio class="audio" src=${daten.mp3} type="audio/mp3" controls></audio><br>
        <br><a href="${daten.route}" target="_blank">Wegvorschlag (pdf)</a>`;

    // eigenes Icon festlegen als Marker für die Karte
    let markerNotenSpur = L.icon({
      iconUrl: `../leaflet/images/marker-notenspur_${daten.nr}.png`,
      iconSize: [29, 42],
      iconAnchor: [20, 0],
    });

    // Marker mit angebundenem Popup in der Karte erscheinen lassen
    L.marker(coords, { icon: markerNotenSpur })
      .addTo(map)
      .bindPopup(popContent);
  } // Ende showMarker

  // ################################### Ausführen ###################################

  showMap();
  loadDataNotenweg();
  loadDataNotenspur();
})();
