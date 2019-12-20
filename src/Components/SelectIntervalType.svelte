<script>
  import { currentProgram } from '../stores.js';
  import Button from './Button.svelte';
  import Interval from './Interval.svelte';
  import DOW from './DOW.svelte';
  export let style = undefined;

  const buttonObj = [
    {
      name: 'Day of Week',
      data: 'dow',
    },
    {
      name: 'Interval',
      data: 'interval',
    },
  ];

  $: type = $currentProgram.type;

  function setType(e) {
    currentProgram.setType(e.target.dataset.value);
  }
</script>

<style>
  div {
    margin: 2px 0 4px 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
</style>

<div>
  {#each buttonObj as button}
    <Button
      name={button.name}
      data={button.data}
      click={setType}
      buttonType={'interval-type'}
      checked={type === button.data}
    />
  {/each}
</div>
