<template>
  <v-layout>
    <v-flex xs12>
      <v-list
        two-line
        class="elevation-1">
        <template v-for="(contact, index) in contacts">
          <v-list-tile
            avatar
            :key="index">
            <v-list-tile-avatar>
              <v-icon x-large>account_circle</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{ contact.first_name }} {{ contact.last_name }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ contact.phone_number }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>
    </v-flex>
  </v-layout>
</template>

<script>
import axios from 'axios'

export default {
  data: () => ({
    contacts: []
  }),
  async created () {
    this.contacts = (await axios.get('/api/users')).data
  }
}
</script>

<style>

</style>
