<template>
  <v-container
    grid-list-lg
    v-if="ticket">
    <v-layout
      wrap>

      <!-- Title -->
      <v-flex xs12>
        <h3>{{ ticket.title }}</h3>
      </v-flex>

      <!-- Info -->
      <v-flex xs4>
        <v-card>
          <v-list>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-sub-title>
                  Компания
                </v-list-tile-sub-title>
                <v-list-tile-title>
                  {{ ticket.companyName }}
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-sub-title>
                  Сотрудник
                </v-list-tile-sub-title>
                <v-list-tile-title>
                  {{ ticket.userName }}
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-flex>

      <!-- Comments -->
      <v-flex xs4>
        <v-card>
          <v-card-title>
            <h3>Комментарии</h3>
          </v-card-title>

          <v-card
            class="elevation-0"
            v-for="(comment, index) in ticket.comments"
            :key="index">
            <v-card-text>
              <p class="grey--text">{{ comment.date | moment('DD MMM HH:mm') }} <b>{{ comment.userName }}</b></p>
              {{ comment.text }}
            </v-card-text>
          </v-card>

          <!-- Response form -->
          <v-flex
            xs11
            offset-xs1>
            <v-layout
              align-center>
              <v-text-field
                multi-line
                auto-grow
                label="Ответ"
                v-model="newComment"
                rows="1"
              />
              <v-btn
                flat
                icon
                class="shrink">
                <v-icon>send</v-icon>
              </v-btn>
            </v-layout>
          </v-flex>

        </v-card>
      </v-flex>

      <!-- Messages -->
      <v-flex xs4>
        <v-card>
          <v-card-title>
            <h3>Сообщения</h3>
          </v-card-title>
          <v-card
            class="elevation-0"
            v-for="(message, index) in ticket.messages"
            :key="index">
            <v-card-text>
              <p class="grey--text">{{ message.date | moment('from') }} <b>{{ message.userName }}</b></p>
              {{ message.text }}
            </v-card-text>
          </v-card>

          <!-- Response form -->
          <v-flex
            xs11
            offset-xs1>
            <v-layout
              align-center>
              <v-text-field
                multi-line
                auto-grow
                label="Ответ"
                v-model="newMessage"
                rows="1"
              />
              <v-btn
                flat
                icon
                class="shrink">
                <v-icon>send</v-icon>
              </v-btn>
            </v-layout>
          </v-flex>

        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import moment from 'moment'
import axios from 'axios'

export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data: () => ({
    ticket: {
      _id: '154df56fg4df56g4',
      title: 'Не работает принтер',
      companyName: 'МедТехРейс',
      userName: 'Елена',
      status: 'Новая',
      comments: [
        {
          userName: 'Роман',
          date: moment(),
          text: `Vestibulum dis cras dolorum odit odit hymenaeos
          sunt mollitia proin iste omnis officiis ducimus.
          Magni parturient, cubilia qui earum nostrud!
          Quibusdam commodo? Officiis eaque perferendis.`
        },
        {
          userName: 'Роман',
          date: moment(),
          text: `Vestibulum dis cras dolorum odit odit hymenaeos
          sunt mollitia proin iste omnis officiis ducimus.
          Magni parturient, cubilia qui earum nostrud!
          Quibusdam commodo? Officiis eaque perferendis.
          `
        }
      ],
      messages: [
        {
          userName: 'Роман',
          date: moment(),
          text: `Magni parturient, cubilia qui earum nostrud!
          Quibusdam commodo? Officiis eaque perferendis.`
        },
        {
          userName: 'Елена',
          date: moment(),
          text: `Vestibulum dis cras dolorum odit odit hymenaeos
          sunt mollitia proin iste omnis officiis ducimus.
          `
        }
      ]
    },
    newComment: '',
    newMessage: ''
  }),
  async created () {
    this.ticket = (await axios.get('/api/tickets/' + this.id)).data
  }
}
</script>

<style>

</style>
