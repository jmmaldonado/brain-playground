<script lang="ts">
  import { level1, level2 } from './maps';
  import { provinces, communities } from './data';

  let {
    level = 'communities',
    focusedRegion = null,
    status = 'idle',
    mode = 'locate',
    onregionClick
  }: {
    level?: 'communities' | 'provinces' | 'capitals';
    focusedRegion?: string | null;
    status?: 'playing' | 'correct' | 'incorrect' | 'idle';
    mode?: 'locate' | 'identify' | 'learning';
    onregionClick?: (id: string) => void;
  } = $props();

  let svgContent = $derived(level === 'communities' ? level1 : level2);

  const colors = [
    '#DD4132', 
    '#9E1030', 
    '#FF842A', 
    '#FF6F61', 
    '#C83E74', 
    '#8D9440', 
    '#FFD662', 
    '#00539C', 
    '#755139', 
    '#DAA03D', 
    '#616247', 
    '#E8B5CE', 
    '#D89C9A'
  ];

  function getCommunityColor(id: string) {
    let communityId = id;
    if (level !== 'communities') {
      const province = provinces.find(p => p.id === id);
      communityId = province?.communityId || id;
    }
    const index = communities.findIndex(c => c.id === communityId);
    return index !== -1 ? colors[index % colors.length] : '#cbd5e1';
  }

  function handleClick(e: MouseEvent) {
    if (mode !== 'locate' && mode !== 'learning') return;
    
    const target = e.target as SVGElement;
    if (target.tagName === 'path' || target.tagName === 'circle') {
      let current: SVGElement | null = target;
      while (current && current.tagName !== 'svg') {
        if (current.id && current.id.startsWith('ES')) {
          onregionClick?.(current.id);
          return;
        }
        current = current.parentElement as SVGElement | null;
      }
    }
  }

  let highlightColor = $derived(status === 'correct' ? '#4ade80' : status === 'incorrect' ? '#f87171' : '#facc15');
</script>

<div
  class="map-wrapper"
  class:locate-mode={mode === 'locate'}
  class:identify-mode={mode === 'identify'}
  class:learning-mode={mode === 'learning'}
  style="--highlight-color: {highlightColor}; --focused-region: '{focusedRegion}';"
  onclick={handleClick}
  onkeydown={(e) => e.key === 'Enter' && handleClick(e as any)}
  role="button"
  tabindex="0"
>
  {@html svgContent}

  <!-- We inject a style block specifically for the dynamic ID targeting, 
       but using svelte:element to bypass Svelte's CSS preprocessor limitations -->
  <svelte:element this="style">
    {#if mode === 'learning'}
      {#if level === 'communities'}
        {#each communities as community}
          {`.map-wrapper #${community.id} { fill: ${getCommunityColor(community.id)}; }`}
        {/each}
      {:else}
        {#each provinces as province}
          {`.map-wrapper #${province.id} { fill: ${getCommunityColor(province.id)}; }`}
        {/each}
      {/if}
    {/if}
    
    {#if focusedRegion}
      {`.map-wrapper #${focusedRegion} {
        fill: ${highlightColor} !important;
        stroke: #000 !important;
        stroke-width: ${mode === 'learning' ? '2px' : '1.5px'} !important;
        z-index: 10;
      }`}
    {/if}
  </svelte:element>
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
  :global(.map-wrapper.learning-mode circle) { fill: #cbd5e1; }
  
  :global(.map-wrapper.learning-mode path:hover), 
  :global(.map-wrapper.learning-mode circle:hover) { 
    fill: #f8fafc !important; 
    stroke: #000; 
    stroke-width: 1.5px; 
    cursor: pointer; 
  }
</style>
