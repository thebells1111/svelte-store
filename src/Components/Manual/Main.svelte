<script>
  import { stationNames } from '../../stores.js';
  import Station from './Station.svelte';
  export let isActive = false;
  let stationTimes = [0, 0, 0, 0, 0, 0, 0, 0];
  let manualTimes = [0, 0, 0, 0, 0, 0, 0, 0];
  let timer;
  let sprinkler;

  $: if (isActive) {
    timer = setInterval(pingSprinkler, 1000);
  } else {
    clearInterval(timer);
  }

  function pingSprinkler() {
    fetch('http://localhost:8000/programs')
      .then(response => {
        return response.json();
      })
      .then(data => {
        sprinkler = data;
        stationTimes = Object.keys(sprinkler.stations).map(
          (v, i) => sprinkler.stations[`s${i + 1}`].duration
        );
      });
  }

  function updateManual() {
    let programs = {};
    manualTimes.forEach((v, i) => {
      if (v > stationTimes[i]) {
        programs[`s${i + 1}`] = v;
      } else {
        programs[`s${i + 1}`] = stationTimes[i];
      }
    });
    fetch('http://localhost:8000/manual', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ programs: programs }),
    }).then(response => console.log(response));
  }

  function resetTimes() {
    manualTimes = manualTimes.map(v => 0);
  }
</script>

<style>
  div {
    display: none;
  }
  div > div {
    display: initial;
    display: flex;
  }

  .active {
    display: initial;
  }
  button {
    display: flex;
    width: 50%;
    margin: 0 10px;
    margin-top: 10px;
    align-items: center;
    justify-content: center;
    height: 50px;
    cursor: pointer;
    user-select: none;
    text-overflow: clip;
    border-radius: 3px;
    border: 3px double;
    background: none;
    outline: none;
    font-size: 3.6vw;
  }

  @media screen and (min-width: 800px) {
    button {
      font-size: 29px;
    }
  }

  button {
    color: hsla(130, 65%, 27%, 1);
    background: hsla(120, 53%, 69%, 1);
    box-shadow: inset 0px 3px 6px 3px hsla(120, 53%, 79%, 1),
      inset 0px -1px 6px 3px hsla(120, 53%, 59%, 1);
    border: 3px hsla(130, 65%, 27%, 1) solid;
  }

  button:nth-of-type(1) {
    background: hsla(0, 53%, 59%, 1);
    box-shadow: inset 0px 3px 6px 3px hsla(0, 53%, 69%, 1),
      inset 0px -1px 6px 3px hsla(0, 53%, 49%, 1);
    color: hsla(10, 65%, 27%, 1);
    border: 3px hsl(10, 65%, 27%) solid;
  }
</style>

<div id="manual" class:active={isActive}>
  {#each $stationNames as stationName, i}
    <Station
      {stationName}
      stationTime={stationTimes[i]}
      bind:manualTime={manualTimes[i]}
    />
  {/each}
  <div>
    <button on:click={resetTimes}>Reset</button>
    <button on:click={updateManual}>Update</button>
  </div>

</div>
