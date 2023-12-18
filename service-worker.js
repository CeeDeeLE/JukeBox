// Set a name for the current cache
let cacheName = "JuGagaJuBo_v1";

// Default files to always cache

let cacheFiles = [
  "./",
  "/index.html",
  "/notenspur.html",
  "/favicon.ico",
  "/js/charts.js",
  "/js/funktionen.js",
  "/js/indexedDB.js",
  "/js/main.js",
  "/js/notenspur.js",
  "/js/pop-kekse.js",
  "/css/style.css",
  "/css/notenspur.css",
  "/css/fonts/AudiowideRegular.woff",
  "/css/fonts/font-awesome.css",
  "/css/fonts/font-awesome.min.css",
  "/css/fonts/fontawesome-webfont.eot",
  "/css/fonts/fontawesome-webfont.svg",
  "/css/fonts/fontawesome-webfont.ttf",
  "/css/fonts/fontawesome-webfont.woff",
  "/css/fonts/fontawesome-webfont.woff2",
  "/css/fonts/FontAwesome.otf",
  "/css/fonts/TrebuchetMS.woff",
  "/css/fonts/TrebuchetMS.woff2",
  "/data/songs.json",
  "/data/notenspur.geojson",
  "/data/notenweg.geojson",
  "/data/Notenbogen_Karte.pdf",
  "/data/Notenrad_Karte.pdf",
  "/data/Notenspur_Karte.pdf",
  "/data/Notenweg_Karte.pdf",
  "/img/icons/icon_li.png",
  "/img/icons/icon_re.png",
  "/img/icons/left-arrow.png",
  "/img/icons/loop.png",
  "/img/icons/no-volume.jpg",
  "/img/icons/pause.jpg",
  "/img/icons/play.jpg",
  "/img/icons/repeat-pl.jpg",
  "/img/icons/right-arrow.png",
  "/img/icons/skip-to-next.jpg",
  "/img/icons/skip-to-startagain.jpg",
  "/img/icons/speed-o-meter.jpg",
  "/img/icons/volume.jpg",
  "/img/label_back-to-jukebox.jpg",
  "/img/label_chanson.jpg",
  "/img/label_filmmusik.jpg",
  "/img/label_instrumental.jpg",
  "/img/label_lpz-noten.jpg",
  "/img/label_metal.jpg",
  "/img/label_musik-mix.jpg",
  "/img/label_notenspur.jpg",
  "/img/label_party-hits.jpg",
  "/img/label_pl-download.jpg",
  "/img/label_pl-new.jpg",
  "/img/label_pl-play.jpg",
  "/img/label_pl-upload.jpg",
  "/img/label_pop.jpg",
  "/img/label_rock.jpg",
  "/img/label_swing.jpg",
  "/img/label_techno.jpg",
  "/img/label_weltmusik.jpg",
  "/img/label-acapella.jpg",
  "/leaflet/images/layers.png",
  "/leaflet/images/layers-2x.png",
  "/leaflet/images/marker-icon.png",
  "/leaflet/images/marker-icon-2x.png",
  "/leaflet/images/marker-notenspur_1.png",
  "/leaflet/images/marker-notenspur_2.png",
  "/leaflet/images/marker-notenspur_3.png",
  "/leaflet/images/marker-notenspur_4.png",
  "/leaflet/images/marker-notenspur_5.png",
  "/leaflet/images/marker-notenspur_6.png",
  "/leaflet/images/marker-notenspur_7.png",
  "/leaflet/images/marker-notenspur_8.png",
  "/leaflet/images/marker-notenspur_9.png",
  "/leaflet/images/marker-notenspur_10.png",
  "/leaflet/images/marker-notenspur_11.png",
  "/leaflet/images/marker-notenspur_12.png",
  "/leaflet/images/marker-notenspur_13.png",
  "/leaflet/images/marker-notenspur_14.png",
  "/leaflet/images/marker-notenspur_15.png",
  "/leaflet/images/marker-notenspur_16.png",
  "/leaflet/images/marker-notenspur_17.png",
  "/leaflet/images/marker-notenspur_18.png",
  "/leaflet/images/marker-notenspur_19.png",
  "/leaflet/images/marker-notenspur_20.png",
  "/leaflet/images/marker-notenspur_21.png",
  "/leaflet/images/marker-notenspur_22.png",
  "/leaflet/images/marker-notenspur_23.png",
  "/leaflet/images/marker-notenweg_1.png",
  "/leaflet/images/marker-notenweg_2.png",
  "/leaflet/images/marker-notenweg_3.png",
  "/leaflet/images/marker-notenweg_4.png",
  "/leaflet/images/marker-notenweg_5.png",
  "/leaflet/images/marker-notenweg_6.png",
  "/leaflet/images/marker-notenweg_7.png",
  "/leaflet/images/marker-notenweg_8.png",
  "/leaflet/images/marker-notenweg_9.png",
  "/leaflet/images/marker-notenweg_10.png",
  "/leaflet/images/marker-notenweg_11.png",
  "/leaflet/images/marker-notenweg_12.png",
  "/leaflet/images/marker-notenweg_13.png",
  "/leaflet/images/marker-notenweg_14.png",
  "/leaflet/images/marker-notenweg-icon.png",
  "/leaflet/images/marker-notenweg-icon-2x.png",
  "/leaflet/images/marker-shadow.png",
  "/leaflet/leaflet.css",
  "/leaflet/leaflet.min.js",
  "/controlFullScreen/Control.FullScreen.css",
  "/controlFullScreen/Control.FullScreen.js",
  "/controlFullScreen/icon-fullscreen-2x.png",
  "/controlFullScreen/icon-fullscreen.png",
  "/audio/1000-mal-belogen_Andrea-Berg.m4a",
  "/audio/Amsterdam_Komm,-wir-fahren-nach-Amsterdam_Cora.mp3",
  "/audio/A-night-like-this_Caro-Emerald.mp3",
  "/audio/Artpop_Lady-Gaga-und-Elton-John.m4a",
  "/audio/Barbie-Girl_Aqua.mp3",
  "/audio/Barfusz-am-Klavier_AnnenMayKantereit.mp3",
  "/audio/Cant-Stop-Raving_Dune.mp3",
  "/audio/Caramelldansen_Caramell.mp3",
  "/audio/Children-of-the-sun_Dead-can-dance.mp3",
  "/audio/Comme-si-comme-ca_Zaz.mp3",
  "/audio/Das-Boot_Original-Soundtrack_Klaus-Doldinger.mp3",
  "/audio/Die-kluegsten-Maenner-der-Welt_Die-Aerzte.m4a",
  "/audio/Gastgeber_Thomas-Pigor-und-Benedikt-Eichhorn.mp3",
  "/audio/Get-Ready-to-Bounce_Brooklyn-Bounce.mp3",
  "/audio/Herz-an-Herz_Bluemchen.mp3",
  "/audio/I-Dont-Care_feat-Adam-Gontier_Apocalyptica.mp3",
  "/audio/I-Dont-Like-Mondays_The-Boomtown-Rats.m4a",
  "/audio/If-you-want-to-sing-out,-sing-out_Cat-Stevens.mp3",
  "/audio/Jerusalema_Master-KG-ft-Nomcebo.mp3",
  "/audio/Küssen-verboten_Die-Prinzen.mp3",
  "/audio/Lazarus_Porcupine-Tree.m4a",
  "/audio/Linger_The-Cranberries.m4a",
  "/audio/Mr.-Vain_Culture-Beat.mp3",
  "/audio/Musikbeispiel_Altes-Konservatorium.mp3",
  "/audio/Musikbeispiel_Hammerorgel-im-Musikinstrumentenmuseum.mp3",
  "/audio/Musikbeispiel_Musikbibliothek-Peters.mp3",
  "/audio/Mystery_Paul-Biese-and-his-Novelty-Orchestra.mp3",
  "/audio/Oh-by-jingo_Albert-von-Tilzer.mp3",
  "/audio/Okapiposter_Funny-van-Dannen.mp3",
  "/audio/Once-upon-a-time-in-the-West_Ennio-Morricone.mp3",
  "/audio/Oxygène-IV_Jean-Michelle-Jarre.mp3",
  "/audio/Played-A-Live-(Bongo-Song)_SaFri-Duo.mp3",
  "/audio/Rechtsradikaler-Veganer_Basta.mp3",
  "/audio/Rule-the-World_Take-That.mp3",
  "/audio/Seemann_feat-Nina-Hagen_Apocalyptica.mp3",
  "/audio/Sex-On-Fire_Kings-Of-Leon.mp3",
  "/audio/Skandal-im-Speerbezirk_Spider-Murphy-Gang.mp3",
  "/audio/Supermassive-Black-Hole_Muse.m4a",
  "/audio/Taxi-nach-Paris_Felix-de-Luxe.mp3",
  "/audio/Todo-cambia_Mercedes-Sosa.mp3",
  "/audio/Toxicity_System-of-a-Down.mp3",
  "/audio/Two-Little-Wooden-Shoes-Fox-Trot_Club-Royal-Orchestra.mp3",
  "/audio/Verlieben-verloren-vergessen-verzeihn_Wolfgang-Petry.mp3",
  "/audio/Veronika,-der-Lenz-ist-da_Comedian-Harmonists.mp3",
  "/audio/Viva-la-vida_David-Garrett.mp3",
  "/audio/Your-Song_Lady-Gaga.m4a",
  "/audio/Zugroulette_Duo-Sonnenschirm.mp3",
  "/audio/Notenweg/klanglogo_a-capella.mp3",
  "/audio/Notenweg/klanglogo_blaeser.mp3",
  "/audio/Notenweg/klanglogo_blaesersatz.mp3",
  "/audio/Notenweg/klanglogo_chor.mp3",
  "/audio/Notenweg/klanglogo_klavier.mp3",
  "/audio/Notenweg/klanglogo_orchester.mp3",
  "/audio/Notenweg/klanglogo_streicher.mp3",
  "/audio/Notenweg/klanglogo_streicherquartett.mp3",
];

