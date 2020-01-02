<script>
  import SelectStation from './Components/SelectStation.svelte';
  import SelectIntervalType from './Components/SelectIntervalType.svelte';
  import SelectStartStop from './Components/SelectStartStop.svelte';
  import SelectTimer from './Components/SelectTimer.svelte';
  import IntervalDOWViewer from './Components/IntervalDOWViewer.svelte';
  import SelectProgram from './Components/SelectProgram.svelte';
  import ControlButtons from './Components/ControlButtons.svelte';
  import Tabs from './Components/Tabs.svelte';
</script>

<style>
  :global(#app > div) {
    margin-top: 10px;
    font-size: 3.6vw;
  }

  @media screen and (min-width: 800px) {
    :global(#app > div) {
      font-size: 29px;
    }
  }

  #app {
    cursor: arrow;
    user-select: none;
    min-width: 310px;
    max-width: 800px;
    height: 100vh;
    max-height: 625px;
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

  .active {
    visibility: visible;
  }

  .top-bar {
    border-bottom: 1px solid #ddd;
    margin-bottom: 0.25em;
    width: calc(100% - 1em);
  }
  button {
    display: inline-block;
    margin: 0 0 -1px;
    padding: 0.5rem;
    font-weight: 600;
    text-align: center;
    color: #bbb;
    border: 1px solid transparent;
    border-bottom: 1px solid #ddd;
    background: #fff;
    margin-left: 0.25em;
    cursor: pointer;
    border-radius: 4px 4px 0 0;
  }
  button.active {
    color: #000;
    border: 1px solid #ddd;
    border-bottom: 1px solid #fff;
    background: #fff;
  }

  button:hover {
    color: #555;
  }

  button.active:hover {
    color: #000;
  }
</style>

<div id="app">
  <Tabs />
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
