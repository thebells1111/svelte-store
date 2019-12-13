<script>
  export let text;
  let hour = 6;
  let minute = '00';
  let am = true;

  let width;
  $: fontCalc = (width / 100) * 4;
  let maxFontSize = 30;
  $: fontSize = `${fontCalc < maxFontSize ? fontCalc : maxFontSize}px`;
  $: inputCalc = (width / 100) * 7.2;
  let maxInputWidth = 54;
  $: inputWidth = `${inputCalc < maxInputWidth ? inputCalc : maxInputWidth}px`;

  function changeHour(e) {
    let h = e.target.value.toString();
    if (h.match(/[^0-9]/g)) {
      //allows only digits as input
      hour = h.match(/[0-9]/g).join('');
    } else if (hour > 12) {
        hour = h.split('').pop();      
    } 
      hour = parseInt(hour)
  }

  function changeMinute(e) {
    let m = e.target.value.toString();

    if (m.match(/[^0-9]/g)) {
      //allows only digits as input
      minute = m.match(/[0-9]/g).join('');
    } else if (Number(m) > 59) {
      //won't allow input to be greater than 59
      minute = m.split('').pop();
    } 
    
    minute = parseInt(minute)  
    minute = minute < 10 ? '0' + minute : minute;
  }

  function setTime(el, evt) {
    let newHour = hour;

    if (am && newHour === 12) {
      newHour = 0;
    }

    let newTime = newHour * 3600000 + minute * 60000 + !am * 12 * 3600000;

    console.log(newTime);
  }

 function mouseScrollHour(e) {
    if (e.deltaY > 0) {
      hour--
      if(hour < 1) {
        hour = 12;
      }
    }
    if (e.deltaY < 0){
      hour++
      if(hour > 12) {
        hour = 1;
      }
    }
  }

  function mouseScrollMinute(e) {
    if (e.deltaY > 0) {
      minute--
      if(minute < 1) {
        minute = 59;
      }
    }
    if (e.deltaY < 0){
      minute++
      if(minute > 59) {
        minute = 0;
      }
    }

    minute = minute < 10 ? '0' + minute : minute;
  }
</script>

<style>
  div {
    margin-top: 10px;
    display: block;
    font-size: var(--container-font-size);
    cursor: arrow;
    user-select: none;
  }
  input{
    background: white;
    width: var(--container-input-width);
    max-width: 54px;
    font-size: var(--container-font-size);
    text-align: center;
    margin: 0 0.25em;
    position: relative;
    border-radius: 3px;
    border: none;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.39), 0 1px 1px #fff;
    padding: 4px 0px 0px 0px;
    cursor: pointer;
  }

  button {
    display: inline-block;
    font-size: var(--container-font-size);
    width: var(--container-input-width);
    max-width: 54px;
    text-align: center;
    position: relative;
    bottom: 1px;
    cursor: pointer;
    user-select: none;
    border-radius: 3px;
    margin-left: 1px;
    background: linear-gradient(hsl(200, 50%, 65%), hsl(200, 50%, 45%));
    background: hsla(210, 50%, 45%, 1);
    box-shadow: inset 0px 3px 3px 1px hsla(210, 53%, 55%, 1),
      inset 0px -1px 3px 1px hsla(210, 53%, 45%, 1);
    border: 3px hsla(215, 53%, 15%, 1) solid;
    color: hsla(215, 53%, 15%, 1);
  }

  button.am {
    background: hsla(195, 53%, 79%, 1);
    box-shadow: inset 0px 3px 3px 1px hsla(195, 53%, 89%, 1),
      inset 0px -1px 3px 1px hsla(195, 53%, 69%, 1);
    border: 3px hsla(200, 65%, 37%, 1) solid;
    color: hsla(200, 65%, 37%, 1);
  }
</style>

<svelte:window bind:innerWidth={width} />

<div
  class="container"
  style="--container-font-size: {fontSize}; --container-input-width: {inputWidth};"
>
  {text}
  <input
    bind:value={hour}
    on:input={changeHour}
    on:blur={e => setTime('hour', e)}
    on:keypress={e => (e.key === 'Enter' ? e.target.blur() : undefined)}    
    on:wheel={mouseScrollHour}
  />
  :
  <input
    bind:value={minute}
    on:input={changeMinute}
    on:blur={e => setTime('minute', e)}
    on:keypress={e => (e.key === 'Enter' ? e.target.blur() : undefined)}
    on:wheel={mouseScrollMinute}
  />
  <button class:am on:click={() => {am = !am; setTime()}}>{am ? 'am' : 'pm'}</button>
</div>
