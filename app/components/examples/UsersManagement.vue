<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Users Management</h1>

    <!-- Users List -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">All Users</h2>
        <UButton :loading="pending" @click="refreshUsers"> Refresh </UButton>
      </div>

      <div v-if="error" class="text-red-500 mb-4">
        Error: {{ error.message }}
      </div>

      <div v-if="pending" class="text-gray-500">Loading users...</div>

      <div v-else-if="users.length === 0" class="text-gray-500">
        No users found.
      </div>

      <div v-else class="grid gap-4">
        <div v-for="user in users" :key="user.id" class="border rounded-lg p-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-semibold">{{ user.name || user.username }}</h3>
              <p class="text-gray-600">{{ user.email }}</p>
              <span
                class="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800"
              >
                {{ user.role }}
              </span>
            </div>

            <div class="flex gap-2">
              <UButton size="sm" variant="outline" @click="openEditUser(user)">
                Edit
              </UButton>

              <UButton
                size="sm"
                variant="outline"
                @click="openRoleDialog(user)"
              >
                Change Role
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create User Form -->
    <div class="border-t pt-8">
      <h2 class="text-xl font-semibold mb-4">Create New User</h2>

      <form class="grid gap-4 max-w-md" @submit.prevent="handleCreateUser">
        <UInput v-model="newUser.username" placeholder="Username" required />
        <UInput
          v-model="newUser.email"
          type="email"
          placeholder="Email"
          required
        />
        <UInput
          v-model="newUser.password"
          type="password"
          placeholder="Password"
          required
        />
        <UInput v-model="newUser.name" placeholder="Full Name (optional)" />
        <USelect
          v-model="newUser.role"
          :options="[
            { label: 'Player', value: 'player' },
            { label: 'Organizator', value: 'organizator' },
            { label: 'Admin', value: 'admin' },
          ]"
        />

        <UButton
          type="submit"
          :loading="createPending"
          :disabled="!newUser.username || !newUser.email || !newUser.password"
        >
          Create User
        </UButton>
      </form>
    </div>
  </div>
</template>

<script setup>
import type { UserPostBody, User } from "#shared/types";

// Composables for user management
const { users, pending, error, refresh: refreshUsers } = useGetAllUsers();
const { createUser, pending: createPending } = useCreateUser();

// Form data
const newUser =
  ref <
  UserPostBody >
  {
    username: "",
    email: "",
    password: "",
    name: "",
    role: "player",
  };

// Handlers
const handleCreateUser = async () => {
  try {
    await createUser(newUser.value);

    // Reset form
    newUser.value = {
      username: "",
      email: "",
      password: "",
      name: "",
      role: "player",
    };

    // Refresh the list
    await refreshUsers();

    // Show success message
    const toast = useToast();
    toast.add({
      title: "Success",
      description: "User created successfully",
      color: "green",
    });
  } catch {
    const toast = useToast();
    toast.add({
      title: "Error",
      description: "Failed to create user",
      color: "red",
    });
  }
};

const openEditUser = (user: Omit<User, "password_hash">) => {
  // Implementation for editing user profile
  console.log("Edit user:", user);
};

const openRoleDialog = (user: Omit<User, "password_hash">) => {
  // Implementation for changing user role
  console.log("Change role for user:", user);
};

// Auto-refresh on mount
onMounted(() => {
  refreshUsers();
});
</script>
