<template>
<div>
  <h2>Dog breed: {{ breed }}</h2>
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
  async asyncData({ store, route }) {
    const { data } = await axios.get(
      "https://api.thedogapi.com/v1/images/search?size=thumb&has_breeds=true&limit=50"
    );

    const reg = new RegExp(route.params.breed, "g");
    const filteredDogs = data.filter(dog => 
      dog.breeds[0]
        .name
        .toLowerCase()
        .match(reg)
    );

    return { dogs: filteredDogs, breed: route.params.breed };
  },
  head() {
    return {
      title: `${this.breed} Dog`,
      meta: [
        {
          hid: "description",
          name: "description",
          content: `You are ${this.breed} hello 👋`
        }
      ]
    };
  }
};
</script>