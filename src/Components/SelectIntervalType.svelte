<script>
  import { currentProgram } from '../stores.js';
  import Button from './Button.svelte';
  import Interval from './Interval.svelte';

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

  function selectType(e) {
    currentProgram.selectType(e.target.dataset.value);
  }
</script>

<style>
  div {
    margin-top: 2px;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
</style>

<div>
  {#each buttonObj as b}
    <Button
      name={b.name}
      data={b.data}
      click={selectType}
      buttonType={'interval-type'}
      checked={type === b.data}
    />
  {/each}
  {#if type === 'interval'}
    <Interval />
  {/if}
  {#if type === 'dow'}DOW{/if}
</div>
