<script>
  export let buttonText = 'button';
  export let onClick = undefined;
  export let isActive = false;
</script>

<style>
  button {
    display: inline-block;
    margin: 0;
    padding: 0.5rem;
    font-weight: 600;
    text-align: center;
    color: #bbb;
    border: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    cursor: pointer;
    border-radius: 4px 4px 0 0;
    flex-grow: 1;
  }

  button:focus {
    outline: none;
  }

  button.active {
    color: #000;
    border: 1px solid #bbb;
    border-bottom: 1px solid transparent;
  }

  button:hover {
    color: #555;
    border: 1px solid #bbb;
    border-bottom: 1px solid #ddd;
  }

  button.active:hover {
    color: #000;
    border-bottom: 1px solid transparent;
  }
</style>

<button class:active={isActive} on:click={onClick}>{buttonText}</button>
