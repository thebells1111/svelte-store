<script>
  import { currentProgram, programIndex, programs } from '../stores.js';
  import NumberInput from './NumberInput.svelte';
  import Button from './Button.svelte';
  export let style = undefined;

  let index = $programIndex;

  $: maxIndex = $programs.length;
  $: indexDisplay = maxIndex > 0 ? index + 1 : 0;

  function selectProgram() {
    console.log('scroll');
    currentProgram.setCurrentProgram({ ...$programs[index] });
  }

  function decProg() {
    index--;
    index = index < 0 ? maxIndex - 1 : index;
    index = index < 0 ? 0 : index;
    $programIndex = index;
    currentProgram.setCurrentProgram({ ...$programs[index] });
  }

  function incProg() {
    index++;
    index = index > maxIndex - 1 ? 0 : index;
    $programIndex = index;
    currentProgram.setCurrentProgram({ ...$programs[index] });
  }
</script>

<style>
  div {
    margin-top: 10px;
    font-size: var(--container-font-size);
  }
</style>

<div {style}>
  <Button name="➤" click={decProg} buttonType={`program-select left`} />
  <NumberInput
    bind:value={indexDisplay}
    max={$programs.length}
    min={$programs.length > 0 ? 1 : 0}
    scrollChange={selectProgram}
  />
  of {$programs.length}
  <Button name="➤" click={incProg} buttonType={`program-select right`} />
</div>
