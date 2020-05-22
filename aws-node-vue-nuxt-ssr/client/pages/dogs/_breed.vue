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
export default {
  async asyncData({ store, $http, route }) {
    const dogs = await $http.$get("images/search?size=thumb&has_breeds=true&limit=50");

    const reg = new RegExp(route.params.breed, "g");
    const filteredDogs = dogs.filter(dog =>
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
