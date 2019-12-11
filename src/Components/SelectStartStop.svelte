<script>
  export let text = 'Start program at';
  let hour = 6;
  let twelveHour = hour;
  let pm = true;
  $: {
    twelveHour = hour > 11 ? hour - 12 : hour;
    twelveHour = !twelveHour === 0 ? 12 : twelveHour;
  }

  let minute = 0;

  let width;
  $: fontCalc = (width / 100) * 4;
  let maxFontSize = 30;
  $: fontSize = `${fontCalc < maxFontSize ? fontCalc : maxFontSize}px`;
  $: inputCalc = (width / 100) * 7.2;
  let maxInputWidth = 54;
  $: inputWidth = `${inputCalc < maxInputWidth ? inputCalc : maxInputWidth}px`;

  function changeHour(e) {
    const hour = e.target.value.replace(/^\s+|\s+$/gm, ''); //regex for trim
    let newHour = hour;
    if (hour < 1 || !Number(hour)) {
      newHour = '';
    } else if (hour > 12) {
      if (hour.split('').pop() > 0) {
        newHour = hour.split('').pop();
      } else {
        newHour = '';
      }
    }
    setHour(newHour);
  }

  function changeMinute(e) {
    const minute = e.target.value.replace(/^\s+|\s+$/gm, '');
    //regex for trim
    let newMinute = minute;
    if (!(Number(minute) > -1) || minute === '') {
      newMinute = '';
    } else if (Number(minute) > 59) {
      newMinute = minute.split('').pop();
    } else if (minute.length > 2) {
      newMinute = minute.split('').pop();
    }

    setMinute(newMinute);
  }

  function setTime(el, evt) {
    let newTime;
    if (evt) {
      newTime = Number(evt.target.value);
    }

    let newHour = hour;
    let newMinute = minute;
    let newPM = pm;

    if (el === 'hour') {
      newHour = newTime;
    } else if (el === 'minute') {
      newMinute = newTime;
    } else if (el === 'pm') {
      newPM = !pm;
    }

    if (!hour) {
      if (controller === 'start') {
        newHour = 6;
        newPM = 0;
      } else if (controller === 'stop') {
        newHour = 6;
        newPM = 1;
      }
    }

    if (!newPM && newHour === 12) {
      newHour = 0;
    }

    setHour(toTwelveHour(newHour));
    setMinute(leadingZero(newMinute));

    let newDailyTime = {};
    newDailyTime[timeSelector] =
      newHour * 3600000 + newMinute * 60000 + newPM * 12 * 3600000;

    updateCurrentProgram(newDailyTime);
  }

  function leadingZero(time) {
    return typeof time !== 'string' && time < 10 ? '0' + time : time;
  }

  function toTwelveHour() {}

  /*

  & input[type="number"] {
    background: white;
    width: ${props => (props.width / 100) * 7.2}px;
    max-width: 54px;
    font-size: ${props => (props.width / 100) * 4}px;
    text-align: center;
    margin: 0 0.25em;
    position: relative;
    border-radius: 3px;
    border: none;    
    box-shadow: inset 0 1px 2px rgba(0,0,0,.39), 0 1px 1px #FFF;
    padding: 4px 0px 0px 0px
    cursor: pointer;
  }    

  & input[type="radio"] {
    position:fixed;
    opacity:0;
      } 

  & span {
    display: inline-block;
    font-size: ${props => (props.width / 100) * 4}px;
    width: ${props => (props.width / 100) * 7.2}px;
    max-width: 54px;
    text-align: center;
    position:relative;
    bottom: 1px;
    cursor: pointer;
    user-select: none;    		 
    border-radius: 3px;   
    margin-left: ${props => (props.width / 100) * 1}px;
    background: linear-gradient(hsl(200, 50%, 65%), hsl(200, 50%, 45%));    
    box-shadow: inset 0px 3px 3px 1px hsla(195, 53%, 89%, 1),
        inset 0px -1px 3px 1px hsla(195, 53%, 69%, 1);
    background: hsla(195, 53%, 79%, 1);
    border: 3px hsla(200, 65%, 37%, 1) solid;
    color: hsla(200, 65%, 37%, 1);

    ${props =>
      props.pm &&
      css`
        background: hsla(210, 50%, 45%, 1);
        box-shadow: inset 0px 3px 3px 1px hsla(210, 53%, 55%, 1),
          inset 0px -1px 3px 1px hsla(210, 53%, 35%, 1);
        border: 3px hsla(215, 53%, 25%, 1) solid;
        color: hsla(215, 53%, 25%, 1);
      `};
  }

  & span:hover {
    background: hsla(210, 50%, 45%, 1);
        box-shadow: inset 0px 3px 3px 1px hsla(210, 53%, 55%, 1),
        inset 0px -1px 3px 1px hsla(210, 53%, 35%, 1);
        border: 3px hsla(200, 65%, 37%, 1) solid;
        color: hsla(195, 53%, 79%, 1);

        ${props =>
          props.pm &&
          css`
            box-shadow: inset 0px 3px 3px 1px hsla(195, 53%, 89%, 1),
              inset 0px -1px 3px 1px hsla(195, 53%, 69%, 1);
            background: hsla(195, 53%, 79%, 1);
            border: 3px hsla(215, 53%, 25%, 1) solid;
            color: hsla(215, 53%, 25%, 1);
          `};
    }

    & span:active {    
    border: 3px hsla(215, 53%, 25%, 1) double;
    color: hsla(215, 53%, 25%, 1);

    ${props =>
      props.pm &&
      css`
        border: 3px hsla(215, 53%, 25%, 1) double;
      `};
    }
`;
*/
</script>

<style>
  div {
    margin-top: 10px;
    display: block;
    font-size: var(--container-font-size);
    cursor: arrow;
    user-select: none;
  }

  input[type='number']::-webkit-outer-spin-button,
  input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }

  input[type='number'] {
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
</style>

<svelte:window bind:innerWidth={width} />

<div
  class="container"
  style="--container-font-size: {fontSize}; --container-input-width: {inputWidth};"
>
  {text}
  <input
    type="number"
    bind:value={toTwelveHour}
    on:change={changeHour}
    on:blur={e => setTime('hour', e)}
    on:keypress={e => (e.key === 'Enter' ? e.target.blur() : undefined)}
  />
  :
  <input
    type="number"
    value={minute}
    on:change={changeMinute}
    on:blur={e => setTime('minute', e)}
    on:keypress={e => (e.key === 'Enter' ? e.target.blur() : undefined)}
  />
  <label>
    <input
      type="radio"
      name="meridian-type"
      value="0"
      checked={!pm}
      on:change={e => setTime('pm', e)}
    />
  </label>
  <label>
    <input
      type="radio"
      name="meridian-type"
      value="1"
      checked={pm}
      on:change={e => setTime('pm', e)}
    />
  </label>
  <span on:click={() => setTime('pm')}>{pm ? 'pm' : 'am'}</span>
</div>
