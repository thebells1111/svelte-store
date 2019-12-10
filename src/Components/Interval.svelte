<script>
  import { currentProgram } from '../stores.js';
  import Datepicker from '../Components/Calendar/Datepicker.svelte';

  let interval = Math.floor($currentProgram.dateInterval / 86400000);
  let selectedDate = new Date($currentProgram.dateStart);
  let dateFormat = '#{D} #{M} #{d} #{Y}';

  $: {
	  console.log(selectedDate);
  }

  function oneYearFromNow() {
    let now = new Date();
    let oneYear = new Date(now.setFullYear(now.getFullYear() + 1))
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

    currentProgram.selectDateInterval(interval);
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

<span>
  Run every
  <input
    type="number"
    bind:value={interval}
    on:input={changeInterval}
    on:blur={saveInterval}
    on:wheel={mouseScroll}
    on:keypress={e => (e.key === 'Enter' ? e.target.blur() : undefined)}
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
    highlightColor='hsla(200, 65%, 37%, 1)'
    dayHighlightedBackgroundColor='hsla(200, 65%, 37%, 1)'
    dayHighlightedTextColor='hsla(200, 100%, 98%, 1'
    on:input={e=>console.log(e)}
  />
</span>
