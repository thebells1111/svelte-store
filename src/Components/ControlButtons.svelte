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
  import { onMount } from 'svelte';
  import Button from './Button.svelte';

  let _programs = $programs;

  function currentProgram() {
    let cp = {
      selectedStations: [...$selectedStations],
      dailyStart: $dailyStart,
      dailyStop: $dailyStop,
      dateStart: $dateStart,
      dateInterval: $dateInterval,
      timerDuration: $timerDuration,
      timerInterval: $timerInterval,
      type: $type,
      dow: [...$dow],
    };

    cp.timerOn = cp.dailyStart;
    cp.timerOff = cp.dailyStart + cp.timerDuration;

    return cp;
  }

  function handleAdd() {
    $programs.push(currentProgram());
    $programIndex = $programs.length - 1;
    postPrograms($programs);
  }

  function handleModify() {
    $programs[$programIndex] = currentProgram();
    console.log($programs[$programIndex].dateStart);
    postPrograms($programs);
  }

  function handleDelete() {
    $programs.splice($programIndex, 1);
    if ($programIndex < _programs.length - 1) {
    } else {
      $programIndex--;
    }
    postPrograms($programs);
  }

  function postPrograms(p) {
    window.localStorage.setItem('programs', JSON.stringify(p));
  }

  onMount(() => {
    $programs =
      JSON.parse(window.localStorage.getItem('programs')) || $programs;

    $selectedStations = [...$programs[$programIndex].selectedStations];
    $dailyStart = $programs[$programIndex].dailyStart;
    $dailyStop = $programs[$programIndex].dailyStop;
    $dateStart = $programs[$programIndex].dateStart;
    $dateInterval = $programs[$programIndex].dateInterval;
    $timerDuration = $programs[$programIndex].timerDuration;
    $timerInterval = $programs[$programIndex].timerInterval;
    $type = $programs[$programIndex].type;
    $dow = [...$programs[$programIndex].dow];
  });
</script>

<style>
  div {
    margin-top: 10px;
  }
</style>

<div>
  <Button name="ADD" click={handleAdd} buttonType={`controls add`} />
  <Button name="MODIFY" click={handleModify} buttonType={`controls modify`} />
  <Button name="DELETE" click={handleDelete} buttonType={`controls delete`} />
</div>
