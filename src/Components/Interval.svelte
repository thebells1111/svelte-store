<script>
  import { currentProgram } from '../stores.js';
  import Datepicker from '../Components/Calendar/Datepicker.svelte';

  export let isActive = false;

  let interval = Math.floor($currentProgram.dateInterval / 86400000);
  let selectedDate = new Date($currentProgram.dateStart);
  let dateFormat = '#{D} #{M} #{d} #{Y}';
  let width;

  $: fontCalc = (width / 100) * 4;
  let maxFontSize = 30;
  $: fontSize = `${fontCalc < maxFontSize ? fontCalc : maxFontSize}px`;
  $: intervalCalc = (width / 100) * 7.2;
  let maxIntervalWidth = 54;
  $: intervalWidth = `${
    intervalCalc < maxIntervalWidth ? intervalCalc : maxIntervalWidth
  }px`;

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
    if (e.deltaY > 0 && e.target.value === '1') {
      interval = 366;
    }
    if (e.deltaY < 0 && e.target.value === '365') {
      interval = 0;
    }
  }
</script>

<style>
  .container {
    display: none;
    margin-top: 10px;
    font-size: 30px;
    max-height: 66px;
    cursor: arrow;
    user-select: none;
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

  input {
    background: white;
    width: var(--interval-width);
    max-width: 54px;
    font-size: var(--interval-font-size);
    text-align: center;
    margin: 0 0.25rem;
    position: relative;
    border-radius: 3px;
    border: none;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.39), 0 1px 1px #fff;
    padding: 4px 0px 0px 0px;
    cursor: pointer;
  }

  input[type='number']::-webkit-outer-spin-button,
  input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }
</style>

<svelte:window bind:innerWidth={width} />

<div
  class="container"
  class:active={isActive === true}
  style="--container-font-size: {fontSize}"
>
  <span>
    Run every
    <input
      type="number"
      bind:value={interval}
      on:input={changeInterval}
      on:blur={saveInterval}
      on:wheel={mouseScroll}
      on:keypress={e => (e.key === 'Enter' ? e.target.blur() : undefined)}
      style="--interval-font-size: {fontSize}; --interval-width: {intervalWidth}"
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
      buttonFontSize={fontSize}
    />
  </span>
</div>
