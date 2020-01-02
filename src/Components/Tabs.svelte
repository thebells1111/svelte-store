<script>
  let activeTab = 'programs';
</script>

<style>
  .active {
    visibility: visible;
  }

  .top-bar {
    border-bottom: 1px solid #ddd;
    margin-bottom: 0.25em;
    width: calc(100% - 1em);
  }
  button {
    display: inline-block;
    margin: 0 0 -1px;
    padding: 0.5rem;
    font-weight: 600;
    text-align: center;
    color: #bbb;
    border: 1px solid transparent;
    border-bottom: 1px solid #ddd;
    margin-left: 0.25em;
    cursor: pointer;
    border-radius: 4px 4px 0 0;
  }
  button.active {
    color: #000;
    border: 1px solid #ddd;
    border-bottom: 1px solid hsl(195, 20%, 92%);
  }

  button:hover {
    color: #555;
  }

  button.active:hover {
    color: #000;
  }
</style>

<div class="top-bar">
  <button
    class:active={activeTab === 'programs'}
    on:click={() => (activeTab = 'programs')}
  >
    Programs
  </button>
  <button
    class:active={activeTab === 'manual'}
    on:click={() => (activeTab = 'manual')}
  >
    Manual
  </button>
  <button
    class:active={activeTab === 'config'}
    on:click={() => (activeTab = 'config')}
  >
    Config
  </button>

</div>
