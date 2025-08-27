```vue
<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Manage Applications</h1>

    <div v-if="loading" class="text-center text-gray-500">Loading applications...</div>
    <div v-else-if="error" class="text-red-500 text-center">{{ error }}</div>
    <div v-else>
      <div v-if="applications.length === 0" class="text-center text-gray-500">
        No applications found.
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="app in applications"
          :key="app.id"
          class="bg-white/75 shadow-md rounded-lg p-4"
        >
          <h2 class="text-xl font-semibold text-gray-800">{{ app.title }}</h2>
          <p class="text-gray-600"><strong>Applicant:</strong> {{ app.name }}</p>
          <p class="text-gray-600"><strong>Email:</strong> {{ app.email }}</p>
          <p v-if="app.resume" class="text-gray-600">
            <strong>Resume:</strong>
            <a :href="app.resume" target="_blank" class="text-blue-500 hover:underline"
              >Download</a
            >
          </p>
          <p class="text-gray-600"><strong>Status:</strong> {{ app.status }}</p>
          <div class="mt-4 flex gap-2 flex-wrap">
            <select
              v-model="app.status"
              @change="updateStatus(app.id, $event.target.value)"
              class="border p-1 rounded"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              v-if="app.status === 'approved'"
              @click="openScheduleModal(app)"
              class="bg-green-500 text-white p-1 rounded hover:bg-green-600"
            >
              {{ app.schedule_datetime ? "Edit Schedule" : "Add Schedule" }}
            </button>
            <a
              v-if="
                app.status === 'approved' &&
                app.meet_link &&
                isToday(app.schedule_datetime) &&
                isWithinInterviewTime(app.schedule_datetime)
              "
              :href="app.meet_link"
              target="_blank"
              class="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
            >
              Join Google Meet
            </a>
          </div>
          <p
            v-if="app.status === 'approved' && app.schedule_datetime"
            class="text-gray-600 mt-2"
          >
            <strong>Scheduled:</strong>
            <span v-if="isToday(app.schedule_datetime)" class="text-green-600">
              Interview is today at {{ formatTime(app.schedule_datetime) }}!
            </span>
            <span v-else>
              Your Google Meet interview will be at
              {{ formatDate(app.schedule_datetime) }} at
              {{ formatTime(app.schedule_datetime) }} ({{
                daysUntilMessage(app.schedule_datetime)
              }})
            </span>
            <br />
          </p>
          <p
            v-if="app.meet_link && !isToday(app.schedule_datetime)"
            class="text-gray-600 mt-2"
          >
            <strong>Meet Link:</strong> {{ app.meet_link }}
          </p>
        </div>
      </div>
    </div>

    <!-- Schedule Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">
          {{
            selectedApplication?.schedule_datetime
              ? "Edit Interview Schedule"
              : "Add Interview Schedule"
          }}
        </h2>
        <form @submit.prevent="saveSchedule" class="space-y-4">
          <div>
            <label class="block text-gray-600 font-medium">Interview Date & Time</label>
            <input
              v-model="scheduleForm.datetime"
              type="datetime-local"
              class="w-full border border-gray-300 p-2 rounded"
              required
            />
          </div>
          <div>
            <label class="block text-gray-600 font-medium">Google Meet Link</label>
            <div class="flex gap-2">
              <input
                v-model="scheduleForm.meetLink"
                type="url"
                class="w-full border border-gray-300 p-2 rounded"
                placeholder="https://meet.google.com/..."
                required
              />
              <a
                href="https://meet.google.com/new"
                target="_blank"
                class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Add Google Meet
              </a>
            </div>
          </div>
          <div class="flex gap-4">
            <button
              v-if="!selectedApplication?.schedule_datetime"
              type="submit"
              class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              :disabled="isSubmitting"
            >
              Save
            </button>
            <button
              v-if="selectedApplication?.schedule_datetime"
              type="submit"
              class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              :disabled="isSubmitting"
            >
              Update
            </button>
            <button
              v-if="selectedApplication?.schedule_datetime"
              type="button"
              @click="deleteSchedule"
              class="bg-red-500 text-white p-2 rounded hover:bg-red-600"
              :disabled="isSubmitting"
            >
              Delete
            </button>
            <button
              type="button"
              @click="closeScheduleModal"
              class="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <NuxtLink
      to="/"
      class="mt-6 inline-block bg-[#b78c36] text-white px-6 py-2 rounded-lg hover:bg-[#9b772f]"
    >
      Back to Listings
    </NuxtLink>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { useUserStore } from "~/stores/user";
import { useRuntimeConfig } from "#app";

const userStore = useUserStore();
const config = useRuntimeConfig();
const applications = ref([]);
const loading = ref(true);
const error = ref(null);
const showModal = ref(false);
const selectedApplication = ref(null);
const isSubmitting = ref(false);

const scheduleForm = reactive({
  datetime: "",
  meetLink: "",
});

definePageMeta({
  layout: "default",
});

const staticBaseUrl = config.public.apiBase.includes("/api")
  ? config.public.apiBase.replace("/api", "")
  : config.public.apiBase;

onMounted(async () => {
  if (!userStore.isAuthenticated || userStore.user?.role !== "employer") {
    error.value = "Only employers can access this page";
    loading.value = false;
    return;
  }

  await fetchApplications();
});

const fetchApplications = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/applications/employer`, {
      method: "GET",
      credentials: "include",
    });
    if (response.success) {
      applications.value = response.applications.map((app) => ({
        ...app,
        resume: app.resume ? `${staticBaseUrl}${app.resume}` : null,
      }));
    } else {
      error.value = "Failed to load applications";
    }
  } catch (err) {
    error.value = err.data?.message || "An error occurred while fetching applications";
  } finally {
    loading.value = false;
  }
};

