<script>
  export let name = 'button';
  export let click = undefined;
  export let buttonType = undefined;
  export let data = undefined;
  export let checked = false;
</script>

<style>
  button {
    display: flex;
    width: calc(100% - 0.15em);
    align-items: center;
    justify-content: center;
    height: 50px;
    margin: 1.5px 2px;
    cursor: pointer;
    user-select: none;
    text-overflow: clip;
    border-radius: 3px;
    font-size: 14px;
    border: 3px double;
    background: none;
    outline: none;
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

  button.dow {
    border-color: hsla(200, 65%, 37%, 1);
    color: hsla(200, 65%, 37%, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 8vw;
    max-height: 60px;
    width: 8vw;
    max-width: 60px;
    color: darkred;
    border: 3px darkred double;
    text-overflow: clip;
    border-radius: 3px;
    font-size: 12px;
  }
  button.dow:hover {
    font-weight: bold;
    border: 3px darkred solid;
  }
  button.dow:active {
    background: hsla(0, 53%, 79%, 1);
    box-shadow: inset 0px 3px 6px 3px hsla(0, 53%, 89%, 1),
      inset 0px -1px 6px 3px hsla(0, 53%, 69%, 1);
  }
  button.dow.checked {
    background: hsla(0, 53%, 79%, 1);
    box-shadow: inset 0px 3px 6px 3px hsla(0, 53%, 89%, 1),
      inset 0px -1px 6px 3px hsla(0, 53%, 69%, 1);
    color: darkred;
    font-weight: bold;
    border: 3px darkred solid;
  }

  button.dow.checked:active {
    background: none;
    box-shadow: none;
  }

  button.meridian,
  button.program-select {
    display: inline-block;
    font-size: var(--container-font-size);
    width: var(--container-input-width);
    max-width: 54px;
    height: initial;
    text-align: center;
    margin-left: 1px;
  }

  button.pm {
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

  button.program-select.left {
    transform: scale(-1, 1);
  }
</style>

<button class={buttonType} on:click={click} data-value={data} class:checked>
  {name}
</button>
