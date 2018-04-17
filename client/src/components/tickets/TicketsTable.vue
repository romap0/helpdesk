<template>
  <v-data-table
    :headers="headers"
    :items="tickets"
    class="elevation-1"
  >
    <template
      slot="items"
      slot-scope="props">
      <td>{{ props.item.title }}</td>
      <td>{{ props.item.date | moment('DD MMM HH:mm') }}</td>
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
</template>

<script>
export default {
  props: {
    tickets: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      headers: [
        { text: 'Заголовок', value: 'title', sortable: false },
        { text: 'Создан', value: 'date' },
        { text: 'Статус', value: 'status' },
        { text: 'Действия', value: '' }
      ]
    }
  }
}
</script>

<style>
  .stepper__step {
    cursor: pointer;
  }
</style>
