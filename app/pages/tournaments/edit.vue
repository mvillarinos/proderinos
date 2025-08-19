C
<template>
  <div class="max-w-2xl mx-auto py-8 px-4">
    <UCard>
      <template #header>
        <div class="flex items-center gap-3">
          <UIcon
            name="i-heroicons-pencil-square"
            class="w-6 h-6 text-blue-500"
          />
          <h1 class="text-2xl font-bold">Editar Torneo</h1>
        </div>
      </template>

      <div v-if="tournamentPending" class="flex justify-center py-8">
        <UIcon
          name="i-heroicons-arrow-path"
          class="w-8 h-8 animate-spin text-blue-500"
        />
      </div>

      <div v-else-if="tournamentError" class="py-8">
        <UAlert
          icon="i-heroicons-exclamation-triangle"
          color="error"
          variant="solid"
          title="Error"
          :description="tournamentError.message || 'Error al cargar el torneo'"
        />
      </div>

      <UForm
        v-else-if="tournament"
        :state="form"
        class="space-y-6"
        @submit="handleUpdate"
      >
        <!-- Name -->
        <UFormGroup label="Nombre" name="name" required>
          <UInput
            v-model="form.name"
            placeholder="Ej: Torneo de Padel 2024"
            size="lg"
            :disabled="pending"
          />
        </UFormGroup>

        <!-- Description -->
        <UFormGroup label="Descripción" name="description">
          <UTextarea
            v-model="form.description"
            placeholder="Descripción del torneo..."
            :rows="3"
            size="lg"
            :disabled="pending"
          />
        </UFormGroup>

        <!-- Dates -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="Fecha de inicio" name="start_date">
            <UInput
              v-model="form.start_date"
              type="date"
              size="lg"
              :disabled="pending"
            />
          </UFormGroup>

          <UFormGroup label="Fecha de fin" name="end_date">
            <UInput
              v-model="form.end_date"
              type="date"
              size="lg"
              :disabled="pending"
            />
          </UFormGroup>
        </div>

        <!-- Status -->
        <UFormGroup label="Estado" name="status">
          <USelect
            v-model="form.status"
            :items="statusOptions"
            value-key="value"
            size="lg"
            :disabled="pending"
            placeholder="Selecciona el estado"
          />
        </UFormGroup>

        <!-- Colors -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="Color primario" name="primary_color">
            <UInput
              v-model="form.primary_color"
              type="color"
              size="lg"
              :disabled="pending"
            />
          </UFormGroup>

          <UFormGroup label="Color de fondo" name="background_color">
            <UInput
              v-model="form.background_color"
              type="color"
              size="lg"
              :disabled="pending"
            />
          </UFormGroup>
        </div>

        <!-- Visibility -->
        <UFormGroup label="Visibilidad" name="visible">
          <UCheckbox
            v-model="form.visible"
            :disabled="pending"
            label="Torneo visible públicamente"
          />
        </UFormGroup>

        <!-- Organizators -->
        <UFormGroup label="Organizadores" name="organizators_id">
          <UInput
            v-model="organizatorsInput"
            placeholder="IDs separados por comas (ej: 1,2,3)"
            size="lg"
            :disabled="pending"
          />
          <template #help>
            <span class="text-sm text-gray-500">
              Introduce los IDs de los usuarios organizadores separados por
              comas
            </span>
          </template>
        </UFormGroup>

        <!-- Submit Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 pt-4">
          <UButton
            type="submit"
            size="lg"
            :loading="pending"
            :disabled="!form.name"
            class="flex-1"
          >
            <template #leading>
              <UIcon name="i-heroicons-check" />
            </template>
            {{ pending ? "Guardando..." : "Guardar Cambios" }}
          </UButton>

          <UButton
            variant="outline"
            size="lg"
            :disabled="pending"
            @click="navigateTo(`/tournaments/${tournamentId}`)"
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
          description="El torneo se ha actualizado correctamente"
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

<script setup lang="ts">
import type { TournamentPatchBody } from "#shared/types";

definePageMeta({
  auth: {
    unauthenticatedOnly: false,
    navigateAuthenticatedTo: undefined,
  },
});

const route = useRoute();
const tournamentId = parseInt(route.query.id as string);

if (!tournamentId) {
  throw createError({
    statusCode: 400,
    statusMessage: "Tournament ID is required",
  });
}

// Get tournament data
const {
  tournament,
  pending: tournamentPending,
  error: tournamentError,
} = useGetTournament(tournamentId);

// Update composable
const { updateTournament, pending, error } = useUpdateTournament();
const success = ref(false);

const form = ref<TournamentPatchBody>({
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

const statusOptions = [
  { label: "Borrador", value: "draft" },
  { label: "En progreso", value: "in_progress" },
  { label: "Finalizado", value: "completed" },
  { label: "Cancelado", value: "cancelled" },
];

// Populate form when tournament data is loaded
watch(
  tournament,
  (newTournament) => {
    if (newTournament) {
      form.value = {
        name: newTournament.name,
        description: newTournament.description || "",
        start_date: newTournament.start_date || "",
        end_date: newTournament.end_date || "",
        status: newTournament.status,
        visible: newTournament.visible ?? true,
        primary_color: newTournament.primary_color || "#3b82f6",
        background_color: newTournament.background_color || "#f1f5f9",
        organizators_id: Array.isArray(newTournament.organizators_id)
          ? newTournament.organizators_id
          : [],
      };

      organizatorsInput.value = Array.isArray(newTournament.organizators_id)
        ? newTournament.organizators_id.join(", ")
        : "";
    }
  },
  { immediate: true }
);

const handleUpdate = async () => {
  // Parse organizators
  form.value.organizators_id = organizatorsInput.value
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id);

  try {
    await updateTournament(tournamentId, form.value);
    success.value = true;

    // Navigate back after successful update
    setTimeout(() => {
      success.value = false;
      navigateTo(`/tournaments/${tournamentId}`);
    }, 2000);
  } catch (err) {
    // Error is handled by the composable
    console.error("Failed to update tournament:", err);
  }
};
</script>
