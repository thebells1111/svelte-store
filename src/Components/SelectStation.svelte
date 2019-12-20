<script>
  import { currentProgram, stationNames } from '../stores.js';
  import Button from './Button.svelte';

  $: selectedStations = $currentProgram.selectedStations;

  function selectStation(station) {
    const stationIndex = selectedStations.indexOf(station);
    if (~stationIndex) {
      selectedStations.splice(stationIndex, 1);
      selectedStations = selectedStations; //needed to update component
    } else {
      selectedStations = selectedStations.concat(station).sort();
    }
    currentProgram.setStations(selectedStations);
  }
</script>

<style>
  div {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
</style>

<div>
  {#each $stationNames as stationName, i}
    <Button
      name={stationName}
      click={() => selectStation(`s${i + 1}`)}
      buttonType={'stations'}
      checked={selectedStations.indexOf(`s${i + 1}`) > -1}
    />
  {/each}
</div>
