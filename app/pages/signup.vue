<script setup lang="ts">
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/user",
  },
});

const { signIn, getProviders } = useAuth();

// Get available providers
const providers = await getProviders();

// Form data
const signUpForm = reactive({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
});

const isLoading = ref(false);
const error = ref("");
const success = ref(false);

// Handle user sign-up
const handleSignUp = async () => {
  if (
    !signUpForm.username ||
    !signUpForm.email ||
    !signUpForm.password ||
    !signUpForm.confirmPassword
  ) {
    error.value = "Please fill in all required fields";
    return;
  }

  if (signUpForm.password !== signUpForm.confirmPassword) {
    error.value = "Passwords do not match";
    return;
  }

  if (signUpForm.password.length < 6) {
    error.value = "Password must be at least 6 characters long";
    return;
  }

  isLoading.value = true;
  error.value = "";
  success.value = false;

  try {
    const response = await $fetch("/api/auth/signup", {
      method: "POST",
      body: {
        username: signUpForm.username,
        email: signUpForm.email,
        password: signUpForm.password,
        name: signUpForm.name || undefined,
      },
    });

    if (response?.success) {
      success.value = true;
      // Reset form
      Object.assign(signUpForm, {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
      });
    }
  } catch (err) {
    const errorMessage = err as { data?: { statusMessage?: string } };
    error.value =
      errorMessage.data?.statusMessage || "Failed to create account";
  } finally {
    isLoading.value = false;
  }
};

// Handle Google OAuth signup
const handleGoogleSignUp = async () => {
  isLoading.value = true;
  error.value = "";

  try {
    await signIn("google", {
      callbackUrl: "/user",
    });
  } catch {
    error.value = "Google signup failed. Please try again.";
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    class="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
  >
    <div class="max-w-md w-full space-y-8 p-8">
      <div class="text-center">
        <div
          class="mx-auto h-16 w-16 flex items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 mb-4"
        >
          <UIcon name="i-heroicons-user-plus" class="h-10 w-10 text-white" />
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Proderinos</h1>
        <h2 class="text-xl font-semibold text-gray-600">Crear cuenta</h2>
        <p class="text-gray-500 mt-2">
          Crea tu cuenta para participar en torneos y apuestas
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <!-- Success Message -->
        <div v-if="success" class="text-center space-y-4">
          <UAlert
            color="success"
            variant="solid"
            title="¡Cuenta creada exitosamente!"
            description="Tu cuenta ha sido creada. Ahora puedes iniciar sesión."
            class="mb-6"
          />

          <div class="space-y-3">
            <UButton
              to="/login"
              size="lg"
              block
              class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Ir a iniciar sesión
            </UButton>

            <p class="text-sm text-gray-600">
              ¿Ya tienes una cuenta?
              <NuxtLink
                to="/login"
                class="font-medium text-blue-600 hover:text-blue-500 ml-1"
              >
                Iniciar sesión aquí
              </NuxtLink>
            </p>
          </div>
        </div>

        <!-- Signup Options -->
        <div v-else class="space-y-6">
          <!-- Google OAuth Button -->
          <div v-if="providers?.google">
            <UButton
              :loading="isLoading"
              :disabled="isLoading"
              variant="outline"
              size="lg"
              block
              class="border-gray-300 text-gray-700 hover:bg-gray-50"
              @click="handleGoogleSignUp"
            >
              <template #leading>
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </template>
              Continuar con Google
            </UButton>
          </div>

          <!-- Divider -->
          <div v-if="providers?.google" class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500"
                >O crea tu cuenta con email</span
              >
            </div>
          </div>

          <!-- Error Message -->
          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            :description="error"
            class="mb-4"
          />

          <!-- Sign Up Form -->
          <form class="space-y-6" @submit.prevent="handleSignUp">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Usuario *
              </label>
              <UInput
                v-model="signUpForm.username"
                type="text"
                placeholder="Elige un nombre de usuario"
                :disabled="isLoading"
                size="lg"
                icon="i-heroicons-user"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <UInput
                v-model="signUpForm.email"
                type="email"
                placeholder="tu@email.com"
                :disabled="isLoading"
                size="lg"
                icon="i-heroicons-envelope"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nombre (opcional)
              </label>
              <UInput
                v-model="signUpForm.name"
                type="text"
                placeholder="Tu nombre completo"
                :disabled="isLoading"
                size="lg"
                icon="i-heroicons-identification"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <UInput
                v-model="signUpForm.password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                :disabled="isLoading"
                size="lg"
                icon="i-heroicons-lock-closed"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Confirmar contraseña *
              </label>
              <UInput
                v-model="signUpForm.confirmPassword"
                type="password"
                placeholder="Confirma tu contraseña"
                :disabled="isLoading"
                size="lg"
                icon="i-heroicons-lock-closed"
              />
            </div>

            <UButton
              type="submit"
              :loading="isLoading"
              :disabled="
                isLoading ||
                !signUpForm.username ||
                !signUpForm.email ||
                !signUpForm.password ||
                !signUpForm.confirmPassword
              "
              block
              size="lg"
              class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {{ isLoading ? "Creando cuenta..." : "Crear cuenta" }}
            </UButton>

            <!-- Login link -->
            <div class="pt-6 border-t border-gray-200 text-center">
              <p class="text-sm text-gray-600">
                ¿Ya tienes una cuenta?
                <NuxtLink
                  to="/login"
                  class="font-medium text-blue-600 hover:text-blue-500 ml-1"
                >
                  Iniciar sesión
                </NuxtLink>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
