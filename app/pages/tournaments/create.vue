<script setup lang="ts">
import type { TournamentPostBody } from "#shared/types";

definePageMeta({
  auth: {
    unauthenticatedOnly: false,
    navigateAuthenticatedTo: undefined,
  },
});

const { createTournament, pending, error } = useCreateTournament();
const success = ref(false);

const form = ref<TournamentPostBody>({
  name: "",
  description: "",
  start_date: "",
  end_date: "",
  status: "draft",
  visible: true,
  primary_color: "#3b82f6",
  background_color: "#f1f5f9",
  organizators_id: [],
});

const organizatorsInput = ref("");

const statusItems = [
  { label: "Borrador", value: "draft" },
  { label: "En progreso", value: "in_progress" },
  { label: "Finalizado", value: "completed" },
  { label: "Cancelado", value: "cancelled" },
];

const handleCreate = async () => {
  // Parse organizators
  form.value.organizators_id = organizatorsInput.value
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id);

  try {
    const result = await createTournament(form.value);
    success.value = true;

    // Reset form after successful creation
    setTimeout(() => {
      success.value = false;
      navigateTo(`/tournaments/${result.tournament.id}`);
    }, 2000);
  } catch (err) {
    // Error is handled by the composable
    console.error("Failed to create tournament:", err);
  }
};
</script>

<template>
  <div class="max-w-2xl mx-auto py-8 px-4">
    <UCard>
      <template #header>
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-trophy" class="w-6 h-6 text-yellow-500" />
          <h1 class="text-2xl font-bold">Crear Torneo</h1>
        </div>
      </template>

      <UForm :state="form" class="space-y-6" @submit="handleCreate">
        <!-- Name -->
        <div class="space-y-1">
          <label for="name" class="block text-sm font-medium text-gray-700"
            >Nombre <span class="text-red-500">*</span></label
          >
          <UInput
            id="name"
            v-model="form.name"
            placeholder="Ej: Torneo de Padel 2024"
            size="lg"
            :disabled="pending"
            required
          />
        </div>

        <!-- Description -->
        <div class="space-y-1">
          <label
            for="description"
            class="block text-sm font-medium text-gray-700"
            >Descripción</label
          >
          <UTextarea
            id="description"
            v-model="form.description"
            placeholder="Descripción del torneo..."
            :rows="3"
            size="lg"
            :disabled="pending"
          />
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label
              for="start_date"
              class="block text-sm font-medium text-gray-700"
              >Fecha de inicio</label
            >
            <UInput
              id="start_date"
              v-model="form.start_date"
              type="date"
              size="lg"
              :disabled="pending"
            />
          </div>
          <div class="space-y-1">
            <label
              for="end_date"
              class="block text-sm font-medium text-gray-700"
              >Fecha de fin</label
            >
            <UInput
              id="end_date"
              v-model="form.end_date"
              type="date"
              size="lg"
              :disabled="pending"
            />
          </div>
        </div>

        <!-- Status -->
        <div class="space-y-1">
          <label for="status" class="block text-sm font-medium text-gray-700"
            >Estado</label
          >
          <USelect
            id="status"
            v-model="form.status"
            :items="statusItems"
            value-key="value"
            size="lg"
            :disabled="pending"
            placeholder="Selecciona el estado"
          />
          <div class="text-xs text-gray-500 mt-1">
            <span v-if="form.status === 'draft'">Borrador</span>
            <span v-else-if="form.status === 'in_progress'">En progreso</span>
            <span v-else-if="form.status === 'completed'">Finalizado</span>
            <span v-else-if="form.status === 'cancelled'">Cancelado</span>
          </div>
        </div>

        <!-- Colors -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label
              for="primary_color"
              class="block text-sm font-medium text-gray-700"
              >Color primario</label
            >
            <UInput
              id="primary_color"
              v-model="form.primary_color"
              type="color"
              size="lg"
              :disabled="pending"
            />
          </div>
          <div class="space-y-1">
            <label
              for="background_color"
              class="block text-sm font-medium text-gray-700"
              >Color de fondo</label
            >
            <UInput
              id="background_color"
              v-model="form.background_color"
              type="color"
              size="lg"
              :disabled="pending"
            />
          </div>
        </div>

        <!-- Visibility -->
        <div class="space-y-1">
          <label for="visible" class="block text-sm font-medium text-gray-700"
            >Visibilidad</label
          >
          <UCheckbox
            id="visible"
            v-model="form.visible"
            :disabled="pending"
            label="Torneo visible públicamente"
          />
        </div>

        <!-- Organizators -->
        <div class="space-y-1">
          <label
            for="organizators_id"
            class="block text-sm font-medium text-gray-700"
            >Organizadores</label
          >
          <UInput
            id="organizators_id"
            v-model="organizatorsInput"
            placeholder="IDs separados por comas (ej: 1,2,3)"
            size="lg"
            :disabled="pending"
          />
          <span class="text-sm text-gray-500">
            Introduce los IDs de los usuarios organizadores separados por comas
          </span>
        </div>

        <!-- Submit Button -->
        <div class="flex flex-col sm:flex-row gap-3 pt-4">
          <UButton
            type="submit"
            size="lg"
            :loading="pending"
            :disabled="!form.name"
            class="flex-1"
          >
            <template #leading>
              <UIcon name="i-heroicons-plus" />
            </template>
            {{ pending ? "Creando..." : "Crear Torneo" }}
          </UButton>

          <UButton
            variant="outline"
            size="lg"
            :disabled="pending"
            @click="navigateTo('/tournaments')"
          >
            Cancelar
          </UButton>
        </div>

        <!-- Success/Error Messages -->
        <UAlert
          v-if="success"
          icon="i-heroicons-check-circle"
          color="success"
          variant="solid"
          title="¡Éxito!"
          description="El torneo se ha creado correctamente"
        />

        <UAlert
          v-if="error"
          icon="i-heroicons-exclamation-triangle"
          color="error"
          variant="solid"
          title="Error"
          :description="error.message"
        />
      </UForm>
    </UCard>
  </div>
</template>
