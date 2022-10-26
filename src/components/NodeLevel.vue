<template>
<v-container>
  <span v-for="token in this.source" :key="token.id">{{ token.text }} </span>
  </v-container>
</template>

<script>
export default {
  name: "NodeLevel",
  props: {
    summary: Array,
    source: Array,
  },
};
</script>

<style>
</style>