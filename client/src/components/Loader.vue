<template>
  <v-dialog
    persistent
    v-model="show"
    max-width="500px">
    <v-card>
      <v-card-title>
        <span>{{ text }}</span>
      </v-card-title>
      <div class="center">
        <v-progress-circular
          indeterminate
          :size="70"
          :width="7"
          color="primary"/>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true
    },
    text: {
      type: String,
      required: false,
      default: 'Загрузка'
    }
  }
}
</script>

<style>

</style>
