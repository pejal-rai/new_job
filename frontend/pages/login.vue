<!-- pages/login.vue -->
<template>
  <div class="flex items-center justify-center px-4 pt-10">
    <div class="w-full max-w-md bg-[#bfbfc6] bg-opacity-50 p-6 rounded-2xl shadow-lg">
      <h1 class="text-3xl font-extrabold text-center text-black mb-6">Login</h1>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label for="email" class="block text-sm font-medium text-black">Email</label>
          <div class="relative mt-2">
            <input
              v-model="form.email"
              type="email"
              id="email"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="Enter your email"
            />
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <svg
                class="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-black"
            >Password</label
          >
          <div class="relative mt-2">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              id="password"
              class="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="Enter your password"
            />
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <svg
                class="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 11c0 1.104-.896 2-2 2s-2-.896-2-2  .896-2 2-2 2 .896 2 2zm0 0c0 1.104-.896 2-2 2s-2-.896-2-2m-6 7h12M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
                />
              </svg>
            </div>
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              @click="showPassword = !showPassword"
            >
              <svg
                v-if="showPassword"
                class="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <svg
                v-else
                class="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? "Logging in..." : "Login" }}
        </button>
        <p class="mt-4 text-center text-sm text-black">
          Don't have an account?
          <NuxtLink to="/register" class="text-red-600 hover:underline"
            >Register</NuxtLink
          >
        </p>
      </form>

      <p v-if="error" class="text-red-500 text-center mt-4">{{ error }}</p>
      <p v-if="message" class="text-green-500 text-center mt-4">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "~/stores/user";

definePageMeta({
  layout: "auth",
});

const config = useRuntimeConfig();
const userStore = useUserStore();
const router = useRouter();

const apiBase = config.public.apiBase || "http://localhost:5000/api";
const form = reactive({
  email: "",
  password: "",
});
const loading = ref(false);
const error = ref(null);
const message = ref(null);
const showPassword = ref(false);

async function handleLogin() {
  loading.value = true;
  error.value = null;
  message.value = null;

  const url = `${apiBase}/auth/login`;
  console.log("Login URL:", url);

  try {
    const response = await $fetch(url, {
      method: "POST",
      body: {
        email: form.email,
        password: form.password,
      },
      credentials: "include",
    });

    console.log("Login response:", response);

    if (response.success) {
      const profileResponse = await $fetch(`${apiBase}/auth/profile`, {
        method: "GET",
        credentials: "include",
      });
      console.log("Profile response:", profileResponse);

      if (profileResponse.success) {
        userStore.setUser(profileResponse.user);
        message.value = "Login successful!";
        setTimeout(() => {
          router.push(userStore.user.role === "admin" ? "/admin/" : "/admin/");
        }, 1000);
      } else {
        error.value = profileResponse.message || "Failed to fetch user profile";
      }
    } else {
      error.value = response.message || "Login failed";
    }
  } catch (err) {
    console.error("Login error:", err);
    error.value = err.data?.message || "An error occurred during login";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
