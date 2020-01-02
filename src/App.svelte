<script>
  import SelectStation from './Components/SelectStation.svelte';
  import SelectIntervalType from './Components/SelectIntervalType.svelte';
  import SelectStartStop from './Components/SelectStartStop.svelte';
  import SelectTimer from './Components/SelectTimer.svelte';
  import IntervalDOWViewer from './Components/IntervalDOWViewer.svelte';
  import SelectProgram from './Components/SelectProgram.svelte';
  import ControlButtons from './Components/ControlButtons.svelte';
  import Tabs from './Components/Tabs.svelte';
  import Manual from './Components/Manual.svelte';
  import Config from './Components/Config.svelte';
  let activeTab = 'programs';
</script>

<style>
  :global(#app > div > div) {
    margin-top: 10px;
    font-size: 3.6vw;
  }
  :global(#app > div:first-child) {
    margin-top: 0;
  }

  @media screen and (min-width: 800px) {
    :global(#app > div > div) {
      font-size: 29px;
    }
  }

  #app {
    cursor: arrow;
    user-select: none;
    min-width: 310px;
    max-width: 800px;
    height: 100vh;
    max-height: 700px;
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

  .programs {
    display: none;
  }

  .active {
    display: initial;
  }
</style>

<div id="app">
  <Tabs bind:activeTab />
  <div class="programs" class:active={activeTab === 'programs'}>
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
  {#if activeTab === 'manual'}
    <Manual isActive={activeTab === 'manual'} />
  {/if}
  {#if activeTab === 'config'}
    <Config isActive={activeTab === 'config'} />
  {/if}
</div>
