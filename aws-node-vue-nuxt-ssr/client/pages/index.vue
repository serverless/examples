<template>
  <div>
    <h1>This is the Front Page.</h1>
    <h3>Random dog of the day:</h3>
    <img :src="dog.url" alt="">
  </div>
</template>

<script>
export default {
  async asyncData({ params, $http }) {
    const dogs = await $http.$get("https://api.thedogapi.com/v1/images/search?limit=1");
    return { dog: dogs[0] };
  }
};
</script>
