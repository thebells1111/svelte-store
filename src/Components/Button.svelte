<script>
  export let name = 'button';
  export let click;
  export let buttonType;
  export let data;
  export let checked = false;
</script>

<style>
  button {
    display: flex;
    width: calc(100% - 0.15em);
    align-items: center;
    justify-content: center;
    height: 50px;
    margin: 1px;
    cursor: pointer;
    user-select: none;
    text-overflow: clip;
    border-radius: 3px;
    font-size: 14px;
    border: 3px double;
  }

  button.stations {
    color: darkgreen;
    border-color: darkgreen;
  }
  button.stations:hover {
    font-weight: bold;
    border: 3px darkgreen solid;
  }
  button.stations:active {
    background: hsla(120, 53%, 79%, 1);
    box-shadow: inset 0px 3px 6px 3px hsla(120, 53%, 89%, 1),
      inset 0px -1px 6px 3px hsla(120, 53%, 69%, 1);
  }
  button.stations.checked {
    background: hsla(120, 53%, 79%, 1);
    box-shadow: inset 0px 3px 6px 3px hsla(120, 53%, 89%, 1),
      inset 0px -1px 6px 3px hsla(120, 53%, 69%, 1);
    font-weight: bold;
    border: 3px darkgreen solid;
  }
  button.stations.checked:hover {
    font-weight: normal;
    border: 3px darkgreen double;
  }

  button.stations.checked:active {
    background: none;
    box-shadow: none;
  }

  button.interval-type {
    border-color: hsla(200, 65%, 37%, 1);
    color: hsla(200, 65%, 37%, 1);
  }
  button.interval-type:hover {
    font-weight: bold;
    border: 3px hsla(200, 65%, 37%, 1) solid;
  }
  button.interval-type:active {
    background: none;
    box-shadow: none;
  }
  button.interval-type.checked {
    background: hsla(195, 53%, 79%, 1);
    font-weight: bold;
    border: 3px hsla(200, 65%, 37%, 1) solid;
    box-shadow: inset 0px 3px 6px 3px hsla(195, 53%, 89%, 1),
      inset 0px -1px 6px 3px hsla(195, 53%, 69%, 1);
  }
  button.interval-type.checked:hover {
    font-weight: bold;
    border: 3px hsla(200, 65%, 37%, 1) solid;
  }
</style>

<button class={buttonType} on:click={click} data-value={data} class:checked>
  {name}
</button>
