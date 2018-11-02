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
import axios from "axios";
export default {
  async asyncData({ params }) {
    const { data } = await axios.get(
      "https://api.thedogapi.com/v1/images/search?size=thumb&limit=10"
    );
    return { dogs: data };
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
