<!-- pages/jobs.vue -->
<template>
  <div class="container mx-auto p-4">
    <!-- Hero Section -->
    <section
      class="bg-blue-600 bg-opacity-70 rounded-2xl shadow-lg text-white py-16 px-6 mb-12 text-center"
    >
      <h1 class="text-4xl md:text-5xl font-bold mb-4">Latest Job Openings</h1>
      <p class="text-lg md:text-xl mb-6">
        Explore the latest opportunities from top employers
      </p>
      <NuxtLink
        to="/"
        class="bg-white text-blue-700 font-bold py-2 px-6 rounded-full shadow hover:bg-gray-100 hover:scale-105 transition"
      >
        Back to Home
      </NuxtLink>
    </section>

    <!-- Loading and Error -->
    <div v-if="loading" class="text-center text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-500 text-center">{{ error }}</div>

    <div v-else class="space-y-16">
      <!-- Jobs Section -->
      <section>
        <h2 class="text-3xl font-bold text-gray-900 text-center mb-8">Available Jobs</h2>
        <div class="space-y-6">
          <NuxtLink
            v-for="work in filteredWorks"
            :key="work.id"
            :to="`/work/${work.id}`"
            class="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row justify-between items-start md:items-center hover:border-indigo-500 border transition"
          >
            <div class="flex items-start gap-4">
              <img
                v-if="work.image"
                :src="work.image"
                alt="Job Image"
                class="w-16 h-16 object-cover rounded-lg border"
                @error="onImageError(work.id, 'job')"
              />
              <div>
                <h3 class="text-xl font-semibold text-gray-900">{{ work.title }}</h3>
                <p class="text-indigo-600" v-if="work.company_name">
                  {{ work.company_name }}
                </p>
                <p class="text-gray-600 mt-1">
                  <strong>Position:</strong> {{ work.position }}
                </p>
                <p class="text-gray-600"><strong>Salary:</strong> Rs.{{ work.salary }}</p>
              </div>
            </div>
            <div class="text-sm text-gray-700 mt-4 md:mt-0 line-clamp-2 max-w-xl">
              <span class="font-semibold">Requirements: </span>
              <span v-html="work.requirement"></span>
            </div>
          </NuxtLink>
          <div v-if="filteredWorks.length === 0" class="text-center text-gray-500">
            No jobs found.
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useSearchStore } from "~/stores/search";

const works = ref([]);
const companies = ref([]);
const loading = ref(true);
const error = ref(null);
const config = useRuntimeConfig();
const searchStore = useSearchStore();

const staticBaseUrl = config.public.apiBase.includes("/api")
  ? config.public.apiBase.replace("/api", "")
  : config.public.apiBase;

definePageMeta({ layout: "default" });

const filteredWorks = computed(() => {
  const term = searchStore.searchTerm.toLowerCase().trim();
  const seenIds = new Set();
  return works.value
    .map((work) => {
      const company = companies.value.find((c) => c.id === work.company_id);
      return { ...work, company_name: company ? company.company_name : null };
    })
    .filter((work) => {
      if (seenIds.has(work.id)) return false;
      seenIds.add(work.id);
      return (
        !term ||
        work.title.toLowerCase().includes(term) ||
        (work.company_name && work.company_name.toLowerCase().includes(term))
      );
    });
});

onMounted(async () => {
  try {
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

    const workResponse = await $fetch(`${config.public.apiBase}/works`, {
      method: "GET",
      credentials: "include",
    });
    if (workResponse.success) {
      works.value = workResponse.works.map((work) => ({
        ...work,
        image: work.image ? `${staticBaseUrl}${work.image}` : null,
      }));
    } else {
      throw new Error(workResponse.message || "Failed to load job listings");
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

/* Optional: Stagger animation for job cards */
.container .space-y-6 > * {
  animation: fadeIn 0.5s ease-out;
  animation-delay: calc(0.1s * var(--index));
}
</style>
