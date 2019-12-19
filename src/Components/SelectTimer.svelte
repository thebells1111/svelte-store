<script>
  import { currentProgram } from '../stores.js';
  import NumberInput from './NumberInput.svelte';
  export let style = undefined;
  export let text = undefined;
  export let type = undefined;
  let setter = `set${type[0].toUpperCase() +  type.slice(1)}`;  
  let hour = Math.floor($currentProgram[type]/3600000);
  let minute = Math.floor((($currentProgram[type] % 3600000) / 3600000) * 60);
  let second = Math.floor(($currentProgram[type] % 60000) / 1000)

  function setTime() {
    let newTime = hour * 3600000 + minute * 60000 + second * 1000;
    //subtracts 12 hrs if midnight or noon, adds all times together.

    currentProgram[setter](newTime);
  }
</script>

<style>
  div {
    margin-top: 10px;
    font-size: var(--container-font-size);
  }
</style>

<div {style}>
  {text}
  <NumberInput bind:value={hour} max="23" min="0" blur={setTime} />
  hour(s)
  <NumberInput bind:value={minute} max="59" min="0" blur={setTime} />
  min(s)
  <NumberInput bind:value={second} max="59" min="0" blur={setTime} />
  sec(s)
</div>