const formatDate = (datetime) => {
  if (!datetime) return "";
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

const formatExpectedTime = (datetime) => {
  if (!datetime) return "";
  const date = new Date(datetime);
  if (isNaN(date.getTime())) return "Invalid time";
  return (
    date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    }) + " UTC"
  );
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
  const timeDiff = interviewTime - now; // Difference in milliseconds
  const minutesDiff = timeDiff / (1000 * 60); // Convert to minutes
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

const updateStatus = async (applicationId, newStatus) => {
  try {
    const response = await $fetch(
      `${config.public.apiBase}/applications/status/${applicationId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    if (response.success) {
      alert("Status updated successfully!");
      await fetchApplications();
    } else {
      alert("Failed to update status");
    }
  } catch (err) {
    alert(`Error: ${err.data?.message || "Unknown error"}`);
  }
};

const openScheduleModal = (app) => {
  selectedApplication.value = app;
  if (app.schedule_datetime) {
    console.log("Raw schedule_datetime:", app.schedule_datetime);
    const date = new Date(app.schedule_datetime);
    console.log("Parsed date:", date);
    console.log("Local time zone offset:", date.getTimezoneOffset(), "minutes");
    if (isNaN(date.getTime())) {
      console.error("Invalid schedule_datetime:", app.schedule_datetime);
      scheduleForm.datetime = "";
    } else {
      // Format for datetime-local in local time zone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      scheduleForm.datetime = `${year}-${month}-${day}T${hours}:${minutes}`;
      console.log("Formatted scheduleForm.datetime:", scheduleForm.datetime);
    }
  } else {
    scheduleForm.datetime = "";
  }
  scheduleForm.meetLink = app.meet_link || "";
  showModal.value = true;
};

const closeScheduleModal = () => {
  showModal.value = false;
  selectedApplication.value = null;
};

const saveSchedule = async () => {
  isSubmitting.value = true;
  console.log("Saving schedule with datetime:", scheduleForm.datetime);
  try {
    const response = await $fetch(
      `${config.public.apiBase}/applications/status/${selectedApplication.value.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: "approved",
          scheduleDatetime: scheduleForm.datetime,
          meetLink: scheduleForm.meetLink,
        }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    if (response.success) {
      selectedApplication.value.schedule_datetime = scheduleForm.datetime;
      selectedApplication.value.meet_link = scheduleForm.meetLink;
      await fetchApplications();
      alert("Interview schedule saved/updated successfully!");
      closeScheduleModal();
    } else {
      alert(`Failed to save schedule: ${response.message || "Unknown error"}`);
    }
  } catch (err) {
    console.error("Save schedule error:", err);
    alert(`Error: ${err.data?.message || err.message || "Unknown error"}`);
  } finally {
    isSubmitting.value = false;
  }
};

const deleteSchedule = async () => {
  if (!confirm("Are you sure you want to delete this schedule?")) return;
  isSubmitting.value = true;
  try {
    const response = await $fetch(
      `${config.public.apiBase}/applications/status/${selectedApplication.value.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: "approved",
          scheduleDatetime: null,
          meetLink: null,
        }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    if (response.success) {
      selectedApplication.value.schedule_datetime = null;
      selectedApplication.value.meet_link = null;
      await fetchApplications();
      alert("Schedule deleted successfully!");
      closeScheduleModal();
    } else {
      alert("Failed to delete schedule");
    }
  } catch (err) {
    alert(`Error: ${err.data?.message || err.message || "Unknown error"}`);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
```
