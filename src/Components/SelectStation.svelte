<script>
  import { stationNames, selectedStations } from '../stores.js';
  import Button from './Button.svelte';

  function selectStation(station) {
    const stationIndex = $selectedStations.indexOf(station);
    if (~stationIndex) {
      $selectedStations.splice(stationIndex, 1);
    } else {
      $selectedStations.push(station);
      $selectedStations.sort();
    }
    $selectedStations = $selectedStations;
  }
</script>

<style>
  div {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    margin-top: 0;
  }
</style>

<div>
  {#each $stationNames as stationName, i}
    <Button
      name={stationName}
      click={() => selectStation(`s${i + 1}`)}
      buttonType={'stations'}
      checked={$selectedStations.indexOf(`s${i + 1}`) > -1}
    />
  {/each}
</div>
