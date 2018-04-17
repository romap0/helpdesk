<template>
  <v-container
    fluid
    grid-list-lg
    fill-height
    v-if="ticket">
    <v-layout
      wrap>

      <!-- Title -->
      <v-flex xs12>
        <v-card>
          <v-card-title>
            <h3>{{ ticket.title }}</h3>
          </v-card-title>
          <v-card-text>
            <v-layout>

              <v-flex xs3>
                <v-select
                  :items="statuses"
                  v-model="ticket.status"
                  label="Статус"
                />
              </v-flex>

              <v-flex xs9>
                <v-select
                  label="Теги"
                  chips
                  tags
                  solo
                  prepend-icon="label"
                  append-icon=""
                  clearable
                  v-model="ticket.tags"
                >
                  <template
                    slot="selection"
                    slot-scope="data">
                    <v-chip
                      close
                      @input="removeTag(data.item)"
                      :selected="data.selected"
                    >
                      <strong>{{ data.item }}</strong>
                    </v-chip>
                  </template>
                </v-select>
              </v-flex>

            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>

      <!-- User -->
      <v-flex xs4>
        <v-card>
          <v-list
            two-line>
            <v-list-tile
              avatar>
              <v-list-tile-avatar>
                <v-icon x-large>account_circle</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ user.first_name }} {{ user.last_name }}</v-list-tile-title>
                <v-list-tile-sub-title>{{ user.phone_number }}</v-list-tile-sub-title>
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

          <div
            class="comments-list"
            ref="commentsList">
            <v-card
              class="elevation-0"
              v-for="(comment, index) in ticket.comments"
              :key="index">
              <v-card-text>
                <p class="grey--text">{{ comment.date | moment('from') }} <b>{{ comment.userName }}</b></p>
                {{ comment.text }}
              </v-card-text>
            </v-card>
          </div>

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
                @keypress.enter.prevent="sendComment()"
              />
              <v-btn
                flat
                icon
                class="shrink"
                @click="sendComment()">
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

          <div
            class="messages-list"
            ref="messagesList">
            <v-card
              class="elevation-0"
              v-for="(message, index) in ticket.messages"
              :key="index">
              <v-card-text>
                <p class="grey--text">{{ message.date | moment('from') }} <b>{{ message.userName }}</b></p>
                {{ message.text }}
              </v-card-text>
            </v-card>
          </div>

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
                @keypress.enter.prevent="sendMessage()"
              />
              <v-btn
                flat
                icon
                class="shrink"
                @click="sendMessage()">
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
import axios from 'axios'
import Vue from 'vue'

export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data: () => ({
    ticket: {},
    user: {},
    newComment: '',
    newMessage: '',
    statuses: [
      'Новый',
      'Активный',
      'Решённый',
      'Закрытый'
    ]
  }),
  async created () {
    this.getTicket()
  },
  watch: {
    'ticket.tags': function (tags) {
      console.log(tags)

      axios.put(`/api/tickets/${this.ticket._id}/tags`, {tags: tags})
    },
    'ticket.status': function (status) {
      console.log(status)

      axios.put(`/api/tickets/${this.ticket._id}/status`, {status: status})
    }
  },
  methods: {
    getTicket: async function () {
      this.ticket = (await axios.get('/api/tickets/' + this.id)).data
      this.getUser()

      Vue.nextTick(() => {
        this.scrolComments()
        this.scrollMessages()
      })
    },
    getUser: async function () {
      this.user = (await axios.get('/api/users/' + this.ticket.userId)).data
    },
    sendComment: async function () {
      await axios.post(`/api/tickets/${this.ticket._id}/comments`, {userId: this.ticket.userId, text: this.newComment})
      this.newComment = ''
      await this.getTicket()
    },
    sendMessage: async function () {
      await axios.post(`/api/tickets/${this.ticket._id}/messages`, {userId: this.ticket.userId, text: this.newMessage})
      this.newMessage = ''
      await this.getTicket()
    },
    scrollMessages: function () {
      let container = this.$refs.messagesList
      container.scrollTop = container.scrollHeight
    },
    scrolComments: function () {
      let container = this.$refs.commentsList
      container.scrollTop = container.scrollHeight
    },
    removeTag (item) {
      this.ticket.tags.splice(this.ticket.tags.indexOf(item), 1)
    }
  }
}
</script>

<style>
  .comments-list{
    max-height: 40vh;
    overflow: auto;
  }

  .messages-list{
    max-height: 40vh;
    overflow: auto;
  }
</style>
