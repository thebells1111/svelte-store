<script>
import { currentProgram } from "./stores.js"; 
import Datepicker from "./Components/Datepicker.svelte";
let interval = 1

</script>

<span>
  Run every
  <input
    type="number"
    value={interval}
  />
  day(s)
</span>

<span>
  starting
  <Datepicker/>
</span>