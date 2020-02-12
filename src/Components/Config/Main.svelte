<script>
  import { stationNames } from '../../stores.js';
  export let isActive = false;
</script>

<style>
  div {
    display: none;
  }

  div > div {
    display: block;
  }

  .active {
    display: initial;
  }
</style>

<div class:active={isActive === true}>
  {#each $stationNames as name, i}
    <input bind:value={$stationNames[i]} />
  {/each}
</div>
