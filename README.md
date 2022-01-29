# GeoPharm224

Geolocation App of Pharmacies in Conakry
(An app that allows you to geolocate pharmacies in my city Conakry more precisely)


On the backend side, I used the python web framework **[FastAPI](https://fastapi.tiangolo.com)** (the best python web framework for me currently, due to its performance which is no longer to be proven, as well as its [features](https://fastapi.tiangolo.com/features/): [async](https://fastapi.tiangolo.com/async/), [pydantic](https://fastapi.tiangolo.com/features/#validation), [auto-generated swagger documentation](https://fastapi.tiangolo.com/features/#automatic-docs), etc. ) to naturally create an API, with **[MongoDB](https://www.mongodb.com/atlas/database)** as the database, in particular for [the ease offered by MongoDB to manipulate geolocation data.](https://docs.mongodb.com/manual/geospatial-queries/)

On the front-end side, I used the marvelously wonderful [**Quasar framework**](https://quasar.dev) (which notably allowed me in 2-3 strokes of the magic wand to implement a responsive and mobile-friendly web interface worthy of the name).
And still on the front-end side, for the map, I opted for **[Mapbox](https://www.mapbox.com)**, a wonderful alternative to GoogleMaps.

For the production launch, I deployed in 4-5 command lines each, the back on the [**DETA**](https://www.deta.sh) platform and the front, on [Firebase Hosting](https://firebase.google.com/products/hosting).
