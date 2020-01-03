<script>
  import { type } from '../../stores.js';
  import Button from './Button.svelte';
  import Interval from './Interval.svelte';
  import DOW from './DOW.svelte';

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
</script>

<style>
  div {
    margin: 2px 0 0 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
</style>

<div>
  {#each buttonObj as button}
    <Button
      name={button.name}
      data={button.data}
      click={() => ($type = button.data)}
      buttonType={'interval-type'}
      checked={$type === button.data}
    />
  {/each}
</div>
