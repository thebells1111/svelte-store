<script>
  import {
    programIndex,
    programs,
    selectedStations,
    dailyStart,
    dailyStop,
    dateStart,
    dateInterval,
    timerDuration,
    timerInterval,
    type,
    dow,
  } from '../stores.js';
  import NumberInput from './NumberInput.svelte';
  import Button from './Button.svelte';

  $: index = $programIndex;

  $: maxIndex = $programs.length;
  $: indexDisplay = maxIndex > 0 ? $programIndex + 1 : 0;

  function selectProgram() {
    $selectedStations = [...$programs[index].selectedStations];
    $dailyStart = $programs[index].dailyStart;
    $dailyStop = $programs[index].dailyStop;
    $dateStart = $programs[index].dateStart;
    $dateInterval = $programs[index].dateInterval;
    $timerDuration = $programs[index].timerDuration;
    $timerInterval = $programs[index].timerInterval;
    $type = $programs[index].type;
    $dow = [...$programs[index].dow];
  }

  function scrollProgram() {
    $programIndex = indexDisplay - 1;
    selectProgram();
  }

  function decProg() {
    index--;
    index = index < 0 ? maxIndex - 1 : index;
    index = index < 0 ? 0 : index;
    $programIndex = index;
    selectProgram();
  }

  function incProg() {
    index++;
    index = index > maxIndex - 1 ? 0 : index;
    $programIndex = index;
    selectProgram();
  }
</script>

<style>
  div {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  span {
    margin: 0 0.25em;
    position: relative;
    bottom: 1px;
  }

  span > span {
    margin: 0;
    position: relative;
    top: 1px;
  }
</style>

<div>
  <Button name="➤" click={decProg} buttonType={`program-select left`} />
  <span>
    <NumberInput
      bind:value={indexDisplay}
      max={$programs.length}
      min={$programs.length > 0 ? 1 : 0}
      scrollChange={scrollProgram}
    />
    <span>of {$programs.length}</span>
  </span>
  <Button name="➤" click={incProg} buttonType={`program-select right`} />
</div>
