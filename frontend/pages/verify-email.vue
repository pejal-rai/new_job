<!-- pages/verify-email.vue -->
<template>
  <div class="flex items-center justify-center">
    <div class="bg-white/60 p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-black mb-2">Verify Email</h1>

      <p class="text-center text-sm text-[#797676] mb-4">
        A verification code has been sent to {{ email }}. Please enter it below.
      </p>

      <form @submit.prevent="handleVerify" class="space-y-4">
        <div>
          <label for="code" class="block text-sm font-medium text-black"
            >Verification Code</label
          >
          <input
            v-model="form.code"
            type="text"
            id="code"
            class="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.code }"
            placeholder="Enter the 6-digit code"
          />
          <p v-if="errors.code" class="text-red-500 text-sm mt-1">{{ errors.code }}</p>
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          :disabled="loading"
        >
          {{ loading ? "Verifying..." : "Verify" }}
        </button>
      </form>

      <p
        v-if="message"
        class="mt-4 text-center"
        :class="{ 'text-green-500': success, 'text-red-500': !success }"
      >
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";

definePageMeta({ layout: "auth" });

const config = useRuntimeConfig();
const router = useRouter();
const route = useRoute();

const email = route.query.email || "";
const form = reactive({
  code: "",
});
const errors = reactive({
  code: "",
});
const message = ref("");
const success = ref(false);
const loading = ref(false);

async function handleVerify() {
  errors.code = "";
  message.value = "";

  if (!form.code) {
    errors.code = "Verification code is required";
    return;
  }

  loading.value = true;

  try {
    const response = await $fetch(`${config.public.apiBase}/auth/verify-email`, {
      method: "POST",
      body: {
        email,
        code: form.code,
      },
      credentials: "include",
    });

    if (response.success) {
      message.value = response.message;
      success.value = true;

      form.code = "";

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      message.value = response.message || "Verification failed";
      success.value = false;
    }
  } catch (error) {
    message.value = error.data?.message || "An error occurred during verification";
    success.value = false;
  } finally {
    loading.value = false;
  }
}
</script>
