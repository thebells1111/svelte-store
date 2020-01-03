<script>
  import Tabs from './Components/Tabs/Main.svelte';
  import Programs from './Components/Programs/Main.svelte';
  import Manual from './Components/Manual/Main.svelte';
  import Config from './Components/Config/Main.svelte';
  let activeTab = 'manual';
</script>

<style>
  #app {
    cursor: arrow;
    user-select: none;
    min-width: 310px;
    max-width: 800px;
    height: 100vh;
    max-height: 700px;
    margin: auto;
    margin-top: 0;
    padding: 3px;
    background: linear-gradient(
      to bottom,
      rgba(242, 245, 246, 1) 0%,
      rgba(227, 234, 237, 1) 37%,
      rgb(144, 207, 228) 100%
    );
    display: flex;
    flex-direction: column;
  }

  .programs {
    display: none;
  }

  .active {
    display: initial;
  }
</style>

<div id="app">
  <Tabs bind:activeTab />
  <Programs isActive={activeTab === 'programs'} />
  <Manual isActive={activeTab === 'manual'} />
  <Config isActive={activeTab === 'config'} />
</div>
