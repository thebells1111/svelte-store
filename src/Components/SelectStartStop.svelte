<script>
  import { currentProgram } from '../stores.js';
  import NumberInput from './NumberInput.svelte';
  import Button from './Button.svelte';
  export let text = '';
  export let style = undefined;
  export let type = undefined;
  $: cp = $currentProgram[type];
  let noon = 43200000;
  $: hour =
    cp < noon ? Math.floor(cp / 3600000) : Math.floor(cp / 3600000) - 12;
  $: {
    hour = hour ? hour : 12; //makes time 12 if time is midnight
  }
  $: minute = Math.floor(((cp % 3600000) / 3600000) * 60);
  $: meridian = cp < noon ? 'am' : 'pm';

  $: {
    minute = minute < 10 ? '0' + minute : minute;
  }

  function setTime() {
    let m = meridian === 'pm'; //used to add 12hrs for pm times
    hour = hour ? hour : 6; //sets hour to 6 if hour is 0 or blank;

    let newTime =
      (hour === 12 ? 0 : hour) * 3600000 + minute * 60000 + m * 12 * 3600000;
    //subtracts 12 hrs if midnight or noon, adds all times together.

    currentProgram[`set${type[0].toUpperCase() + type.slice(1)}`](newTime);
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
  <NumberInput
    bind:value={hour}
    max="12"
    min="1"
    blur={setTime}
    scrollChange={setTime}
  />
  :
  <NumberInput
    bind:value={minute}
    max="59"
    min="0"
    blur={setTime}
    scrollChange={setTime}
  />
  <Button
    name={meridian}
    click={handleMeridian}
    buttonType={`meridian ${meridian}`}
  />
</div>
