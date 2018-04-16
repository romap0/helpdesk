<template>
  <v-flex xs12>
    <v-data-table
      :headers="headers"
      :items="items"
      class="elevation-1"
    >
      <template
        slot="items"
        slot-scope="props">
        <td>{{ props.item._id }}</td>
        <td>{{ props.item.title }}</td>
        <td>{{ props.item.companyName }}</td>
        <td>{{ props.item.userName }}</td>
        <td>{{ props.item.status }}</td>
        <td>
          <v-btn
            icon
            class="mx-0"
            :to="'tickets/' + props.item._id">
            <v-icon color="teal">edit</v-icon>
          </v-btn>
        </td>
      </template>
    </v-data-table>

    <loader :show="showModal" />
  </v-flex>
</template>

<script>
import Loader from '../Loader'

export default {
  components: {
    'loader': Loader
  },
  data () {
    return {
      headers: [
        { text: '#', value: '_id' },
        { text: 'Заголовок', value: 'title' },
        { text: 'Компания', value: 'companyName' },
        { text: 'Пользователь', value: 'userName' },
        { text: 'Статус', value: 'status' },
        { text: 'Действия', value: '' }
      ],
      items: [
        {
          _id: '154df56fg4df56g4',
          title: 'Не работает принтер',
          companyName: 'МедТехРейс',
          userName: 'Елена',
          status: 'Новая'
        },
        {
          _id: '154df56fg4df56g4',
          title: 'Не работает принтер',
          companyName: 'МедТехРейс',
          userName: 'Елена',
          status: 'Новая'
        },
        {
          _id: '154df56fg4df56g4',
          title: 'Не работает принтер',
          companyName: 'МедТехРейс',
          userName: 'Елена',
          status: 'Новая'
        }
      ],
      showModal: false
    }
  }
}
</script>

<style>

</style>
