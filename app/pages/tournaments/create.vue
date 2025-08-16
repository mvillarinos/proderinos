<script setup lang="ts">
import { z } from "zod";

// Types
interface Tournament {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: "draft" | "in_progress" | "completed" | "cancelled";
}

interface TournamentFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "draft" | "in_progress" | "completed" | "cancelled";
}

interface StatusOption {
  label: string;
  value: string;
}

// Form schema
const schema = z.object({
  name: z.string().min(1, "Tournament name is required"),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(["draft", "in_progress", "completed", "cancelled"]),
});

// State
const creating = ref(false);
const form = ref();

// Form data
const formData = reactive<TournamentFormData>({
  name: "",
  description: "",
  start_date: "",
  end_date: "",
  status: "draft",
});

// Status options
const statusOptions: StatusOption[] = [
  { label: "Draft", value: "draft" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

// Functions
async function createTournament() {
  creating.value = true;

  try {
    // Validate form
    await form.value.validate();

    // Prepare data
    const tournamentData = {
      name: formData.name,
      description: formData.description || undefined,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
      status: formData.status,
    };

    // Create tournament
    const tournament = await $fetch<Tournament>("/api/tournaments", {
      method: "POST",
      body: tournamentData,
    });

    // Redirect to tournament details
    await navigateTo(`/tournaments/${tournament.id}`);
  } catch (error) {
    console.error("Failed to create tournament:", error);
    // You can add error notification here
  } finally {
    creating.value = false;
  }
}

// Page meta
useHead({
  title: "Create Tournament - Proderinos",
});
</script>

<template>
  <div class="space-y-8">
    <!-- Modern Page Header -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
    >
      <div>
        <h1
          class="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
        >
          Crear Torneo
        </h1>
        <p class="text-slate-600 mt-2 text-lg">
          Configura un nuevo torneo de pelota paleta
        </p>
      </div>
      <UButton
        to="/tournaments"
        variant="outline"
        size="lg"
        class="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 mr-2" />
        Volver a Torneos
      </UButton>
    </div>

    <!-- Modern Form Card -->
    <div class="max-w-4xl mx-auto">
      <div
        class="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <!-- Card Header -->
        <div
          class="bg-gradient-to-r from-emerald-50 to-teal-50 px-8 py-6 border-b border-emerald-100"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center"
            >
              <UIcon name="i-heroicons-trophy" class="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 class="text-2xl font-bold text-slate-800">
                Detalles del Torneo
              </h2>
              <p class="text-slate-600">
                Completa la información para crear tu torneo
              </p>
            </div>
          </div>
        </div>

        <!-- Form Content -->
        <div class="p-8">
          <UForm
            ref="form"
            :schema="schema"
            :state="formData"
            class="space-y-8"
            @submit="createTournament"
          >
            <!-- Tournament Name -->
            <div class="space-y-3">
              <label
                for="name"
                class="flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <UIcon
                  name="i-heroicons-identification"
                  class="w-4 h-4 text-emerald-600"
                />
                Nombre del Torneo
                <span class="text-red-500">*</span>
              </label>
              <UInput
                id="name"
                v-model="formData.name"
                placeholder="Ej: Campeonato de Verano 2025"
                size="lg"
                required
                class="transition-all duration-200 focus:ring-2 focus:ring-emerald-500"
              />
              <p class="text-xs text-slate-500">
                Elige un nombre descriptivo para tu torneo
              </p>
            </div>

            <!-- Description -->
            <div class="space-y-3">
              <label
                for="description"
                class="flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <UIcon
                  name="i-heroicons-document-text"
                  class="w-4 h-4 text-blue-600"
                />
                Descripción
              </label>
              <UTextarea
                id="description"
                v-model="formData.description"
                placeholder="Agrega detalles adicionales sobre el torneo (opcional)"
                :rows="4"
                size="lg"
                class="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
              <p class="text-xs text-slate-500">
                Opcional: Agrega reglas, premios u otra información importante
              </p>
            </div>

            <!-- Date Section -->
            <div class="space-y-6">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-heroicons-calendar-days"
                  class="w-5 h-5 text-purple-600"
                />
                <h3 class="text-lg font-semibold text-slate-800">
                  Fechas del Torneo
                </h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <label
                    for="start_date"
                    class="block text-sm font-semibold text-slate-700"
                  >
                    Fecha de Inicio
                  </label>
                  <UInput
                    id="start_date"
                    v-model="formData.start_date"
                    type="date"
                    size="lg"
                    class="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div class="space-y-3">
                  <label
                    for="end_date"
                    class="block text-sm font-semibold text-slate-700"
                  >
                    Fecha de Fin
                  </label>
                  <UInput
                    id="end_date"
                    v-model="formData.end_date"
                    type="date"
                    size="lg"
                    class="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div class="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p class="text-purple-800 text-sm">
                  💡 <strong>Consejo:</strong> Establecer fechas ayuda a los
                  participantes a planificar. Puedes actualizarlas más adelante.
                </p>
              </div>
            </div>

            <!-- Status Section -->
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-flag" class="w-5 h-5 text-amber-600" />
                <h3 class="text-lg font-semibold text-slate-800">
                  Estado del Torneo
                </h3>
              </div>

              <div class="space-y-3">
                <label
                  for="status"
                  class="block text-sm font-semibold text-slate-700"
                >
                  Estado Inicial
                </label>
                <USelectMenu
                  id="status"
                  v-model="formData.status"
                  :options="statusOptions"
                  placeholder="Selecciona el estado del torneo"
                  size="lg"
                  class="transition-all duration-200 focus:ring-2 focus:ring-amber-500"
                >
                  <template #leading>
                    <UIcon
                      name="i-heroicons-flag"
                      class="w-4 h-4 text-amber-600"
                    />
                  </template>
                </USelectMenu>
              </div>

              <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p class="text-amber-800 text-sm">
                  📋 <strong>Recomendado:</strong> Comienza con estado
                  "Borrador" para configurar equipos y partidos antes de
                  publicar.
                </p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div
              class="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-slate-200"
            >
              <UButton
                type="button"
                variant="outline"
                size="lg"
                class="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 transition-all duration-300"
                @click="navigateTo('/tournaments')"
              >
                <UIcon name="i-heroicons-x-mark" class="w-5 h-5 mr-2" />
                Cancelar
              </UButton>

              <UButton
                type="submit"
                size="lg"
                :loading="creating"
                class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-48"
              >
                <UIcon name="i-heroicons-plus" class="w-5 h-5 mr-2" />
                {{ creating ? "Creando Torneo..." : "Crear Torneo" }}
              </UButton>
            </div>
          </UForm>
        </div>
      </div>

      <!-- Help Section -->
      <div
        class="mt-8 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200"
      >
        <div class="flex items-start gap-4">
          <div
            class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <UIcon
              name="i-heroicons-light-bulb"
              class="w-5 h-5 text-blue-600"
            />
          </div>
          <div>
            <h3 class="font-semibold text-slate-800 mb-2">Próximos Pasos</h3>
            <ul class="text-slate-600 text-sm space-y-1">
              <li>
                • Después de crear el torneo, podrás agregar equipos
                participantes
              </li>
              <li>
                • Genera los partidos automáticamente o créalos manualmente
              </li>
              <li>• Sigue los resultados y posiciones durante el torneo</li>
              <li>• Actualiza el estado a medida que avanza el torneo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
