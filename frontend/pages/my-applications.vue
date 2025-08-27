<template>
  <div class="container mx-auto p-6 min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="mb-8 text-center">
      <h1 class="text-4xl font-bold text-gray-900 md:text-5xl">My Applications</h1>
      <p class="mt-2 text-lg text-gray-600">
        Track your job applications and interview schedules
      </p>
    </header>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
      <div class="w-full sm:w-auto">
        <label for="statusFilter" class="block text-sm font-medium text-gray-700"
          >Filter by Status</label
        >
        <select
          v-model="statusFilter"
          id="statusFilter"
          class="mt-1 block w-full sm:w-48 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div class="w-full sm:w-auto">
        <label for="sortBy" class="block text-sm font-medium text-gray-700"
          >Sort By</label
        >
        <select
          v-model="sortBy"
          id="sortBy"
          class="mt-1 block w-full sm:w-48 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="title">Job Title</option>
        </select>
      </div>
    </div>

    <!-- Applications -->
    <div v-if="loading" class="text-center text-gray-500 text-lg animate-pulse">
      <svg class="animate-spin h-8 w-8 mx-auto text-blue-500" viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Loading your applications...
    </div>
    <div
      v-else-if="error"
      class="text-red-500 text-center text-lg bg-red-100 p-4 rounded-lg"
    >
      {{ error }}
    </div>
    <div v-else>
      <div
        v-if="filteredApplications.length === 0"
        class="text-center text-gray-500 text-lg bg-gray-100 p-4 rounded-lg"
      >
        No applications match your criteria. Explore
        <NuxtLink to="/" class="text-blue-500 hover:underline">job listings</NuxtLink> to
        apply!
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="app in filteredApplications"
          :key="app.id"
          class="bg-white shadow-lg rounded-xl p-6 transition-transform transform hover:-translate-y-1 hover:shadow-xl"
        >
          <NuxtLink
            :to="`/work/${app.work_id}`"
            class="text-2xl font-semibold text-gray-800 hover:text-blue-600 transition-colors"
          >
            {{ app.title || "Untitled Job" }}
          </NuxtLink>
          <p class="text-[#b74e2e] font-medium mt-1">
            {{ app.company_name || "Unknown Company" }}
          </p>
          <div v-if="app.image" class="mb-4">
            <img
              :src="app.image"
              :alt="app.title || 'Job image'"
              class="w-[30%] object-cover rounded-lg"
            />
          </div>
          <div class="mt-4 space-y-2">
            <p class="text-gray-600">
              <strong>Applicant:</strong> {{ app.name || "N/A" }}
            </p>
            <p class="text-gray-600"><strong>Email:</strong> {{ app.email || "N/A" }}</p>

            <p class="text-gray-600 flex items-center">
              <strong>Status:</strong>
              <span
                :class="{
                  'ml-2 px-2 py-1 rounded-full text-sm font-medium': true,
                  'bg-green-100 text-green-800': app.status === 'approved',
                  'bg-yellow-100 text-yellow-800': app.status === 'pending',
                  'bg-red-100 text-red-800': app.status === 'rejected',
                }"
              >
                {{
                  app.status
                    ? app.status.charAt(0).toUpperCase() + app.status.slice(1)
                    : "Unknown"
                }}
              </span>
            </p>
          </div>
          <div
            v-if="app.status === 'approved' && app.schedule_datetime"
            class="mt-4 text-gray-600"
          >
            <p>
              <strong>Scheduled Interview:</strong>
              <span
                v-if="isToday(app.schedule_datetime)"
                class="text-green-600 font-medium"
              >
                Today at {{ formatTime(app.schedule_datetime) }}!
              </span>
              <span v-else>
                {{ formatDate(app.schedule_datetime) }} at
                {{ formatTime(app.schedule_datetime) }} ({{
                  daysUntilMessage(app.schedule_datetime)
                }})
              </span>
            </p>
            <a
              v-if="
                app.status === 'approved' &&
                app.meet_link &&
                isToday(app.schedule_datetime) &&
                isWithinInterviewTime(app.schedule_datetime)
              "
              :href="app.meet_link"
              target="_blank"
              class="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Join Google Meet
            </a>
          </div>
          <div v-else-if="app.status === 'approved' && !app.schedule_datetime">
            <p class="mt-4 text-yellow-600">Interview not yet scheduled by employer.</p>
          </div>
          <!-- Add View Full Details Link -->
          <div class="mt-4">
            <NuxtLink
              :to="`/work/${app.work_id}`"
              class="inline-block text-blue-500 hover:underline text-sm font-medium"
            >
              View Full Details →
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Back Button -->
    <div class="mt-8 text-center">
      <NuxtLink
        to="/"
        class="inline-block bg-[#b78c36] text-white px-6 py-3 rounded-lg hover:bg-[#9b772f] transition-colors text-lg font-medium"
      >
        Back to Job Listings
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useUserStore } from "~/stores/user";
import { useRuntimeConfig } from "#app";

