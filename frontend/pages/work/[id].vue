```vue
<template>
  <div>
    <div class="container mx-auto p-6">
      <div v-if="loading" class="text-center text-gray-500">Loading job details...</div>
      <div v-else-if="error" class="text-red-500 text-center">{{ error }}</div>
      <div v-else class="space-y-8">
        <!-- Job Details and Application Form -->
        <div class="flex gap-4">
          <div class="bg-white/75 shadow-lg rounded-lg p-8 flex-1">
            <div class="flex items-center mb-6 justify-center">
              <div v-if="job.image" class="mr-4">
                <img
                  :src="job.image"
                  alt="Job Image"
                  class="w-36 object-contain rounded-full border"
                  @error="onImageError"
                />
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ job.title }}</h1>
                <p v-if="job.company_name" class="mb-2 text-[#b74e2e]">
                  {{ job.company_name }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="text-gray-700 mb-2">
                  <strong>Position:</strong> {{ job.position }}
                </p>
                <p class="text-gray-700 mb-2">
                  <strong>Salary:</strong> Rs.{{ job.salary }}
                </p>
                <p v-if="job.address" class="text-gray-700 mb-2">
                  <strong>Address:</strong> {{ job.address }}
                </p>
              </div>
              <div>
                <p class="text-gray-700 mb-2">
                  <strong>Apply Date:</strong>
                  {{ new Date(job.apply_date).toLocaleDateString() }}
                </p>
                <p class="text-gray-700 mb-2">
                  <strong>End Date:</strong>
                  {{ new Date(job.end_date).toLocaleDateString() }}
                </p>
              </div>
            </div>
            <div class="mt-6">
              <h2 class="text-xl font-semibold text-gray-800 mb-2">Requirements</h2>
              <div class="text-gray-700 prose prose-sm" v-html="job.requirement"></div>
            </div>
            <div class="mt-6">
              <h2 class="text-xl font-semibold text-gray-800 mb-2">Description</h2>
              <div class="text-gray-700 prose prose-sm" v-html="job.description"></div>
            </div>
          </div>
          <div class="bg-white/75 shadow-lg rounded-lg p-8 w-96">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Apply for this Job</h2>
            <form
              @submit.prevent="
                applicationSubmitted || existingApplication
                  ? editApplication()
                  : submitApplication()
              "
              class="space-y-4"
            >
              <div>
                <label class="block text-gray-600 font-medium">Full Name</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isSubmitting || applicationStatus === 'approved'"
                  required
                />
              </div>
              <div>
                <label class="block text-gray-600 font-medium">Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isSubmitting || applicationStatus === 'approved'"
                  required
                />
              </div>
              <div>
                <label class="block text-gray-600 font-medium">Resume (PDF only)</label>
                <input
                  type="file"
                  @change="onFileChange"
                  accept="application/pdf"
                  class="w-full border border-gray-300 p-2 rounded"
                  :disabled="isSubmitting || applicationStatus === 'approved'"
                />
                <p v-if="form.resume" class="text-gray-500 text-sm mt-1">
                  {{ form.resume.name }}
                </p>
              </div>
              <div v-if="applicationSubmitted || existingApplication" class="flex gap-4">
                <button
                  v-if="applicationStatus !== 'approved'"
                  type="submit"
                  class="w-full bg-[#198319] text-white p-2 rounded hover:bg-[#257625] transition duration-200"
                  :disabled="isSubmitting"
                >
                  Update
                </button>
                <button
                  type="button"
                  @click="deleteApplication"
                  class="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 transition duration-200"
                  :disabled="isSubmitting"
                >
                  Delete
                </button>
              </div>
              <button
                v-else
                type="submit"
                class="w-full bg-[#b78c36] text-white p-2 rounded hover:bg-[#9b772f] transition duration-200"
                :disabled="isSubmitting"
              >
                Submit Application
              </button>
            </form>
            <div v-if="existingApplication" class="mt-4 text-gray-700">
              <p><strong>Application Status:</strong> {{ applicationStatus }}</p>
              <div v-if="applicationStatus === 'approved' && scheduleDatetime">
                <p v-if="isToday" class="text-green-600">
                  Your interview is today at {{ formatTime(scheduleDatetime) }}!
                  <a
                    v-if="meetLink && isWithinInterviewTime(scheduleDatetime)"
                    :href="meetLink"
                    target="_blank"
                    class="bg-blue-500 text-white p-2 rounded ml-2 inline-block"
                  >
                    Join Google Meet
                  </a>
                </p>
                <p v-else class="text-gray-600">
                  Your Google Meet interview will be at
                  {{ formatDate(scheduleDatetime) }} at
                  {{ formatTime(scheduleDatetime) }} ({{ daysUntilMessage }})
                </p>
               
              </div>
              <div v-else-if="applicationStatus === 'approved' && !scheduleDatetime">
                <p class="text-yellow-600">Interview not yet scheduled by employer.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recommended Jobs Section -->
        <div class="mt-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Recommended Jobs</h2>
          <div v-if="recommendedLoading" class="text-center text-gray-500">
            Loading recommended jobs...
          </div>
          <div v-else-if="recommendedError" class="text-red-500 text-center">
            {{ recommendedError }}
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NuxtLink
              v-for="recJob in recommendedJobs"
              :key="recJob.id"
              :to="`/work/${recJob.id}`"
              class="block border rounded-lg shadow-md hover:shadow-xl transition bg-white/75 overflow-hidden transform hover:-translate-y-1"
            >
              <div class="p-4">
                <div class="flex">
                  <div v-if="recJob.image" class="mb-2 mr-2">
                    <img
                      :src="recJob.image"
                      alt="Job Image"
                      class="w-28 mr-2 rounded-xl border"
                      @error="onImageError(recJob.id, 'recommended')"
                    />
                  </div>
                  <div class="pt-8">
                    <h3 class="text-2xl font-bold text-gray-900 truncate">
                      {{ recJob.title }}
                    </h3>
                    <p
                      v-if="recJob.company_name"
                      class="text-[#b74e2e] font-semibold pb-2"
                    >
                      {{ recJob.company_name }}
                    </p>
                  </div>
                </div>
                <p class="text-gray-600">
                  <strong>Position:</strong> {{ recJob.position }}
                </p>
                <div class="text-gray-600 flex gap-1">
                  <strong>Salary:</strong>
                  <p style="text-decoration: underline">Rs.{{ recJob.salary }}</p>
                </div>
                <p v-if="recJob.address" class="text-gray-600 truncate">
                  <strong>Address:</strong> {{ recJob.address }}
                </p>
                <p class="text-gray-600">
                  <strong>Apply By:</strong>
                  {{ new Date(recJob.end_date).toLocaleDateString() }}
                </p>
                <span
                  class="inline-block mt-3 text-blue-500 hover:underline text-sm font-medium"
                  >View Details →</span
                >
              </div>
            </NuxtLink>
            <div
              v-if="recommendedJobs.length === 0"
              class="col-span-full text-center text-gray-500"
            >
              No recommended jobs available.
            </div>
          </div>
        </div>

        <!-- Back to Listings -->
        <div class="mt-8">
          <NuxtLink
            to="/"
            class="inline-block bg-[#b78c36] text-white px-6 py-2 rounded-lg hover:bg-[#9b772f] transition duration-200"
          >
            Back to Listings
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Chat Interface for Authenticated Users -->
    <ClientOnly>
      <div v-if="userStore.user" class="chat-container">
        <div v-if="!isChatOpen" class="chat-button" @click="openChat">
          <svg
            v-if="!fontAwesomeLoaded"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <i v-else class="fas fa-comments"></i>
        </div>
        <div v-else class="chat-window">
          <div class="chat-header">
            <h3 class="text-lg font-semibold">Chat with Employer</h3>
            <button @click="isChatOpen = false" class="text-white">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="chat-body" ref="chatBody">
            <div
              v-for="message in messages"
              :key="message.id"
              :class="[
                'chat-message',
                message.sender_id === userStore.user.id ? 'user' : 'ai',
              ]"
            >
              <strong>{{ message.sender_name }}:</strong> {{ message.message }}
              <p class="text-xs text-gray-400 mt-1">
                {{ formatMessageDate(message.created_at) }}
              </p>
            </div>
            <div v-if="chatLoading" class="chat-message ai">Typing...</div>
          </div>
          <div class="chat-footer">
            <input
              v-model="chatInput"
              @keyup.enter="sendMessage"
              type="text"
              placeholder="Type a message..."
              class="chat-input"
              :disabled="chatLoading"
            />
            <button
              @click="sendMessage"
              class="chat-send"
              :disabled="chatLoading || !chatInput.trim()"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from "vue";
import { useRoute, useRuntimeConfig, useNuxtApp } from "#app";
import { useUserStore } from "~/stores/user";

const { $socket } = useNuxtApp();
const userStore = useUserStore();
const route = useRoute();
const config = useRuntimeConfig();

const job = ref(null);
const loading = ref(true);
const error = ref(null);
const applicationSubmitted = ref(false);
const applicationId = ref(null);
const existingApplication = ref(false);
const recommendedJobs = ref([]);
const recommendedLoading = ref(true);
const recommendedError = ref(null);
const messages = ref([]);
const isChatOpen = ref(false);
const chatInput = ref("");
const chatLoading = ref(false);
const chatBody = ref(null);
const fontAwesomeLoaded = ref(false);
const debugMode = ref(true);
let socket = null;

const applicationStatus = ref("pending");
const scheduleDatetime = ref(null);
const meetLink = ref(null);

const form = reactive({
  name: "",
  email: "",
  resume: null,
});

const isSubmitting = ref(false);
let pollInterval = null;

definePageMeta({
  layout: "default",
});

const staticBaseUrl = computed(() =>
  config.public.apiBase.includes("/api")
    ? config.public.apiBase.replace("/api", "")
    : config.public.apiBase
);

// Computed properties for application scheduling
const isToday = computed(() => {
  if (!scheduleDatetime.value) return false;
  const today = new Date();
  const scheduleDate = new Date(scheduleDatetime.value);
  return (
    today.getFullYear() === scheduleDate.getFullYear() &&
    today.getMonth() === scheduleDate.getMonth() &&
    today.getDate() === scheduleDate.getDate()
  );
});

const isWithinInterviewTime = (scheduleDatetime) => {
  if (!scheduleDatetime) return false;
  const now = new Date();
  const interviewTime = new Date(scheduleDatetime);
  console.log("Debug isWithinInterviewTime:", {
    now: now.toISOString(),
    interviewTime: interviewTime.toISOString(),
    scheduleDatetime,
  });
  const timeDiff = interviewTime - now; // Difference in milliseconds
  const minutesDiff = timeDiff / (1000 * 60); // Convert to minutes
  console.log("Time difference (minutes):", minutesDiff);
  return minutesDiff >= -60 && minutesDiff <= 15;
};

const daysUntil = computed(() => {
  if (!scheduleDatetime.value) return 0;
  const today = new Date();
  const scheduleDate = new Date(scheduleDatetime.value);
  const diffTime = scheduleDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const daysUntilMessage = computed(() => {
  const days = daysUntil.value;
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 0) return `${Math.abs(days)} days ago`;
  return `in ${days} days`;
});

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

const formatMessageDate = (datetime) => {
  return new Date(datetime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Fetch job details
const fetchJobDetails = async () => {
  try {
    const jobResponse = await $fetch(
      `${config.public.apiBase}/works/${route.params.id}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (jobResponse.success) {
      job.value = {
        ...jobResponse.work,
        image: jobResponse.work.image
          ? `${staticBaseUrl.value}${jobResponse.work.image}`
          : null,
      };
    } else {
      error.value = "Failed to load job details";
    }
  } catch (err) {
    error.value =
      err.data?.message || err.message || "An error occurred while fetching data";
  }
};

