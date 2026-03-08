<script lang="ts">
  import { onMount } from 'svelte';
  import Map from '$lib/games/spain-map/Map.svelte';
  import { gameStore, type Level, type Mode } from '$lib/games/spain-map/logic';
  import { fade, slide } from 'svelte/transition';
  import { communities, provinces } from '$lib/games/spain-map/data';
  import { ArrowLeft } from 'lucide-svelte';

  let selectedLevel: Level = 'communities';
  let selectedMode: Mode = 'locate';

  $: ({ isPlaying, currentQuestion, options, focusedRegion, status, mistakes, history } = $gameStore);

  function handleStart() {
    gameStore.startGame(selectedLevel, selectedMode);
  }

  function handleStop() {
    gameStore.stopGame();
  }

  function handleRegionClick(e: CustomEvent<{ id: string }>) {
    if (selectedMode === 'locate' || selectedMode === 'learning') {
      gameStore.guess(e.detail.id);
    }
  }

  function handleOptionClick(id: string) {
    if (selectedMode === 'identify') {
      gameStore.guess(id);
    }
  }

  $: totalQuestions = history.length;
  $: correctAnswers = history.filter(h => h.correct).length;
  $: accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // Get top mistakes
  $: topMistakes = Object.entries(mistakes)
    .filter(([_, stats]) => stats.errors > stats.correct)
    .sort((a, b) => (b[1].errors - b[1].correct) - (a[1].errors - a[1].correct))
    .slice(0, 5);
  
  function getName(id: string) {
     const c = communities.find(c => c.id === id);
     if (c) return c.name;
     const p = provinces.find(p => p.id === id);
     if (p) return p.name;
     return id;
  }
</script>

