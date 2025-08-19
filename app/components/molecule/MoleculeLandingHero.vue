<script setup lang="ts">
defineProps<{ currentTournament?: Tournament }>();
</script>

<template>
  <section class="text-center py-16 px-4">
    <div class="max-w-4xl mx-auto">
      <div
        class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl mb-8"
      >
        <UIcon name="custom:paleta" class="w-14 h-14 text-white" />
      </div>

      <h1 class="text-5xl sm:text-6xl font-bold mb-6">
        <div
          class="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
        >
          Proderinos
        </div>
        <span class="text-slate-800"
          >Hacé tus predicciones en torneos de Pelota Paleta</span
        >
      </h1>

      <p class="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
        Demostrá que sos un experto en el deporte y competí con tus amigos.
        Seguí el partido en vivo y la tabla de predicciones.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <UButton
          v-if="currentTournament"
          :to="`/tournaments/${currentTournament.id}`"
          size="xl"
          class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-4"
        >
          <UIcon name="i-heroicons-play" class="w-5 h-5 mr-2" />
          Ver torneo {{ currentTournament.name }}
        </UButton>
        <UButton
          v-else
          to="/tournaments"
          size="xl"
          class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-4"
        >
          <UIcon name="i-heroicons-trophy" class="w-5 h-5 mr-2" />
          Ver torneos
        </UButton>
      </div>
    </div>
  </section>
</template>
