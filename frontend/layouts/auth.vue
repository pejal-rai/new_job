<template>
  <div
    class="min-h-screen bg-cover bg-[#f5f1f1] bg-center"
  >

    <main class="flex-grow pt-8 container mx-auto">
      <slot />
    </main>
  </div>
</template>
<script setup>
import { useUserStore } from "~/stores/user";

const userStore = useUserStore();
const user = computed(() => userStore.user); // Safely access user
</script>
