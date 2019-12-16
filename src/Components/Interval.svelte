<script>
  import { currentProgram } from '../stores.js';
  import Datepicker from '../Components/Calendar/Datepicker.svelte';
  import NumberInput from './NumberInput.svelte';

  export let isActive = false;
  export let style = undefined;

  let interval = Math.floor($currentProgram.dateInterval / 86400000);
  let selectedDate = new Date($currentProgram.dateStart);
  let dateFormat = '#{D} #{M} #{d} #{Y}';

  $: {
    currentProgram.setDateStart(selectedDate);
  }

  function oneYearFromNow() {
    let now = new Date();
    let oneYear = new Date(now.setFullYear(now.getFullYear() + 1));
    return oneYear;
  }

  function changeInterval(e) {
    let newInterval = interval;

    if (!Number(interval)) {
      newInterval = '';
    } else if (interval > 365) {
      newInterval = Number(
        newInterval
          .toString()
          .split('')
          .pop()
      );
    } else {
      newInterval = interval;
    }

    if (newInterval === 0) {
      newInterval = '';
    }

    interval = newInterval;
  }

  function saveInterval() {
    if (!interval) {
      interval = 1;
    }

    currentProgram.setDateInterval(interval);
  }

  function mouseScroll(e) {
    if (e.deltaY > 0) {
      interval--;
      if (e.target.value === '1') {
        interval = 365;
      }
    }
    if (e.deltaY < 0) {
      interval++;
      if (e.target.value === '365') {
        interval = 1;
      }
    }
  }
</script>

<style>
  .container {
    display: none;
    margin-top: 10px;
    font-size: var(--container-font-size);
  }

  .active {
    display: initial;
  }

  span {
    display: inline-block;
  }
  span:nth-of-type(1) {
    margin-right: 0.25rem;
  }
</style>

<div class="container" class:active={isActive === true} {style}>
  <span>
    Run every
    <NumberInput bind:value={interval} max="365" min="1" blur={saveInterval} />
    day(s)
  </span>

  <span>
    starting
    <Datepicker
      bind:selected={selectedDate}
      format={dateFormat}
      start={new Date()}
      end={oneYearFromNow()}
      highlightColor="hsla(200, 65%, 37%, 1)"
      dayHighlightedBackgroundColor="hsla(200, 65%, 37%, 1)"
      dayHighlightedTextColor="hsla(200, 100%, 98%, 1"
    />
  </span>
</div>
