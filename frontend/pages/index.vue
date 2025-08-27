<!-- pages/index.vue -->
<template>
  <div class="container mx-auto p-4">
    <!-- Hero Section -->
    <section
      class="bg-blue-600 bg-opacity-70 rounded-2xl shadow-lg text-white py-16 px-6 mb-12 text-center"
    >
      <h1 class="text-4xl md:text-5xl font-bold mb-4">
        Join the Next Generation of Job Hunters
      </h1>
      <p class="text-lg md:text-xl mb-6">Upload your CV and let top employers find you</p>
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <NuxtLink
          to="/cv"
          class="bg-white text-blue-700 font-bold py-2 px-6 rounded-full shadow hover:bg-gray-100 hover:scale-105 transition"
        >
          Create CV
        </NuxtLink>
        <NuxtLink
          v-if="userStore.isAuthenticated && userStore.user?.role === 'user'"
          to="/employer/apply"
          class="bg-yellow-400 text-white font-bold py-2 px-6 rounded-full shadow hover:bg-yellow-500 transition"
        >
          Become an Employer
        </NuxtLink>
      </div>
    </section>

    <!-- Loading and Error -->
    <div v-if="loading" class="text-center text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-500 text-center">{{ error }}</div>

    <div v-else class="space-y-16">
      <!-- Companies Section -->
      <section>
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-8">
          Top Companies Hiring
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <NuxtLink
            v-for="company in filteredCompanies"
            :key="company.id"
            :to="`/company/${company.id}`"
            class="bg-white rounded-2xl shadow-md p-6 text-center hover:scale-105 transition border border-gray-200"
          >
            <img
              :src="company.logo"
              alt="Company Logo"
              class="h-20 w-full object-contain mb-4"
              @error="onImageError(company.id, 'logo')"
            />
            <h3 class="text-xl font-semibold mb-1">{{ company.company_name }}</h3>
            <p class="text-gray-500" v-if="company.address">{{ company.address }}</p>
          </NuxtLink>
          <div
            v-if="filteredCompanies.length === 0"
            class="col-span-full text-center text-gray-500"
          >
            No companies found.
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useSearchStore } from "~/stores/search";
import { useUserStore } from "~/stores/user";

const companies = ref([]);
const loading = ref(true);
const error = ref(null);
const config = useRuntimeConfig();
const searchStore = useSearchStore();
const userStore = useUserStore();

const staticBaseUrl = config.public.apiBase.includes("/api")
  ? config.public.apiBase.replace("/api", "")
  : config.public.apiBase;

definePageMeta({ layout: "default" });

const filteredCompanies = computed(() => {
  const term = searchStore.searchTerm.toLowerCase().trim();
  return !term
    ? companies.value
    : companies.value.filter((company) =>
        company.company_name.toLowerCase().includes(term)
      );
});

onMounted(async () => {
  try {
    await userStore.fetchUser();
    const companyResponse = await $fetch(`${config.public.apiBase}/companies/all`, {
      method: "GET",
      credentials: "include",
    });
    if (companyResponse.success) {
      companies.value = companyResponse.companies.map((company) => ({
        ...company,
        logo: company.logo ? `${staticBaseUrl}${company.logo}` : null,
      }));
    } else {
      throw new Error(companyResponse.message || "Failed to load companies");
    }
  } catch (err) {
    error.value =
      err.data?.message || err.message || "An error occurred while fetching data";
  } finally {
    loading.value = false;
  }
});

const onImageError = (id, type) => {
  console.error(`Failed to load ${type} image for ${id}`);
};
</script>

<style scoped>
.container {
  max-width: 1400px;
}

/* Add fadeIn animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Apply animation to container's direct children */
.container > * {
  animation: fadeIn 0.5s ease-out;
}

/* Optional: Stagger animation for company cards */
.container .grid > * {
  animation: fadeIn 0.5s ease-out;
  animation-delay: calc(0.1s * var(--index));
}
</style>
