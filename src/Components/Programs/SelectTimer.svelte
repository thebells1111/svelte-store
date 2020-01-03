<script>
  import { timerDuration, timerInterval } from '../../stores.js';
  import NumberInput from './NumberInput.svelte';
  export let text = undefined;
  export let type = undefined;
  let time = 0;
  $: {
    if (type === 'timerDuration') {
      time = $timerDuration;
    } else if (type === 'timerInterval') {
      time = $timerInterval;
    }
  }
  $: hour = Math.floor(time / 3600000);
  $: minute = Math.floor(((time % 3600000) / 3600000) * 60);
  $: second = Math.floor((time % 60000) / 1000);

  function setTime() {
    let newTime = hour * 3600000 + minute * 60000 + second * 1000;
    //subtracts 12 hrs if midnight or noon, adds all times together.
    if (type === 'timerDuration') {
      $timerDuration = newTime;
    } else if (type === 'timerInterval') {
      $timerInterval = newTime;
    }
  }
</script>

<style>
  .timerInterval {
    flex-grow: 1;
  }
</style>

<div class={type}>
  {text}
  <NumberInput
    bind:value={hour}
    max="23"
    min="0"
    blur={setTime}
    scrollChange={setTime}
  />
  hour(s)
  <NumberInput
    bind:value={minute}
    max="59"
    min="0"
    blur={setTime}
    scrollChange={setTime}
  />
  min(s)
  <NumberInput
    bind:value={second}
    max="59"
    min="0"
    blur={setTime}
    scrollChange={setTime}
  />
  sec(s)
</div>