const userStore = useUserStore();
const config = useRuntimeConfig();
const applications = ref([]);
const loading = ref(true);
const error = ref(null);
const statusFilter = ref("");
const sortBy = ref("date-desc");
let pollInterval = null;

definePageMeta({
  layout: "default",
});

const staticBaseUrl = computed(() =>
  config.public.apiBase.includes("/api")
    ? config.public.apiBase.replace("/api", "")
    : config.public.apiBase
);

// Fetch user applications
const fetchApplications = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/applications`, {
      method: "GET",
      credentials: "include",
    });
    console.log("API response:", response);
    if (response.success) {
      applications.value = response.applications.map((app) => ({
        ...app,
        resume: app.resume ? `${staticBaseUrl.value}${app.resume}` : null,
        image: app.image ? `${staticBaseUrl.value}${app.image}` : null, // Added to prefix image URL
        company_name: app.company_name || "Unknown Company",
      }));
      console.log("Processed applications:", applications.value);
    } else {
      error.value = "Failed to load applications";
    }
  } catch (err) {
    error.value = err.data?.message || "An error occurred while fetching applications";
    console.error("Fetch error:", err);
  } finally {
    loading.value = false;
  }
};

// Computed property for filtered and sorted applications
const filteredApplications = computed(() => {
  let filtered = [...applications.value];

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter((app) => app.status === statusFilter.value);
  }

  // Sort
  return filtered.sort((a, b) => {
    if (sortBy.value === "date-desc") {
      return (
        new Date(b.schedule_datetime || "9999-12-31") -
        new Date(a.schedule_datetime || "9999-12-31")
      );
    } else if (sortBy.value === "date-asc") {
      return (
        new Date(a.schedule_datetime || "9999-12-31") -
        new Date(b.schedule_datetime || "9999-12-31")
      );
    } else if (sortBy.value === "title") {
      return (a.title || "").localeCompare(b.title || "");
    }
    return 0;
  });
});

// Formatting and time-based logic
const formatDate = (datetime) => {
  if (!datetime) return "Not scheduled";
  const date = new Date(datetime);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (datetime) => {
  if (!datetime) return "";
  const date = new Date(datetime);
  if (isNaN(date.getTime())) return "Invalid time";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const isToday = (scheduleDatetime) => {
  if (!scheduleDatetime) return false;
  const today = new Date();
  const scheduleDate = new Date(scheduleDatetime);
  return (
    today.getFullYear() === scheduleDate.getFullYear() &&
    today.getMonth() === scheduleDate.getMonth() &&
    today.getDate() === scheduleDate.getDate()
  );
};

const isWithinInterviewTime = (scheduleDatetime) => {
  if (!scheduleDatetime) return false;
  const now = new Date();
  const interviewTime = new Date(scheduleDatetime);
  const timeDiff = interviewTime - now;
  const minutesDiff = timeDiff / (1000 * 60);
  console.log("Debug isWithinInterviewTime:", {
    now: now.toISOString(),
    interviewTime: interviewTime.toISOString(),
    minutesDiff,
  });
  return minutesDiff >= -60 && minutesDiff <= 15;
};

const daysUntil = (scheduleDatetime) => {
  if (!scheduleDatetime) return 0;
  const today = new Date();
  const scheduleDate = new Date(scheduleDatetime);
  const diffTime = scheduleDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const daysUntilMessage = (scheduleDatetime) => {
  const days = daysUntil(scheduleDatetime);
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 0) return `${Math.abs(days)} days ago`;
  return `in ${days} days`;
};

// Lifecycle hooks
onMounted(async () => {
  if (!userStore.isAuthenticated || userStore.user?.role === "employer") {
    error.value = "Only authenticated job seekers can access this page";
    loading.value = false;
    return;
  }

  await fetchApplications();
  pollInterval = setInterval(fetchApplications, 5000);

  // Force reactivity for time-based button
  const timeInterval = setInterval(() => {
    applications.value = [...applications.value];
  }, 60000);
  return () => clearInterval(timeInterval);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>

<style scoped>
/* Tailwind handles most styling, but add custom animations if needed */
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
.container > div {
  animation: fadeIn 0.5s ease-out;
}
</style>
