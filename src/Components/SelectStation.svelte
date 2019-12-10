<script>
  import { currentProgram, stationNames } from '../stores.js';
  import Button from './Button.svelte';

  let selectedStations = $currentProgram.selectedStations;

  function selectStation(e) {
    let station = e.target.dataset.value;
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
      data={`s${i + 1}`}
      click={selectStation}
      buttonType={'stations'}
      checked={selectedStations.indexOf(`s${i + 1}`) > -1}
    />
  {/each}
</div>
