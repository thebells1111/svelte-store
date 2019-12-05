<script>
  import { state } from "./stores.js";
  import Button from "./Button.svelte";

  const stationNames = Object.keys($state.stationNames).map(v=>$state.stationNames[v]);

  let selectedStations = $state.currentProgram.selectedStations;

  function selectStation(e) {
    let station = e.target.dataset.value;
    const stationIndex = selectedStations.indexOf(station);

    if (stationIndex > -1) {
      selectedStations.splice(stationIndex, 1);
      selectedStations = selectedStations
    } else {
      selectedStations.push(station);
      selectedStations.sort();
      selectedStations = selectedStations
    }
    state.selectStation(selectedStations);   
  } 
</script>

<style>
  div {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
</style>

<div>
  {#each stationNames as stationName, i}  
    <Button 
      name={stationName}
      data={`s${i+1}`}
      click={selectStation} 
      buttonType={"stations"}
      checked={selectedStations.indexOf(`s${i+1}`) > -1}
    />
  {/each}
</div>
