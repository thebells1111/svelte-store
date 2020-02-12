<script>
  import Tab from './Tab.svelte';
  export let activeTab = 'programs';
  let tabs = ['programs', 'manual', 'config'];
</script>

<style>
  div {
    display: flex;
  }

  :global(#manual > div) {
    font-size: 3.6vw;
  }
  :global(#manual > div:first-child) {
    margin-top: 0;
  }

  @media screen and (min-width: 800px) {
    :global(#manual > div) {
      font-size: 29px;
    }
  }
</style>

<div>
  {#each tabs as tab}
    <Tab
      isActive={activeTab === tab}
      onClick={() => (activeTab = tab)}
      buttonText={tab.charAt(0).toUpperCase() + tab.substring(1)}
    />
  {/each}
</div>
