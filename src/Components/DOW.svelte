<script>
  import { currentProgram } from '../stores.js';
  import Button from './Button.svelte';
  export let isActive = false;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'All'];
  let selectedDays = $currentProgram.dow;

  function selectDay(e) {
    let day = Number(e.target.dataset.value);
    const dayIndex = selectedDays.indexOf(day);

    if (dayIndex > -1) {
      selectedDays.splice(dayIndex, 1);
      selectedDays = selectedDays; //needed to update component
    } else {
      selectedDays = selectedDays.concat(day).sort();
    }
    currentProgram.setDow(selectedDays);
  }
</script>

<style>
  .container {
    display: none;
    margin-top: 4px;
    justify-content: space-between;
    max-height: 66px;
    height: 8.5vw;
  }

  .active {
    display: flex;
  }
</style>

<div class="container" class:active={isActive === true}>
  {#each days as day, i}
    <Button
      name={day}
      data={i}
      click={selectDay}
      buttonType={'dow'}
      checked={selectedDays.indexOf(i) > -1}
    />
  {/each}
</div>
