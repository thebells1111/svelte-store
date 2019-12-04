<script>
 import { state } from "./stores.js";
import Button from "./Button.svelte";

const stationNames = $state.stationNames

$: names = Object.keys(stationNames)

export let selectedStations = [];

function selectStations(e) {
    console.log('clicked')
    console.log(selectedStations)
  }
</script>


<style>
div{
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}
  
label>input[type="checkbox"] {
    
  }
 
label :global(button) {
  color: darkgreen;
  border-color: darkgreen;
}
</style>




<div>
  {#each names as stationName, i}   
      <label key={`station${i + 1}`}>
        <input
          type="checkbox"
          value={stationName}  
          bind:group={selectedStations}        
          on:click={e => selectStations(e)}
        />
        <Button name={stationNames[stationName]} on:click={e => selectStations(e)} />
      </label>
  {/each}
</div>

