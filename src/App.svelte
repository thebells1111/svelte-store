<script>
  import { state } from "./stores.js";
  import SelectStation from "./SelectStation.svelte";

  let names = $state.stationNames
</script>

<style>
</style>

<SelectStation selectedStations={$state.selectedStations}/>

<button on:click="{state.increment}">+</button>
<button on:click="{state.decrement}">-</button>
<button on:click="{state.reset}">reset</button>

