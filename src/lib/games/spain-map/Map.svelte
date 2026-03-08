<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';
  
  export let level: 'communities' | 'provinces' | 'capitals' = 'communities';
  export let focusedRegion: string | null = null;
  export let status: 'playing' | 'correct' | 'incorrect' | 'idle' = 'idle';
  export let mode: 'locate' | 'identify' | 'learning' = 'locate';

  const dispatch = createEventDispatcher<{
    regionClick: { id: string }
  }>();

  let svgContent = '';
  
  $: svgFile = level === 'communities' ? '/es-level1.svg' : '/es-level2.svg';

  async function loadMap(url: string) {
    if (!browser) return;
    const res = await fetch(url);
    if (res.ok) {
      svgContent = await res.text();
    }
  }

  $: {
    if (browser) {
      loadMap(svgFile);
    }
  }

  function handleClick(e: MouseEvent) {
    if (mode !== 'locate' && mode !== 'learning') return;
    
    const target = e.target as SVGElement;
    if (target.tagName === 'path' || target.tagName === 'circle') {
      // In the SVG, paths have the region ID
      // Sometimes we might click a child element, but usually the path is the target
      let current: SVGElement | null = target;
      while (current && current.tagName !== 'svg') {
         if (current.id && current.id.startsWith('ES')) {
            dispatch('regionClick', { id: current.id });
            return;
         }
         current = current.parentElement as SVGElement | null;
      }
    }
  }

  $: highlightColor = status === 'correct' ? '#4ade80' : status === 'incorrect' ? '#f87171' : '#facc15';

</script>

<div 
  class="map-wrapper"
  class:locate-mode={mode === 'locate'}
  class:identify-mode={mode === 'identify'}
  class:learning-mode={mode === 'learning'}
  style="--highlight-color: {highlightColor}; --focused-region: '{focusedRegion}';"
  on:click={handleClick}
  on:keydown={(e) => e.key === 'Enter' && handleClick(e as any)}
  role="button"
  tabindex="0"
>
  {@html svgContent}

  <!-- We inject a style block specifically for the dynamic ID targeting, 
       but using svelte:element to bypass Svelte's CSS preprocessor limitations -->
  {#if focusedRegion}
    <svelte:element this="style">
      {`.map-wrapper #${focusedRegion} {
        fill: ${highlightColor} !important;
        stroke: #000 !important;
        stroke-width: ${mode === 'learning' ? '2px' : '1.5px'} !important;
      }`}
    </svelte:element>
  {/if}
</div>

<style>
  .map-wrapper {
    @apply w-full max-w-4xl mx-auto flex justify-center items-center relative p-4;
  }
  
  :global(.map-wrapper svg) {
    @apply w-full h-auto drop-shadow-xl;
    max-height: 70vh;
  }
  
  /* Defaults */
  :global(.map-wrapper path), :global(.map-wrapper circle) {
    @apply transition-colors duration-200;
  }
  
  /* Locate mode hover effects */
  :global(.map-wrapper.locate-mode path:hover),
  :global(.map-wrapper.locate-mode circle:hover) {
    fill: #60a5fa !important;
    cursor: pointer;
  }

  /* Learning mode styles */
  :global(.map-wrapper.learning-mode path:nth-child(7n+1)) { fill: #fecdd3; }
  :global(.map-wrapper.learning-mode path:nth-child(7n+2)) { fill: #fed7aa; }
  :global(.map-wrapper.learning-mode path:nth-child(7n+3)) { fill: #fef08a; }
  :global(.map-wrapper.learning-mode path:nth-child(7n+4)) { fill: #d9f99d; }
  :global(.map-wrapper.learning-mode path:nth-child(7n+5)) { fill: #a7f3d0; }
  :global(.map-wrapper.learning-mode path:nth-child(7n+6)) { fill: #bae6fd; }
  :global(.map-wrapper.learning-mode path:nth-child(7n+7)) { fill: #c7d2fe; }
  :global(.map-wrapper.learning-mode circle) { fill: #cbd5e1; }
  
  :global(.map-wrapper.learning-mode path:hover), 
  :global(.map-wrapper.learning-mode circle:hover) { 
    fill: #f8fafc !important; 
    stroke: #000; 
    stroke-width: 1.5px; 
    cursor: pointer; 
  }
</style>
