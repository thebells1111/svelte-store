<script>
  import SelectStation from './SelectStation.svelte';
  import SelectIntervalType from './SelectIntervalType.svelte';
  import SelectStartStop from './SelectStartStop.svelte';
  import SelectTimer from './SelectTimer.svelte';
  import IntervalDOWViewer from './IntervalDOWViewer.svelte';
  import SelectProgram from './SelectProgram.svelte';
  import ControlButtons from './ControlButtons.svelte';
  export let isActive = 'false';
</script>

<style>
  :global(#programs > div) {
    margin-top: 10px;
    font-size: 3.6vw;
  }
  :global(#programs > div:first-child) {
    margin-top: 0;
  }

  @media screen and (min-width: 800px) {
    :global(#programs > div) {
      font-size: 29px;
    }
  }

  div {
    display: none;
  }

  .active {
    display: initial;
  }
</style>

<div id="programs" class:active={isActive}>
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