<div class="min-h-screen flex flex-col items-center py-4 px-0 -m-2 font-sans text-gray-800">
  <div class="w-full max-w-4xl mb-4">
    <a href="/" class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors">
      <ArrowLeft size={20} /> Volver al menú
    </a>
  </div>

  <header class="w-full max-w-4xl flex justify-between items-center mb-6">
    <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
      Mapa de España
    </h1>
    {#if isPlaying}
      <button 
        class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors" 
        on:click={handleStop}
      >
        Terminar
      </button>
    {/if}
  </header>

  {#if !isPlaying}
    <div class="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-6 sm:p-8" transition:fade>
      <h2 class="text-xl sm:text-2xl font-bold text-gray-700 mb-6">Configura tu partida</h2>
      
      <div class="mb-6">
        <label class="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
          Nivel de detalle
        </label>
        <div class="flex p-1 bg-gray-100 rounded-xl">
          {#each ['communities', 'provinces', 'capitals'] as level}
            <button 
              class="flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all {selectedLevel === level ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}"
              on:click={() => selectedLevel = level as Level}
            >
              {level === 'communities' ? 'Comunidades' : level === 'provinces' ? 'Provincias' : 'Capitales'}
            </button>
          {/each}
        </div>
      </div>

      <div class="mb-8">
        <label class="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
          Modo de juego
        </label>
        <div class="flex flex-wrap gap-2">
          {#each ['locate', 'identify', 'learning'] as mode}
            <button 
              class="flex-1 min-w-[120px] py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all {selectedMode === mode ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}"
              on:click={() => selectedMode = mode as Mode}
            >
              {mode === 'locate' ? 'Localizar' : mode === 'identify' ? 'Identificar' : 'Aprendizaje'}
            </button>
          {/each}
        </div>
      </div>

      <button 
        class="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-xl shadow-lg transition-transform active:scale-95" 
        on:click={handleStart}
      >
        ¡Empezar!
      </button>

      {#if topMistakes.length > 0}
        <div class="mt-10 border-t border-gray-100 pt-6">
          <h3 class="text-lg font-bold text-gray-700 mb-4">Zonas a mejorar</h3>
          <div class="space-y-2">
            {#each topMistakes as [id, stats]}
              <div class="flex justify-between items-center bg-red-50 p-4 rounded-xl border border-red-100">
                <span class="font-bold text-gray-700">{getName(id)}</span>
                <span class="text-sm bg-red-500 text-white px-3 py-1 rounded-full font-bold">{stats.errors} fallos</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="w-full max-w-5xl flex flex-col lg:flex-row gap-6" transition:fade>
      <div class="flex-1 flex flex-col items-center">
        <!-- Question display -->
        <div class="w-full text-center mb-4 min-h-[100px] flex flex-col justify-center bg-white rounded-3xl shadow-sm p-4 border border-gray-100">
          {#if selectedMode === 'learning'}
            {#if currentQuestion}
              <div in:slide>
                <h2 class="text-3xl font-black text-orange-500">{selectedLevel === 'capitals' ? currentQuestion.capital : currentQuestion.name}</h2>
                {#if selectedLevel === 'capitals'}
                   <p class="text-lg text-gray-500 font-medium mt-1">Provincia de {currentQuestion.name}</p>
                {/if}
              </div>
            {:else}
              <h2 class="text-xl font-bold text-gray-400">Haz clic en una zona del mapa</h2>
            {/if}
          {:else if status === 'correct'}
            <div class="text-3xl font-black text-green-500 animate-bounce">¡Muy bien! 🎉</div>
          {:else if status === 'incorrect'}
            <div class="text-3xl font-black text-red-500 animate-pulse">¡Casi! 😅</div>
            <div class="text-lg text-gray-600 font-bold mt-1">Era {selectedLevel === 'capitals' ? currentQuestion?.capital : currentQuestion?.name}</div>
          {:else if currentQuestion}
            {#if selectedMode === 'locate'}
              <h2 class="text-xl sm:text-2xl font-bold text-gray-700">¿Dónde está <span class="text-blue-600 underline decoration-4 underline-offset-4">{selectedLevel === 'capitals' ? currentQuestion.capital : currentQuestion.name}</span>?</h2>
            {:else}
              <h2 class="text-xl sm:text-2xl font-bold text-gray-700">¿Cómo se llama esta zona?</h2>
            {/if}
          {/if}
        </div>

        <div class="w-full bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-white">
          <Map 
            level={selectedLevel === 'communities' ? 'communities' : 'provinces'} 
            mode={selectedMode}
            focusedRegion={focusedRegion}
            status={status}
            on:regionClick={handleRegionClick}
          />
        </div>
      </div>

      <!-- Sidebar -->
      <div class="w-full lg:w-72 flex flex-col gap-4">
        {#if selectedMode !== 'learning'}
          <div class="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center">
            <div class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Aciertos</div>
            <div class="text-5xl font-black text-green-500">{correctAnswers}</div>
            <div class="text-sm font-bold text-gray-400 mt-2">{accuracy}% de acierto</div>
          </div>
        {/if}

        {#if selectedMode === 'identify' && options.length > 0}
          <div class="flex flex-col gap-3" in:slide>
            {#each options as option}
              <button 
                class="py-4 px-6 rounded-2xl font-bold text-lg border-b-4 transition-all active:translate-y-1 active:border-b-0
                  {status !== 'playing' && currentQuestion?.id === option.id ? 'bg-green-500 border-green-700 text-white' : 
                   status !== 'playing' ? 'bg-gray-100 border-gray-300 text-gray-400 opacity-50' : 
                   'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 shadow-sm'}"
                disabled={status !== 'playing'}
                on:click={() => handleOptionClick(option.id)}
              >
                {selectedLevel === 'capitals' ? option.capital : option.name}
              </button>
            {/each}
          </div>
        {/if}
        
        {#if selectedMode === 'learning'}
           <div class="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-blue-800 text-sm italic" transition:fade>
              Este es el modo de exploración. Haz clic en cualquier parte del mapa para descubrir su nombre y capital.
           </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
