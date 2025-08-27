<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-bold textblack] mb-6">Manage Your Jobs</h1>

    <!-- Loading State -->
    <div v-if="userStore.isLoading || loading" class="text-center text-gray-600">
      <p>Loading...</p>
    </div>

    <!-- Unauthorized State -->
    <div
      v-else-if="!userStore.isAuthenticated || !userStore.isEmployer()"
      class="text-center text-red-600"
    >
      <p>Only employers can manage jobs. Please log in as an employer.</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Create Job Button -->
      <div class="flex justify-end">
        <NuxtLink
          to="/employer/create_post"
          class="mb-6 bg-[#b78c36] text-white px-4 py-2 rounded hover:bg-[#9b772f] transition duration-200"
        >
          Create New Job
        </NuxtLink>
      </div>
      <!-- Job Listings -->
      <div v-if="jobs.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="job in jobs"
          :key="job.id"
          class="border px-10 py-4 rounded-lg shadow-md bg-white"
        >
          <div class="flex gap-5">
            <div v-if="job.image" class="mb-3">
              <img
                :src="job.image"
                alt="Job Image"
                class="h-24 rounded text-center"
                @error="onImageError(job.id)"
              />
            </div>
            <h3 class="text-3xl pt-5 font-bold text-gray-900">{{ job.title }}</h3>
          </div>
          <div class="flex gap-10">
            <p class="text-black"><strong>Position:</strong> {{ job.position }}</p>
            <p class="text-black"><strong>Salary:</strong> Rs.{{ job.salary }}</p>
          </div>
          <div
            class="text-black pt-2"
            v-html="`<strong>Requirements:</strong> ${job.requirement}`"
          ></div>
          <div
            class="text-black"
            v-html="`<strong>Description:</strong> ${job.description}`"
          ></div>
          <p class="text-black py-2">
            <strong>Apply Date:</strong>
            {{ new Date(job.apply_date).toLocaleDateString() }}
          </p>
          <p class="text-black">
            <strong>End Date:</strong> {{ new Date(job.end_date).toLocaleDateString() }}
          </p>

          <div class="mt-4 flex space-x-4">
            <NuxtLink
              :to="`/employer/post/${job.id}`"
              class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
            >
              Edit
            </NuxtLink>
            <button
              @click="deleteJob(job.id)"
              class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-white">
        <p>No jobs posted yet. Click "Create New Job" to get started!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "~/stores/user";

const config = useRuntimeConfig();
const router = useRouter();
const userStore = useUserStore();

const jobs = ref([]);
const loading = ref(false);

// Base URL for static assets (without /api)
const staticBaseUrl = config.public.apiBase.replace("/api", "");

// Fetch jobs on mount
onMounted(async () => {
  const success = await userStore.fetchUser();
  if (!success || !userStore.isEmployer()) {
    router.push("/");
  } else {
    await fetchJobs();
  }
});

// Fetch employer's jobs
const fetchJobs = async () => {
  loading.value = true;
  try {
    const response = await $fetch(`${config.public.apiBase}/works`, {
      method: "GET",
      credentials: "include",
    });
    if (response.success) {
      console.log("Raw works from backend:", response.works);
      jobs.value = response.works
        .filter((job) => job.user_id === userStore.user.id)
        .map((job) => ({
          ...job,
          image: job.image ? `${staticBaseUrl}${job.image}` : null, // Use static base URL
        }));
    } else {
      console.error("Failed to fetch jobs:", response.message);
    }
  } catch (error) {
    console.error("Fetch jobs error:", error);
  } finally {
    loading.value = false;
  }
};

// Delete job
const deleteJob = async (id) => {
  if (confirm("Are you sure you want to delete this job?")) {
    try {
      const response = await $fetch(`${config.public.apiBase}/works/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.success) {
        alert("Job deleted successfully!");
        await fetchJobs();
      } else {
        alert(`Failed to delete job: ${response.message || "Unknown error"}`);
      }
    } catch (error) {
      const errorMessage = error.data?.message || error.message || "Unknown error";
      alert(`Error deleting job: ${errorMessage}`);
    }
  }
};

// Handle image loading error
const onImageError = (jobId) => {
  console.error(`Failed to load image for job ${jobId}`);
};
</script>
