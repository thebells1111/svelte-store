<script>
  import { currentProgram } from '../stores.js';
  import Interval from './Interval.svelte';
  import DOW from './DOW.svelte';
  export let style = undefined;

  $: type = $currentProgram.type;
</script>

<style>
  div {
    max-height: 66px;
    height: 8.5vw;
  }
</style>

<div>
  <Interval isActive={type === 'interval'} {style} />
  <DOW isActive={type === 'dow'} />
</div>