// Fetch application status
const fetchApplicationStatus = async () => {
  try {
    const appResponse = await $fetch(`${config.public.apiBase}/applications`, {
      method: "GET",
      credentials: "include",
      query: { work_id: route.params.id },
    });
    if (appResponse.success && appResponse.application) {
      existingApplication.value = true;
      applicationId.value = appResponse.application.id;
      form.name = appResponse.application.name;
      form.email = appResponse.application.email;
      applicationStatus.value = appResponse.application.status || "pending";
      scheduleDatetime.value =
        appResponse.application.schedule_datetime ||
        appResponse.application.scheduleDatetime ||
        null;
      meetLink.value =
        appResponse.application.meet_link || appResponse.application.meetLink || null;
      if (appResponse.application.resume) {
        form.resume = { name: appResponse.application.resume.split("/").pop() };
      }
      console.log("Application status fetched:", {
        status: applicationStatus.value,
        scheduleDatetime: scheduleDatetime.value,
        meetLink: meetLink.value,
      });
    } else {
      existingApplication.value = false;
      applicationStatus.value = "pending";
      scheduleDatetime.value = null;
      meetLink.value = null;
      form.resume = null;
    }
  } catch (err) {
    console.error("Error fetching application status:", err);
  }
};

// Fetch recommended jobs
const fetchRecommendedJobs = async () => {
  try {
    recommendedLoading.value = true;
    const response = await $fetch(`${config.public.apiBase}/works`, {
      method: "GET",
      credentials: "include",
    });
    if (response.success) {
      recommendedJobs.value = response.works
        .filter((work) => work.id !== Number(route.params.id))
        .slice(0, 3)
        .map((work) => ({
          ...work,
          image: work.image ? `${staticBaseUrl.value}${work.image}` : null,
        }));
    } else {
      recommendedError.value = "Failed to load recommended jobs";
    }
  } catch (err) {
    recommendedError.value =
      err.data?.message ||
      err.message ||
      "An error occurred while fetching recommended jobs";
  } finally {
    recommendedLoading.value = false;
  }
};

