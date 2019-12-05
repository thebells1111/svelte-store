<script>
  import { state } from "./stores.js";
  import Button from "./Button.svelte";  
</script>

<style>
    div{
        margin-top: 2px;
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
</style>

<div>
    <Button name="Day of Week" />
    <Button name="Interval" />
</div>