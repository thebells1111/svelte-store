<script>
  import { dow } from '../stores.js';
  import Button from './Button.svelte';
  export let isActive = false;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'All'];

  function selectDay(day) {
    const dayIndex = $dow.indexOf(day);

    if (dayIndex > -1) {
      $dow.splice(dayIndex, 1);
    } else {
      $dow.push(day);
      $dow.sort();
    }
    $dow = $dow;
  }
</script>

<style>
  div {
    display: none;
    margin: 0 .1em;
  }

  .active {
    display: flex;    
    justify-content: space-between;
  }
</style>

<div class:active={isActive === true}>
  {#each days as day, i}
    <Button
      name={day}
      click={() => selectDay(i)}
      buttonType={'dow'}
      checked={$dow.indexOf(i) > -1}
    />
  {/each}
</div>
