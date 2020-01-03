<script>
  import { type } from '../../stores.js';
  import Interval from './Interval.svelte';
  import DOW from './DOW.svelte';
</script>

<style>
  div {
    max-height: 66px;
    height: 8.5vw;
  }
</style>

<div>
  <Interval isActive={$type === 'interval'} />
  <DOW isActive={$type === 'dow'} />
</div>
