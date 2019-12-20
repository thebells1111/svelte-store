<script>
  export let value = 0;
  export let max = infinity;
  export let min = -infinity;
  export let blur = undefined;
  export let focus = undefined;
  export let scrollChange = () => {};

  function changeInput(e) {
    let i = e.target.value.toString();

    if (i.match(/[^0-9]/g)) {
      //allows only digits as input
      value = i.match(/[0-9]/g).join('');
    } else if (Number(i) > max) {
      //won't allow input to be greater than max
      value = i.split('').pop();
    }

    if (Number(value) > max) {
      // so displayed number will never be higher than single digit max number
      value = max;
    }

    value = Number(value);
  }

  function decVal() {
    value--;
    if (value < min) {
      value = max;
    }
  }

  function incVal() {
    value++;
    if (value > max) {
      value = min;
    }
  }

  function mouseScroll(e) {
    if (e.deltaY > min) {
      decVal();
    }
    if (e.deltaY < 0) {
      incVal();
    }
    scrollChange();
  }

  function handleKeypress(e) {
    switch (e.key) {
      case 'Enter':
        e.target.blur();
        break;
      case 'ArrowDown':
        decVal();
        break;
      case 'ArrowUp':
        incVal();
        break;
    }
  }
</script>

<style>
  input {
    background: white;
    width: var(--container-input-width, initial);
    max-width: 54px;
    max-height: 44px;
    height: 6vw;
    font-size: var(--container-font-size, initial);
    text-align: center;
    margin: 0 0.25em;
    position: relative;
    border-radius: 3px;
    border: none;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.39), 0 1px 1px #fff;
    padding: 4px 0px 0px 0px;
    cursor: pointer;
  }
</style>

<input
  bind:value
  on:input={changeInput}
  on:blur={blur}
  on:focus={focus}
  on:wheel={mouseScroll}
  on:keydown={handleKeypress}
/>
