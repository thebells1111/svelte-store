<script>
  import SelectStation from './Components/SelectStation.svelte';
  import SelectIntervalType from './Components/SelectIntervalType.svelte';
  import SelectStartStop from './Components/SelectStartStop.svelte';
  import SelectTimer from './Components/SelectTimer.svelte';
  import IntervalDOWViewer from './Components/IntervalDOWViewer.svelte';
  import SelectProgram from './Components/SelectProgram.svelte';
  import ControlButtons from './Components/ControlButtons.svelte';
</script>

<style>
  :global(body, button) {
    font-size: 3.6vw;
  }

  @media screen and (min-width: 800px) {
    :global(body, button) {
      font-size: 29px;
    }
  }

  :global(div) {
    margin-top: 10px;
  }
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
    display: flex;
    flex-direction: column;
  }
</style>

<div id="app">
  <SelectStation />
  <SelectIntervalType />
  <IntervalDOWViewer />
  <SelectStartStop text="Start program at" type="dailyStart" />
  <SelectStartStop text="Stop program at" type="dailyStop" />
  <SelectTimer text="Run for" type="timerDuration" />
  <SelectTimer text="Every" type="timerInterval" />
  <ControlButtons />
  <SelectProgram />
</div>
