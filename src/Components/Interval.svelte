<script>
  import { dateInterval, dateStart } from '../stores.js';
  import Datepicker from '../Components/Calendar/Datepicker.svelte';
  import NumberInput from './NumberInput.svelte';

  export let isActive = false;
  export let style = undefined;
  $: interval = Math.floor($dateInterval / 86400000);
  let selectedDate = new Date($dateStart);
  let oldDate = new Date();
  let dateFormat = '#{D} #{M} #{d} #{Y}';

  $: {
    if (selectedDate != new Date($dateStart)) {
      selectedDate = new Date($dateStart);
    }
    $dateStart = new Date(selectedDate.toLocaleDateString()).getTime();
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
    $dateInterval = interval * 86400000;
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
    <NumberInput
      bind:value={interval}
      max="365"
      min="1"
      blur={saveInterval}
      scrollChange={saveInterval}
    />
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
