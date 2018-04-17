<template>
  <v-flex xs12>
    <v-stepper v-model="currentList">
      <v-stepper-header>
        <v-stepper-step
          step="1"
          @click.native="currentList = 1">Новые</v-stepper-step>
        <v-divider/>
        <v-stepper-step
          step="2"
          @click.native="currentList = 2">Активные</v-stepper-step>
        <v-divider/>
        <v-stepper-step
          step="3"
          @click.native="currentList = 3">Решённые</v-stepper-step>
        <v-divider/>
      </v-stepper-header>
      <v-stepper-items>

        <v-stepper-content step="1">
          <tickets-table
            :tickets="newTickets"/>
        </v-stepper-content>

        <v-stepper-content step="2">
          <tickets-table
            :tickets="activeTickets"/>
        </v-stepper-content>

        <v-stepper-content step="3">
          <tickets-table
            :tickets="resolvedTickets"/>
        </v-stepper-content>

      </v-stepper-items>
    </v-stepper>

    <loader :show="showModal" />
  </v-flex>
</template>

<script>
import axios from 'axios'
import TicketsTable from './TicketsTable'
import Loader from '../Loader'

export default {
  components: {
    'tickets-table': TicketsTable,
    'loader': Loader
  },
  data: () => ({
    currentList: 1,
    tickets: [],
    showModal: false
  }),
  computed: {
    newTickets: function () { return this.tickets.filter(t => t.status === 'Новый') },
    activeTickets: function () { return this.tickets.filter(t => t.status === 'Активный') },
    resolvedTickets: function () { return this.tickets.filter(t => t.status === 'Решённый') }
  },
  async created () {
    this.tickets = (await axios.get('/api/tickets')).data
  }
}
</script>

<style>

</style>
