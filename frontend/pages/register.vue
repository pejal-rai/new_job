<!-- pages/register.vue -->
<template>
  <div class="flex items-center justify-center pt-6">
    <div class="bg-[#a8a8b0] bg-opacity-50 p-6 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-[red] mb-4">Register</h1>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-black">Name</label>
          <div class="relative mt-1">
            <input
              v-model="form.name"
              type="text"
              id="name"
              class="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.name }"
              placeholder="Enter your name"
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
          <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-black">Email</label>
          <div class="relative mt-1">
            <input
              v-model="form.email"
              type="email"
              id="email"
              class="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.email }"
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
          <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-black"
            >Password</label
          >
          <div class="relative mt-1">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              id="password"
              class="w-full pl-10 pr-12 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.password }"
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
          <p v-if="errors.password" class="text-red-500 text-sm mt-1">
            {{ errors.password }}
          </p>
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          :disabled="loading"
        >
          {{ loading ? "Registering..." : "Register" }}
        </button>
      </form>

      <p
        v-if="message"
        class="mt-4 text-center"
        :class="{ 'text-green-500': success, 'text-red-500': !success }"
      >
        {{ message }}
      </p>

      <p class="mt-4 text-center text-sm text-black">
        Already have an account?
        <NuxtLink to="/login" class="text-[green] es hover:underline">Login</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "~/stores/user";

definePageMeta({ layout: "auth" });

const config = useRuntimeConfig();
const userStore = useUserStore();
const router = useRouter();

const form = reactive({
  name: "",
  email: "",
  password: "",
});

const errors = reactive({
  name: "",
  email: "",
  password: "",
});

const message = ref("");
const success = ref(false);
const loading = ref(false);
const showPassword = ref(false); // Added for password visibility toggle

async function handleRegister() {
  errors.name = "";
  errors.email = "";
  errors.password = "";
  message.value = "";

  if (!form.name) errors.name = "Name is required";
  if (!form.email) errors.email = "Email is required";
  if (!form.password) errors.password = "Password istale required";

  if (Object.values(errors).some((error) => error)) return;

  loading.value = true;

  try {
    console.log("Sending registration request with:", { ...form });
    const response = await $fetch(`${config.public.apiBase}/auth/register`, {
      method: "POST",
      body: {
        name: form.name,
        email: form.email,
        password: form.password,
      },
      credentials: "include",
    });

    console.log("Registration response:", response);

    if (response.success) {
      message.value = response.message || "Registration successful!";
      success.value = true;

      const userEmail = form.email;
      console.log("Captured email for redirect:", userEmail);

      form.name = "";
      form.email = "";
      form.password = "";

      console.log("Attempting redirect to /verify-email with email:", userEmail);
      await router.push({ path: "/verify-email", query: { email: userEmail } });
      console.log("Redirect to /verify-email completed");
    } else {
      message.value = response.message || "Registration failed";
      success.value = false;
    }
  } catch (error) {
    console.error("Registration error:", error);
    message.value = error.data?.message || "An error occurred during registration";
    success.value = false;

    if (error.data?.message?.includes("Email already exists")) {
      errors.email = "This email is already registered";
    }
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  console.log("onMounted triggered");
  const isAuthenticated = await userStore.fetchUser();
  console.log("Is authenticated:", isAuthenticated);
  if (isAuthenticated) {
    console.log("Redirecting to / from onMounted");
    router.push("/");
  }
});
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
