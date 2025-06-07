<script lang="ts">
  import "../app.css";
  import Footer from "$lib/components/Footer.svelte";

  let { children } = $props();
</script>

<div class="bg-ctp-base flex min-h-screen flex-col">
  <div class="flex-grow">
    {@render children()}
  </div>
  <div class="flex flex-col items-center justify-center">
    <Footer />
  </div>
</div>
