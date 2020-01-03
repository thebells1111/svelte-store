<script>
  import NumberInput from './NumberInput.svelte';
  export let stationName = 'station';
  export let stationTime = 0;
  $: time = stationTime;

  $: hour = Math.floor(time / 3600000);
  $: minute = Math.floor(((time % 3600000) / 3600000) * 60);
  $: second = Math.floor((time % 60000) / 1000);
</script>

<span>{stationName}: {time}</span>
<div>
  <NumberInput min="0" max="23" bind:value={hour} />
  hour(s)
  <NumberInput min="0" max="59" bind:value={minute} />
  min(s)
  <NumberInput min="0" max="59" bind:value={second} />
  sec(s)
</div>
