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
    stationNames,
  } from '../../stores.js';
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

  function updateCurrentProgram() {
    $selectedStations = [...$programs[$programIndex].selectedStations];
    $dailyStart = $programs[$programIndex].dailyStart;
    $dailyStop = $programs[$programIndex].dailyStop;
    $dateStart = $programs[$programIndex].dateStart;
    $dateInterval = $programs[$programIndex].dateInterval;
    $timerDuration = $programs[$programIndex].timerDuration;
    $timerInterval = $programs[$programIndex].timerInterval;
    $type = $programs[$programIndex].type;
    $dow = [...$programs[$programIndex].dow];
    $programs = $programs;
  }

  function handleAdd() {
    $programs.push(currentProgram());
    $programIndex = $programs.length - 1;
    postPrograms($programs);
    updateCurrentProgram();
  }

  function handleModify() {
    $programs[$programIndex] = currentProgram();
    postPrograms($programs);
    updateCurrentProgram();
  }

  function handleDelete() {
    $programs.splice($programIndex, 1);
    console.log($programIndex);
    console.log($programs.length - 1);
    if ($programIndex === $programs.length) {
      $programIndex--;
    }
    postPrograms($programs);
    updateCurrentProgram();
  }

  function postPrograms(p) {
    window.localStorage.setItem('programs', JSON.stringify(p));

    fetch('http://localhost:8000/programs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ programs: p }),
    }).then(response => console.log(response));
  }

  onMount(() => {
    $programs =
      JSON.parse(window.localStorage.getItem('programs')) || $programs;
    updateCurrentProgram();
    fetch('http://localhost:8000/programs')
      .then(response => {
        return response.json();
      })
      .then(sprinkler => {
        $programs = sprinkler.programs;
        $stationNames = Object.keys(sprinkler.stations).map(
          (v, i) => sprinkler.stations[`s${i + 1}`].name
        );
        window.localStorage.setItem(
          'programs',
          JSON.stringify(sprinkler.programs)
        );
        updateCurrentProgram();
      });
  });
</script>

<style>
  div {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
  }
</style>

<div>
  <Button name="ADD" click={handleAdd} buttonType={`controls add`} />
  <Button name="MODIFY" click={handleModify} buttonType={`controls modify`} />
  <Button name="DELETE" click={handleDelete} buttonType={`controls delete`} />
</div>