// Fetch chat history
const fetchChatHistory = async () => {
  try {
    const response = await $fetch(
      `${config.public.apiBase}/chat/history/${route.params.id}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (response.success) {
      messages.value = response.messages;
    } else {
      console.error("Failed to fetch chat history:", response.message);
    }
  } catch (err) {
    console.error("Error fetching chat history:", err);
  }
};

// Open chat and initialize Socket.IO
const openChat = async () => {
  isChatOpen.value = true;
  await fetchChatHistory();
  socket = $socket;
  socket.connect();

  socket.on("connect", () => {
    console.log("Connected to Socket.IO server");
    socket.emit("joinChat", { workId: route.params.id, userId: userStore.user.id });
  });

  socket.on("receiveMessage", (message) => {
    messages.value.push(message);
    setTimeout(() => {
      if (chatBody.value) {
        chatBody.value.scrollTop = chatBody.value.scrollHeight;
      }
    }, 0);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err);
    alert("Failed to connect to chat server");
    isChatOpen.value = false;
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
    alert(`Chat error: ${err.message || "Unknown error"}`);
  });
};

// Send chat message
const sendMessage = async () => {
  if (!chatInput.value.trim() || chatLoading.value) return;

  chatLoading.value = true;
  const message = chatInput.value;
  chatInput.value = "";

  try {
    if (!socket.connected) {
      console.error("Socket not connected");
      throw new Error("Chat server not connected");
    }

    console.log("Sending message:", {
      workId: route.params.id,
      senderId: userStore.user.id,
      message,
    });

    socket.emit("sendMessage", {
      workId: route.params.id,
      senderId: userStore.user.id,
      message,
    });
  } catch (err) {
    console.error("Error sending message:", {
      message: err.message,
      status: err.status,
      data: err.data,
      response: err.response,
    });
    alert(`Failed to send message: ${err.message || "Unknown error"}`);
  } finally {
    chatLoading.value = false;
  }
};

// Handle file input for resume
const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.type === "application/pdf") {
    form.resume = file;
  } else {
    alert("Please upload a PDF file.");
    form.resume = null;
    event.target.value = "";
  }
};

// Submit job application
const submitApplication = async () => {
  isSubmitting.value = true;
  try {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    if (form.resume) formData.append("resume", form.resume);
    formData.append("work_id", route.params.id);

    const response = await $fetch(`${config.public.apiBase}/applications`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (response.success) {
      applicationSubmitted.value = true;
      applicationId.value = response.applicationId;
      await fetchApplicationStatus();
      alert("Application submitted successfully!");
    } else {
      alert(`Failed to submit application: ${response.message || "Unknown error"}`);
    }
  } catch (err) {
    alert(`Error: ${err.data?.message || err.message || "Unknown error"}`);
  } finally {
    isSubmitting.value = false;
  }
};

// Edit job application
const editApplication = async () => {
  isSubmitting.value = true;
  try {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    if (form.resume) formData.append("resume", form.resume);

    const response = await $fetch(
      `${config.public.apiBase}/applications/${applicationId.value}`,
      {
        method: "PUT",
        body: formData,
        credentials: "include",
      }
    );

    if (response.success) {
      await fetchApplicationStatus();
      alert("Application updated successfully!");
    } else {
      alert(`Failed to update application: ${response.message || "Unknown error"}`);
    }
  } catch (err) {
    alert(`Error: ${err.data?.message || err.message || "Unknown error"}`);
  } finally {
    isSubmitting.value = false;
  }
};

// Delete job application
const deleteApplication = async () => {
  if (!confirm("Are you sure you want to delete your application?")) return;
  try {
    const response = await $fetch(
      `${config.public.apiBase}/applications/${applicationId.value}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    if (response.success) {
      applicationSubmitted.value = false;
      existingApplication.value = false;
      applicationId.value = null;
      form.name = "";
      form.email = "";
      form.resume = null;
      applicationStatus.value = "pending";
      scheduleDatetime.value = null;
      meetLink.value = null;
      alert("Application deleted successfully!");
    } else {
      alert(`Failed to delete application: ${response.message || "Unknown error"}`);
    }
  } catch (err) {
    alert(`Error: ${err.data?.message || err.message || "Unknown error"}`);
  }
};

// Handle image loading errors
const onImageError = (id, type = "job") => {
  console.error(`Failed to load ${type} image for job ${id}`);
};

// Check Font Awesome
const checkFontAwesome = () => {
  const faScript = document.querySelector('script[src*="font-awesome"]');
  fontAwesomeLoaded.value = !!faScript && typeof window.FontAwesome !== "undefined";
  console.log("Font Awesome loaded:", fontAwesomeLoaded.value);
};

// Lifecycle hooks
onMounted(async () => {
  console.log("userStore.user:", userStore.user);
  console.log("isChatOpen:", isChatOpen.value);
  checkFontAwesome();

  try {
    await Promise.all([
      fetchJobDetails(),
      fetchApplicationStatus(),
      fetchRecommendedJobs(),
    ]);
    pollInterval = setInterval(fetchApplicationStatus, 5000);
  } catch (err) {
    error.value =
      err.data?.message || err.message || "An error occurred while fetching data";
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
  if (socket) socket.disconnect();
});
</script>

<style scoped>
.prose ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}
.prose li {
  margin-bottom: 0.5rem;
}

/* Chat styles */
.chat-container {
  position: fixed;
  bottom: 50px;
  right: 50px;
  z-index: 9999;
}

.chat-button {
  background-color: #b78c36;
  color: white;
  padding: 12px;
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  font-size: 24px;
}

.chat-button:hover {
  transform: scale(1.1);
}

.chat-window {
  width: 350px;
  height: 500px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background-color: #b78c36;
  color: white;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-body {
  flex-grow: 1;
  padding: 12px;
  overflow-y: auto;
  background-color: #f5f5f5;
}

.chat-message {
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 80%;
  word-wrap: break-word;
}

.chat-message.user {
  background-color: #b78c36;
  color: white;
  margin-left: auto;
}

.chat-message.ai {
  background-color: #e0e0e0;
  color: black;
  margin-right: auto;
}

.chat-footer {
  padding: 12px;
  border-top: 1px solid #ddd;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
}

.chat-send {
  background-color: #b78c36;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-send:hover {
  background-color: #a88c38;
}

.chat-send:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.debug {
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
```
