<template>
  <div>
    <h1>This is the Front Page.</h1>
    <h3>Random dog of the day:</h3>
    <img :src="dog.url" alt="">
  </div>
</template>

<script>
import axios from "axios";
export default {
  async asyncData({ params }) {
    const { data } = await axios.get(
      "https://api.thedogapi.com/v1/images/search?limit=1"
    );
    return { dog: data[0] };
  }
};
</script>