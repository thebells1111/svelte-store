<script>
  import SelectStation from './Components/SelectStation.svelte';
  import SelectIntervalType from './Components/SelectIntervalType.svelte';
  import SelectStart from './Components/SelectStartStop.svelte';
  import SelectStop from './Components/SelectStartStop.svelte';
</script>

<style>
  #app {
    min-width: 310px;
    max-width: 750px;
    height: 100vh;
    margin: auto;
    margin-top: 0;
    padding: 3px;
    background: linear-gradient(
      to bottom,
      rgba(242, 245, 246, 1) 0%,
      rgba(227, 234, 237, 1) 37%,
      rgb(144, 207, 228) 100%
    );
  }
</style>

<div id="app">
  <SelectStation />
  <SelectIntervalType />
  <SelectStart text="Start program at" />
  <SelectStop text="Stop program at" />
</div>
