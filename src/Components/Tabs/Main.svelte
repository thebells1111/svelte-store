<script>
  import Tab from './Tab.svelte';
  export let activeTab = 'programs';
  let tabs = ['programs', 'manual', 'config'];
</script>

<style>
  div {
    display: flex;
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
