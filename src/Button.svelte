<script>
  export let name = "button";
  export let click;
  export let buttonType;
  export let dataValue;
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
</style>

<button 
  class={buttonType} 
  on:click={e=>{click(e); checked = !checked}}
  data-value={dataValue}
  class:checked
>
  {name}
</button>
