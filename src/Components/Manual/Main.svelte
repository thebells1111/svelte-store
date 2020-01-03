<script>
  import { stationNames } from '../../stores.js';
  import Station from './Station.svelte';
  export let isActive = false;
  let stationTimes = [0, 0, 0, 0, 0, 0, 0, 0];
  let timer = setInterval(pingSprinkler, 1000);

  function pingSprinkler() {
    fetch('http://localhost:8000/programs')
      .then(response => {
        return response.json();
      })
      .then(sprinkler => {
        stationTimes = Object.keys(sprinkler.stations).map(
          (v, i) => sprinkler.stations[`s${i + 1}`].duration
        );
      });
  }
</script>

<style>
  div {
    display: none;
  }

  .active {
    display: initial;
  }
</style>

<div class:active={isActive}>
  {#each $stationNames as stationName, i}
    <Station {stationName} stationTime={stationTimes[i]} />
  {/each}
</div>
