<script>
  import { currentProgram, programIndex, programs } from '../stores.js';
  import { onMount } from 'svelte';
  import Button from './Button.svelte';

  let _programs = $programs;

  function handleAdd() {
    _programs.push({ ...$currentProgram });
    $programIndex = _programs.length - 1;
    programs.setPrograms(_programs);
    postPrograms(_programs);
  }

  function handleModify() {
    let cp = { ...$currentProgram };
    cp.timerOn = cp.dailyStart;
    cp.timerOff = cp.dailyStart + cp.timerDuration;
    _programs[$programIndex] = cp;
    programs.setPrograms(_programs);
    postPrograms(_programs);
  }

  function handleDelete() {
    _programs.splice($programIndex, 1);
    if ($programIndex < _programs.length - 1) {
    } else {
      $programIndex--;
    }

    currentProgram.setCurrentProgram({ ..._programs[$programIndex] });
    programs.setPrograms(_programs);

    postPrograms(_programs);
  }

  function postPrograms(p) {
    window.localStorage.setItem('programs', JSON.stringify(p));
  }

  onMount(() => {
    _programs = JSON.parse(window.localStorage.getItem('programs'));
    programs.setPrograms(_programs);
    currentProgram.setCurrentProgram({ ..._programs[$programIndex] });
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
