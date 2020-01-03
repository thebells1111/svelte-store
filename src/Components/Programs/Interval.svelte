<script>
  import { dateInterval, dateStart } from '../../stores.js';
  import Datepicker from './Calendar/Datepicker.svelte';
  import NumberInput from './NumberInput.svelte';

  export let isActive = false;
  $: interval = Math.floor($dateInterval / 86400000);
  let selectedDate = new Date($dateStart);
  let oldDate = new Date(new Date().toLocaleDateString()).getTime();
  let dateFormat = '#{D} #{M} #{d} #{Y}';

  $: {
    if ($dateStart != oldDate) {
      selectedDate = new Date($dateStart);
      oldDate = $dateStart;
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

  function mouseScroll(e) {
    if (e.deltaY < 0) {
      selectedDate.setDate(selectedDate.getDate() + 1);
      $dateStart = new Date(selectedDate.toLocaleDateString()).getTime();
    }
    if (e.deltaY > 0) {
      selectedDate.setDate(selectedDate.getDate() - 1);
      let today = new Date();
      if (selectedDate < today) {
        selectedDate = today;
      }
      $dateStart = new Date(selectedDate.toLocaleDateString()).getTime();
    }
  }
</script>

<style>
  div {
    display: none;
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

  span > span {
    font-size: 3vw;
  }

  @media screen and (min-width: 780px) {
    span > span {
      font-size: 23px;
    }
  }
</style>

<div class:active={isActive === true}>
  <span>
    Run every
    <span>
      <NumberInput
        bind:value={interval}
        max="365"
        min="1"
        blur={saveInterval}
        scrollChange={saveInterval}
      />
    </span>
    day(s)
  </span>

  <span>
    starting
    <span on:wheel={mouseScroll}>
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
  </span>
</div>
