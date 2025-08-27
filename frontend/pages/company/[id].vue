<template>
  <div class="container mx-auto p-4">
    <!-- Loading State -->
    <div v-if="loading" class="text-center text-gray-500">
      Loading company...
    </div>
    <!-- Error State -->
    <div v-else-if="error" class="text-red-500 text-center">{{ error }}</div>
    <!-- Company Details -->
    <div v-else-if="company" class="space-y-6">
      <h1 class="text-5xl mb-6 text-[#000000] ew">
        {{ company.company_name }}
      </h1>
      <div class="border rounded-lg shadow-md bg-white/75 p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          Company Information
        </h2>
        <p class="text-gray-600">
          <strong>Name:</strong> {{ company.company_name }}
        </p>
        <p v-if="company.address" class="text-gray-600">
          <strong>Address:</strong> {{ company.address }}
        </p>
        <p v-if="company.pan_no" class="text-gray-600">
          <strong>PAN No:</strong> {{ company.pan_no }}
        </p>
        <div v-if="company.logo" class="mt-2">
          <strong>Logo:</strong>
          <img
            :src="company.logo"
            alt="Company Logo"
            class="w-28 h-28 object-contain rounded border mt-1"
            @error="onImageError(company.id, 'logo')"
          />
        </div>
      </div>

      <!-- Job Listings -->
      <h2 class="text-3xl font-bold text-gray-900 mt-8">
        Jobs by {{ company.company_name }}
      </h2>
      <div class="grid grid-cols-1 gap-6">
        <NuxtLink
          v-for="work in companyJobs"
          :key="work.id"
          :to="`/work/${work.id}`"
          class="block border rounded-lg shadow-md hover:shadow-xl transition bg-white/45 overflow-hidden transform hover:-translate-y-1"
        >
          <div class="p-4">
            <div class="flex">
              <div v-if="work.image" class="mb-2 mr-2">
                <img
                  :src="work.image"
                  alt="Job Image"
                  class="w-28 mr-2 rounded-xl border"
                  @error="onImageError(work.id, 'job')"
                />
              </div>
              <div class="pt-8">
                <h3 class="text-2xl font-bold text-gray-900 truncate">
                  {{ work.title }}
                </h3>
              </div>
            </div>
            <div class="grid grid-cols-2">
              <p class="text-gray-600">
                <strong>Position:</strong> {{ work.position }}
              </p>
              <div class="text-gray-600 flex gap-1">
                <strong>Salary:</strong>
                <p style="text-decoration: underline">Rs.{{ work.salary }}</p>
              </div>
              <p v-if="company.address" class="text-gray-600 truncate">
                <strong>Address:</strong> {{ company.address }}
              </p>
              <p class="text-gray-600">
                <strong>Apply By:</strong>
                {{ new Date(work.end_date).toLocaleDateString() }}
              </p>
            </div>
            <span
              class="inline-block mt-3 text-blue-500 hover:underline text-sm font-medium"
            >
              View Details →
            </span>
          </div>
        </NuxtLink>
        <div
          v-if="companyJobs.length === 0"
          class="col-span-full text-center text-gray-500"
        >
          No jobs available for this company.
        </div>
      </div>
    </div>
    <div v-else class="text-center text-gray-500">Company not found.</div>
  </div>
</template>

<script setup>
import { useUserStore } from "~/stores/user";

const route = useRoute();
const company = ref(null);
const companyJobs = ref([]);
const loading = ref(true);
const error = ref(null);
const config = useRuntimeConfig();
const userStore = useUserStore();

definePageMeta({
  layout: "default",
});

const staticBaseUrl = config.public.apiBase.includes("/api")
  ? config.public.apiBase.replace("/api", "")
  : config.public.apiBase;

onMounted(async () => {
  try {
    const companyId = route.params.id;

    // Fetch company details
    const companyResponse = await $fetch(
      `${config.public.apiBase}/companies/${companyId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (companyResponse.success) {
      company.value = {
        ...companyResponse.company,
        logo: companyResponse.company.logo
          ? `${staticBaseUrl}${companyResponse.company.logo}`
          : null,
      };
    } else {
      throw new Error(companyResponse.message || "Company not found");
    }

    // Fetch jobs for the company using the new endpoint
    const workResponse = await $fetch(
      `${config.public.apiBase}/works/company/${companyId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (workResponse.success) {
      companyJobs.value = workResponse.works.map((work) => ({
        ...work,
        image: work.image ? `${staticBaseUrl}${work.image}` : null,
      }));
    } else {
      throw new Error(workResponse.message || "Failed to load jobs");
    }
  } catch (err) {
    error.value = err.data?.message || err.message || "An error occurred";
  } finally {
    loading.value = false;
  }
});

// Handle image loading error
const onImageError = (id, type) => {
  console.error(`Failed to load ${type} image for ${id}`);
};
</script>