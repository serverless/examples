<template>
<div>
  <h1>Here you have all dogs.</h1>
  <ul>
    <li v-for="dog in dogs" v-bind:key="dog.id">
      <img :src="dog.url" alt="">
    </li>
  </ul>
</div>
</template>

<script>
export default {
  async asyncData({ params, $http }) {
    const dogs = await $http.$get("images/search?size=thumb&limit=10");
    return { dogs };
  },
  head() {
    return {
      title: "Show all dogs!",
      meta: [
        {
          hid: "description",
          name: "description",
          content: `Hello Dogs 👋`
        }
      ]
    };
  }
};
</script>
