<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          icon="fas fa-capsules"
          label="GeoPharmacie"
          @click="all"
          flat no-wrap
        />
        <q-space/>

        <q-tabs
          v-model="tab"
          v-if="!$q.screen.xs"
          shrink stretch>
          <q-tab name="all" icon="apps" @click="all" />
          <q-tab name="near" icon="near_me" @click="near_me" />
          <q-tab name="search" icon="search" @click="search" />
          <q-tab
            name="fullscreen"
            :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
            @click="$q.fullscreen.toggle()"
          />
          <q-tab name="info" icon="info" @click="info" />
        </q-tabs>
      </q-toolbar>
    </q-header>


    <q-page-container>
      <q-page>
        <mapbox-map
          id="box"
          :accessToken="mapboxToken"
          :auto-resize="true"
          :center="center"
          :zoom="$q.screen.xs ? 11 : 13"
          :maxBounds="cadre"
          mapStyle="streets-v11" >

          <mapbox-geogeometry-circle
            v-if="tab === 'near' && myPosition"
            :center="[ myPosition?.lng, myPosition?.lat ]"
            :radius="5"
            :edges="45" >
            <mapbox-geogeometry-fill color="#26A69A" :opacity="0.2" />
          </mapbox-geogeometry-circle>

          <mapbox-navigation-control />
          <mapbox-fullscreen-control />

          <mapbox-marker
            v-for="p in places"
            :key="p.nom"
            :lngLat="[ p.loc.coordinates[0], p.loc.coordinates[1] ]"
            @click="popup(p)"
          />

        </mapbox-map>
      </q-page>
    </q-page-container>


    <q-footer bordered v-if="$q.screen.xs">
      <q-tabs v-model="tab" narrow-indicator >
        <q-tab name="all" icon="apps" @click="all" />
        <q-tab name="near" icon="near_me" @click="near_me" />
        <q-tab name="search" icon="search" @click="search" />
        <q-tab
          name="fullscreen"
          :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
          @click="$q.fullscreen.toggle()"
        />
        <q-tab name="info" icon="info" @click="info" />
      </q-tabs>
    </q-footer>

  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { Loading } from "quasar"
import {
  MapboxMap,
  
  MapboxMarker,
  MapboxPopup,

  MapboxNavigationControl,
  MapboxFullscreenControl,
  
  MapboxGeogeometryCircle,
  MapboxGeogeometryFill
} from 'vue-mapbox-ts'


export default defineComponent({
  name: 'MapBoxContainer',
  components: {
    MapboxMap,

    MapboxMarker,
    MapboxPopup,

    MapboxNavigationControl,
    MapboxFullscreenControl,

    MapboxGeogeometryCircle,
    MapboxGeogeometryFill
  },
  data: () => ({
    tab: ref('all'),
    mapboxToken: '',
    places: [],
    cadre: [[-13.961647, 9.343013], [-13.414760, 9.807780]], //southwestern-northeastern
    center: [ -13.6160, 9.6029 ],
    myPosition: null
  }),
  created() {
    this.mapboxToken = process.env.TOKEN
    this.all()
  },
  methods: {
    all() {
      this.$axios.get(`${process.env.API}/all`)
        .then((response) => {
          this.places = response.data
        })
        .catch(error => console.log('oops...erreur'))
    },

    near_me() {
      Loading.show({ message: "Recuperation de la position en cours..." })
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;

          Loading.show({ message: 'Les pharmacies les plus proches dans un rayon de 5km...' })
          
          this.$axios.get(`${process.env.API}/near`, {
            params: { user_lng: longitude, user_lat: latitude }
          })
            .then(response => {
              this.center = [ longitude, latitude ]
              
              this.places = response.data

              if (this.myPlaces.length === 0) {
                this.$q.notify({
                  type: 'info',
                  icon: 'info',
                  position: 'left',
                  message: '🥶 Aucune pharmacie (dans un rayon de 5km) !!!'
                })
              }

              this.myPosition = { lng: longitude, lat: latitude };
              
            })
            .catch(error => console.log('oops...erreur'))
            .finally(() => Loading.hide())
        },
        (error) => {
          this.$q.notify({
            type: 'negative',
            icon: 'warning',
            position: 'left',
            message: 'Autorisez votre geolocalisation SVP !!!'
          })
          this.myPosition = null
          Loading.hide()
        },
        { enableHighAccuracy: true, timeout: 15000 }
      )
    },

    search() {
      this.$q.dialog({
        dark: true,
        title: 'Trouve ta pharmacie',
        message: 'Cherchez par commune/quartier/pharmacie directement :',
        prompt: { model: '',  isValid: val => val.length > 1 },
        cancel: true
      })
        .onOk(data => {
          this.$axios.get(`${process.env.API}/search`, {
            params: { to_search: data }
          })
            .then(response => {
              this.places = response.data
              if (this.places.length === 0) {
                this.$q.notify({
                  type: 'warning',
                  icon: 'warning',
                  position: 'left',
                  message: `Aucune pharmacie correspondante !`
                })
              }
            })
            .catch(error => console.log('oops...erreur'))
        })
    },

    info() {
      this.$q.dialog({
        dark: true,
        html: true,
        title: 'A propos',
        message: `
          <p class="text-bold">Geopharmacie, pour une santé de proximité</p>
          <br>
          <p>Impossible n'est pas, donc faisons.</p>
          <p>C'est dans cet esprit que ce projet a vu le jour, dans le but d'aider le guinéen à acceder plus facilement aux services de santé, notamment pour un debut, les PHARMACIES.</p>
          <br>
          <p>Si vous avez des suggestions, n'hesitez pas à m'ecrire sur : <span class="text-bold">geopharm224@gmail.com</span>.</p>
          <br>
          <p class="text-italic">Copyright, Youssouf @ 2021</p>
        `
      })
    },

    popup(place) {
      this.$q.dialog({
        dark: true,
        html: true,
        title: `<i class="fas fa-map-marked-alt text-secondary"> ${place?.nom}</i>`,
        message: `
          <div class="text-body1">
            <p>Telephone : <span class="text-bold">${place?.phone}</span></p>
            <p>Zone : <span class="text-bold">${place?.zone}</span></p>
          </div>
        `,
        ok: false
      })
    }
  }
})
</script>

<style>
  * {
    box-sizing: border-box;
  }
  html, body {
    margin: 0;
    padding: 0;
  }
  body {
    height: 100vh;
    width: 100vw;
  }
  #box {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
  }
  span > .block {
    font-size: 18px;
  }
</style>
