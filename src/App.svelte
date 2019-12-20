<script>
  import SelectStation from './Components/SelectStation.svelte';
  import SelectIntervalType from './Components/SelectIntervalType.svelte';
  import SelectStartStop from './Components/SelectStartStop.svelte';
  import SelectTimer from './Components/SelectTimer.svelte';
  import IntervalDOWViewer from './Components/IntervalDOWViewer.svelte';
  import SelectProgram from './Components/SelectProgram.svelte';
  import ControlButtons from './Components/ControlButtons.svelte';

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
    max-width: 800px;
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
  <IntervalDOWViewer
    style="--container-font-size: {fontSize}; --container-input-width: {inputWidth};"
  />
  <SelectStartStop
    text="Start program at"
    type="dailyStart"
    style="--container-font-size: {fontSize}; --container-input-width: {inputWidth};"
  />
  <SelectStartStop
    text="Stop program at"
    type="dailyStop"
    style="--container-font-size: {fontSize}; --container-input-width: {inputWidth};"
  />
  <SelectTimer
    text="Run for"
    type="timerDuration"
    style="--container-font-size: {fontSize}; --container-input-width: {inputWidth};"
  />
  <SelectTimer
    text="Every"
    type="timerInterval"
    style="--container-font-size: {fontSize}; --container-input-width: {inputWidth};"
  />
  <SelectProgram />
  <ControlButtons />
</div>
