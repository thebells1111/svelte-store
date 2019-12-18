<script>
  import { currentProgram } from '../stores.js';
  import NumberInput from './NumberInput.svelte';
  export let style = undefined;
  let hour = 6;
  let minute = 0;
  let second = 0;
  $: {
    minute = minute < 10 ? '0' + minute : minute;
  }
  $: {
    second = second < 10 ? '0' + second : second;
  }

  function setTime() {
    let newTime = hour * 3600000 + minute * 60000 + second * 1000;
    //subtracts 12 hrs if midnight or noon, adds all times together.

    console.log(newTime);

    //currentProgram[setter](newTime);
  }
</script>

<style>
  div {
    margin-top: 10px;
    font-size: var(--container-font-size);
  }
</style>

<div {style}>
  Run for
  <NumberInput bind:value={hour} max="12" min="1" blur={setTime} />
  hour(s)
  <NumberInput bind:value={minute} max="59" min="0" blur={setTime} />
  min(s)
  <NumberInput bind:value={second} max="59" min="0" blur={setTime} />
  sec(s)
</div>
