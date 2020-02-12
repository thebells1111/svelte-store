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
    width: 100%;
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

  button.stations {
    font-size: 14px;
    color: darkgreen;
    border-color: darkgreen;
    width: calc(100% - 0.15em);
    margin-bottom: 0.15em;
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
    font-size: 14px;
    border-color: hsla(200, 65%, 37%, 1);
    color: hsla(200, 65%, 37%, 1);
    width: calc(100% - 0.15em);
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
    width: 7.2vw;
    max-width: 54px;
    height: initial;
    text-align: center;
    margin-left: 1px;
    border: 0.1em solid;
  }

  button.pm {
    background: hsla(210, 50%, 45%, 1);
    box-shadow: inset 0px 3px 3px 1px hsla(210, 53%, 55%, 1),
      inset 0px -1px 3px 1px hsla(210, 53%, 45%, 1);
    border-color: hsla(215, 53%, 15%, 1);
    color: hsla(215, 53%, 15%, 1);
  }

  button.am {
    background: hsla(195, 53%, 79%, 1);
    box-shadow: inset 0px 3px 3px 1px hsla(195, 53%, 89%, 1),
      inset 0px -1px 3px 1px hsla(195, 53%, 69%, 1);
    border-color: hsla(200, 65%, 37%, 1);
    color: hsla(200, 65%, 37%, 1);
  }

  button.program-select.left {
    transform: scale(-1, 1);
  }

  button.program-select {
    width: 6.8vw;
    height: 6.8vw;
    max-width: 48px;
    max-height: 48px;
    box-shadow: inset 0px 3px 3px 1px hsla(195, 53%, 59%, 1),
      inset 0px -1px 3px 1px hsla(195, 53%, 39%, 1);
    background: hsla(195, 53%, 49%, 1);
    border-color: hsla(200, 65%, 27%, 1);
    color: hsla(200, 65%, 17%, 1);
  }

  button.controls {
    margin: 0 1em;
    font-size: 3vw;
    font-weight: 900;
  }

  button.controls.add {
    background-color: cornflowerblue;
  }

  button.controls.add {
    color: hsla(130, 65%, 27%, 1);
    background: hsla(120, 53%, 69%, 1);
    box-shadow: inset 0px 3px 6px 3px hsla(120, 53%, 79%, 1),
      inset 0px -1px 6px 3px hsla(120, 53%, 59%, 1);
    border: 3px hsla(130, 65%, 27%, 1) solid;
  }
  button.controls.add:hover {
    border: 3px hsla(130, 65%, 27%, 1) double;
  }
  button.controls.add :active {
    background: hsla(120, 53%, 79%, 1);
    box-shadow: inset 0px 3px 6px 3px hsla(120, 53%, 89%, 1),
      inset 0px -1px 6px 3px hsla(120, 53%, 69%, 1);
  }

  button.controls.modify {
    color: hsla(200, 65%, 27%, 1);
    background: hsla(195, 53%, 59%, 1);
    border: 3px hsla(200, 65%, 27%, 1) solid;
    box-shadow: inset 0px 3px 6px 3px hsla(195, 53%, 69%, 1),
      inset 0px -1px 6px 3px hsla(195, 53%, 49%, 1);
  }

  button.controls.delete {
    background: hsla(0, 53%, 59%, 1);
    box-shadow: inset 0px 3px 6px 3px hsla(0, 53%, 69%, 1),
      inset 0px -1px 6px 3px hsla(0, 53%, 49%, 1);
    color: hsla(10, 65%, 27%, 1);
    border: 3px hsl(10, 65%, 27%) solid;
  }

  @media screen and (min-width: 800px) {
    button.controls {
      font-size: 20px;
    }
  }
</style>

<button class={buttonType} on:click={click} data-value={data} class:checked>
  {name}
</button>
