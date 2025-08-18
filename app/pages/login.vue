<script setup lang="ts">
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/user",
  },
});

const { signIn, status, getProviders } = useAuth();

// Get available providers
const providers = await getProviders();

// Form data
const signInForm = reactive({
  username: "",
  password: "",
});

const isLoading = ref(false);
const error = ref("");

// Handle credentials sign-in
const handleCredentialsSignIn = async () => {
  if (!signInForm.username || !signInForm.password) {
    error.value = "Please fill in all fields";
    return;
  }

  isLoading.value = true;
  error.value = "";

  try {
    const result = await signIn("credentials", {
      username: signInForm.username,
      password: signInForm.password,
      redirect: false,
    });

    if (result?.error) {
      error.value = "Invalid credentials";
    } else {
      await navigateTo("/user");
    }
  } catch {
    error.value = "Login failed. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

// Handle Google OAuth login
const handleGoogleLogin = async () => {
  isLoading.value = true;
  error.value = "";

  try {
    await signIn("google", {
      callbackUrl: "/user",
    });
  } catch {
    error.value = "Google login failed. Please try again.";
    isLoading.value = false;
  }
};

// Redirect if already authenticated
watchEffect(() => {
  if (status.value === "authenticated") {
    navigateTo("/user");
  }
});
</script>

<template>
  <div
    class="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
  >
    <div class="max-w-md w-full space-y-8 p-8">
      <div class="text-center">
        <div
          class="mx-auto h-16 w-16 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 mb-4"
        >
          <UIcon name="i-heroicons-trophy" class="h-10 w-10 text-white" />
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Proderinos</h1>
        <h2 class="text-xl font-semibold text-gray-600">Iniciar sesión</h2>
        <p class="text-gray-500 mt-2">
          Accede a tu cuenta para gestionar torneos y apuestas
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <!-- Google OAuth Button -->
        <div v-if="providers?.google">
          <UButton
            :loading="isLoading"
            :disabled="isLoading"
            variant="outline"
            size="lg"
            block
            class="border-gray-300 text-gray-700 hover:bg-gray-50"
            @click="handleGoogleLogin"
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
              >O continúa con credenciales</span
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

        <!-- Sign In Form -->
        <form class="space-y-6" @submit.prevent="handleCredentialsSignIn">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Usuario *
            </label>
            <UInput
              v-model="signInForm.username"
              type="text"
              placeholder="Ingresá tu usuario"
              :disabled="isLoading"
              size="lg"
              icon="i-heroicons-user"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Contraseña *
            </label>
            <UInput
              v-model="signInForm.password"
              type="password"
              placeholder="Ingresá tu contraseña"
              :disabled="isLoading"
              size="lg"
              icon="i-heroicons-lock-closed"
            />
          </div>

          <UButton
            type="submit"
            :loading="isLoading"
            :disabled="
              isLoading || !signInForm.username || !signInForm.password
            "
            block
            size="lg"
            class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {{ isLoading ? "Ingresando..." : "Iniciar sesión" }}
          </UButton>
        </form>

        <!-- Signup link -->
        <div class="pt-6 border-t border-gray-200 text-center">
          <p class="text-sm text-gray-600">
            ¿No tienes una cuenta?
            <NuxtLink
              to="/signup"
              class="font-medium text-blue-600 hover:text-blue-500 ml-1"
            >
              Crear cuenta
            </NuxtLink>
          </p>
        </div>

        <!-- Info for OAuth users -->
        <div class="pt-4 border-t border-gray-200">
          <p class="text-xs text-gray-400 text-center">
            Los usuarios de Google pueden completar su perfil después del primer
            login
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
