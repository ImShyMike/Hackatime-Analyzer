<script>
  import { PUBLIC_COMMIT_SHA } from "$env/static/public";
  import { IconGitCommit } from "@tabler/icons-svelte";
  import { gitRepoUrl } from "$lib";

  const commitSha = PUBLIC_COMMIT_SHA || "";
  const shortHash = commitSha ? commitSha.slice(0, 7) : "dev";
  const gitCommitUrl = commitSha ? `${gitRepoUrl}/commit/${commitSha}` : "";
</script>

<footer
  class="text-ctp-overlay0 mt-8 flex flex-row items-center justify-center border-t px-5 py-2 text-center text-sm"
>
  <p class="mr-3">
    <a href="https://github.com/ImShyMike" target="_blank" rel="noopener noreferrer">shymike</a>
  </p>
  <p class="text-ctp-surface0">-</p>
  <div class="flex items-center justify-center">
    {#if gitCommitUrl}
      <a
        href={gitCommitUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center space-x-1"
      >
        <IconGitCommit class="mr-0" />
        <span class="font-mono">{shortHash}</span>
      </a>
    {:else}
      <span class="flex items-center space-x-1">
        <IconGitCommit class="mr-0" />
        <span class="font-mono">{shortHash}</span>
      </span>
    {/if}
  </div>
</footer>
