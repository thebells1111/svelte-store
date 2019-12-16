<script>
  import SelectStation from './Components/SelectStation.svelte';
  import SelectIntervalType from './Components/SelectIntervalType.svelte';
  import SelectStart from './Components/SelectStartStop.svelte';
  import SelectStop from './Components/SelectStartStop.svelte';

  let width;
  $: fontCalc = (width / 100) * 4;
  let maxFontSize = 30;
  $: fontSize = `${fontCalc < maxFontSize ? fontCalc : maxFontSize}px`;
  $: inputCalc = (width / 100) * 7.2;
  let maxInputWidth = 54;
  $: inputWidth = `${inputCalc < maxInputWidth ? inputCalc : maxInputWidth}px`;
</script>

<style>
  #app {
    cursor: arrow;
    user-select: none;
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

<svelte:window bind:innerWidth={width} />

<div id="app">
  <SelectStation />
  <SelectIntervalType
    style="--container-font-size: {fontSize}; --container-input-width: {inputWidth};"
  />
  <SelectStart
    text="Start program at"
    setter="setDailyStart"
    style="--container-font-size: {fontSize}; --container-input-width: {inputWidth};"
  />
  <SelectStop
    text="Stop program at"
    setter="setDailyStop"
    style="--container-font-size: {fontSize}; --container-input-width: {inputWidth};"
  />
</div>
