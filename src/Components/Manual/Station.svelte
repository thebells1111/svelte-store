<script>
  import NumberInput from './NumberInput.svelte';
  export let stationName = 'station';
  export let stationTime = 0;
  export let manualTime = 0;

  let hour = 0;
  let minute = 0;
  let second = 0;

  $: stationHour = leadingZero(Math.floor(stationTime / 3600000));
  $: stationMinute = leadingZero(
    Math.floor(((stationTime % 3600000) / 3600000) * 60)
  );
  $: stationSecond = leadingZero(Math.floor((stationTime % 60000) / 1000));
  $: manualTime = hour * 3600000 + minute * 60000 + second * 1000;
  $: if (manualTime === 0) {
    resetTime();
  }

  function leadingZero(t) {
    return t < 10 ? '0' + t : t;
  }

  function resetTime() {
    hour = 0;
    minute = 0;
    second = 0;
  }
</script>

<span>{stationName}: {stationHour}:{stationMinute}:{stationSecond}</span>
<div>
  <NumberInput min="0" max="23" bind:value={hour} />
  hour(s)
  <NumberInput min="0" max="59" bind:value={minute} />
  min(s)
  <NumberInput min="0" max="59" bind:value={second} />
  sec(s)
</div>
