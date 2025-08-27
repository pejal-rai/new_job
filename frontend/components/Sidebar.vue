<template>
  <div class="fixed w-64 h-screen bg-gray-900 text-white flex flex-col">
    <!-- Profile Section -->
    <div class="p-4 flex items-center border-b border-gray-800">
      <div class="w-10 h-10 bg-blue-500 rounded-full mr-3"></div>
      <div>
        <NuxtLink
          to="/admin/"
          class="text-lg font-semibold hover:text-blue-300 transition-colors duration-200"
        >
          {{ user?.name || "Home" }}
        </NuxtLink>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 mt-6">
      <ul>
        <li>
          <NuxtLink
            to="/admin/dashboard"
            class="block py-2.5 px-4 hover:bg-gray-800 transition-colors duration-200"
            ><i class="fas fa-tachometer-alt mr-2"></i> Dashboard</NuxtLink
          >
        </li>
        <li>
          <NuxtLink
            to="/admin/pending-companies"
            class="block py-2.5 px-4 hover:bg-gray-800 transition-colors duration-200"
            ><i class="fas fa-file-invoice mr-2"></i> Company application</NuxtLink
          >
        </li>
       
        
      </ul>
    </nav>

    <!-- Logout Section -->
    <div class="p-4 border-t border-gray-800">
      <button
        @click="logout"
        class="w-full flex items-center py-2.5 px-4 text-left hover:bg-red-800 transition-colors duration-200"
      >
        <i class="fas fa-sign-out-alt mr-2"></i> Logout
      </button>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "~/stores/user";
import { useRouter } from "vue-router";
import { computed, onMounted } from "vue";
import Swal from "sweetalert2";

const userStore = useUserStore();
const router = useRouter();
const user = computed(() => userStore.user);

// Fetch user on mount if not already set
onMounted(async () => {
  if (!userStore.user && !userStore.isLoggingOut) {
    await userStore.fetchUser();
  }
});

const logout = async () => {
  console.log("Logout initiated");
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "Do you want to log out?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, log out!",
  });

  if (result.isConfirmed) {
    console.log("User confirmed logout");
    try {
      console.log("Fetching /api/auth/logout...");
      const response = await $fetch(`${useRuntimeConfig().public.apiBase}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      console.log("Backend response:", response);

      console.log("Clearing user store...");
      userStore.clearUser();
      console.log("User after clear:", userStore.user);

      await Swal.fire({
        title: "Logged Out",
        text: "You have been successfully logged out.",
        icon: "success",
        timer: 1500,
        timerProgressBar: true,
      });

      console.log("Redirecting to /login...");
      await router.push("/login");
      console.log("Redirect completed");
    } catch (err) {
      console.error("Logout Error:", err);
      userStore.clearUser();
      await Swal.fire({
        title: "Error",
        text: "An error occurred during logout, but you’ve been logged out locally.",
        icon: "error",
      });
      await router.push("/login");
    }
  } else {
    console.log("Logout cancelled");
  }
};
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css");
</style>
