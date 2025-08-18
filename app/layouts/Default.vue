<script setup lang="ts">
// Default layout with header navigation
const { data: session, signOut } = useAuth();

const handleLogout = async () => {
  await signOut({ callbackUrl: "/" });
};

// Type-safe user access with our extended auth types
const user = computed(
  () =>
    session.value?.user as
      | {
          id: string;
          name?: string | null;
          email?: string | null;
          image?: string | null;
          username?: string;
          role?: string;
          dbId?: string | number;
        }
      | undefined
);
</script>

<template>
  <div
    class="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
  >
    <!-- Navigation Header -->
    <header
      class="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 shadow-sm"
    >
      <UContainer>
        <div class="flex items-center justify-between py-2">
          <!-- Logo -->
          <div
            class="flex items-center space-x-3 cursor-pointer"
            @click="$router.push('/')"
          >
            <div
              class="size-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg"
            >
              <UIcon
                name="custom:paleta"
                class="w-5 h-5 text-white fill-white"
              />
            </div>
            <div>
              <h1
                class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              >
                Proderinos
              </h1>
              <p class="text-xs text-slate-500 -mt-1">Tu gestión de torneos</p>
            </div>
          </div>
          <!-- Navigation Links -->
          <nav class="flex items-center space-x-3">
            <UButton
              to="/tournaments"
              variant="ghost"
              size="sm"
              class="text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-lg"
            >
              <UIcon name="i-heroicons-trophy" class="w-4 h-4 mr-2" />
              Torneos
            </UButton>

            <div class="flex items-center">
              <AtomUserAvatar :user="user" @logout="handleLogout" />
            </div>
          </nav>
        </div>
      </UContainer>
    </header>

    <!-- Main Content -->
    <main class="flex flex-col flex-1 min-h-0 p-4">
      <slot />
    </main>

    <!-- Modern Footer -->
    <footer class="bg-white/80 backdrop-blur-sm border-t border-slate-200">
      <UContainer>
        <div
          class="py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500"
        >
          <p>2025 Proderinos. Tu gestión de torneos.</p>
          <p class="mt-2 sm:mt-0">
            Desarrollado por Manuel Villarinos usando Nuxt y Tailwind CSS
          </p>
        </div>
      </UContainer>
    </footer>
  </div>
</template>
