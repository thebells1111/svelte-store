<script>
  import { state } from "./stores.js";
  import SelectStation from "./SelectStation.svelte";
  import SelectIntervalType from "./SelectIntervalType.svelte";

  let names = $state.stationNames
</script>

<style>
</style>

<SelectStation selectedStations={$state.selectedStations}/>
<SelectIntervalType  />