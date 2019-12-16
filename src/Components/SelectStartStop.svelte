<script>
  import { currentProgram } from '../stores.js';
  import NumberInput from './NumberInput.svelte';
  import Button from './Button.svelte';
  export let text = '';
  export let style = undefined;
  export let setter = undefined;
  let hour = 6;
  let minute = 0;
  $: {
    minute = minute < 10 ? '0' + minute : minute;
  }
  let meridian = 'am';

  function setTime() {
    let m = meridian === 'pm'; //used to add 12hrs for pm times
    hour = hour ? hour : 6; //sets hour to 6 if hour is 0 or blank;

    let newTime =
      (hour === 12 ? 0 : hour) * 3600000 + minute * 60000 + m * 12 * 3600000;
    //subtracts 12 hrs if midnight or noon, adds all times together.

    currentProgram[setter](newTime);
  }

  function handleMeridian() {
    meridian = meridian === 'am' ? 'pm' : 'am';
    setTime();
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
  <NumberInput bind:value={hour} max="12" min="1" blur={setTime} />
  :
  <NumberInput bind:value={minute} max="59" min="0" blur={setTime} />
  <Button
    name={meridian}
    click={handleMeridian}
    buttonType={`meridian ${meridian}`}
  />
</div>
