<script lang="ts">
  import { page } from "$app/state";
</script>

<h1 class="grid h-screen place-items-center text-5xl">
  {page.status}: {page.error?.message}
</h1>