// // Plan A: Lösung Klaus Domass
// self.addEventListener("install", function (e) {
//   console.log("[ServiceWorker] Installed");
//   // e.waitUntil Delays the event until the Promise is resolved
//   e.waitUntil(
//     // Open the cache
//     caches.open(cacheName).then(function (cache) {
//       // Add all the default files to the cache
//       console.log("[ServiceWorker] Caching cacheFiles");
//       return cache.addAll(cacheFiles);
//     })
//   ); // end e.waitUntil
// });
// Plan B: Stackoverflow
self.addEventListener("install", (event) => {
  console.log("Service Worker: installed!");

  event.waitUntil(
    console.log("Service Worker: caching...")(async () => {
      try {
        let cache_obj = await caches.open(cache);
        cache_obj.addAll(cacheFiles);
        cache = cache_obj;
      } catch {
        console.log("Service Worker: error occured while caching...");
      }
      return cache;
    })()
  );
});

//
self.addEventListener("activate", function (e) {
  console.log("[ServiceWorker] Activated");

  e.waitUntil(
    // Get all the cache keys (cacheName)
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (thisCacheName) {
          // If a cached item is saved under a previous cacheName
          if (thisCacheName !== cacheName) {
            // Delete that cached file
            console.log(
              "[ServiceWorker] Removing Cached Files from Cache - ",
              thisCacheName
            );
            return caches.delete(thisCacheName);
          }
        })
      );
    })
  ); // end e.waitUntil
});

self.addEventListener("fetch", function (e) {
  console.log("[ServiceWorker] Fetch", e.request.url);

  // e.respondWidth Responds to the fetch event
  e.respondWith(
    // Check in cache for the request being made
    caches
      .match(e.request)

      .then(function (response) {
        // If the request is in the cache
        if (response) {
          console.log(
            "[ServiceWorker] Found in Cache",
            e.request.url,
            response
          );
          // Return the cached version
          return response;
        }

        // If the request is NOT in the cache, fetch and cache

        var requestClone = e.request.clone();
        return fetch(requestClone)
          .then(function (response) {
            if (!response) {
              console.log("[ServiceWorker] No response from fetch ");
              return response;
            }

            var responseClone = response.clone();

            //  Open the cache
            caches.open(cacheName).then(function (cache) {
              // Put the fetched response in the cache
              cache.put(e.request, responseClone);
              console.log("[ServiceWorker] New Data Cached", e.request.url);

              // Return the response
              return response;
            }); // end caches.open
          })
          .catch(function (err) {
            console.log(
              "[ServiceWorker] Error Fetching & Caching New Data",
              err
            );
          });
      }) // end caches.match(e.request)
  ); // end e.respondWith
});
