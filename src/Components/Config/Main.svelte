<script>
  export let isActive = false;
</script>

<style>
  div {
    display: none;
  }

  .active {
    display: initial;
  }
</style>

<div class:active={isActive === true}>Config</div>
