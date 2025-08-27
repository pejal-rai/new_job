<style>
@import url("https://fonts.googleapis.com/css2?family=Lobster&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Lexend+Giga:wght@100..900&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Boldonse&family=Lilita+One&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");

.es {
  font-family: "Kanit", serif;
  font-weight: 600;
  font-style: normal;
}
.ed {
  font-family: "Boldonse", system-ui;
  font-weight: 400;
  font-style: normal;
}
.ew {
  font-family: "Lilita One", sans-serif;
  font-weight: 400;
  font-style: normal;
}

/* Base styles for larger screens (default) */
.chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-button {
  background-color: #b78c36;
  color: white;
  padding: 12px;
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.2s;
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

/* Responsive styles */

/* Mobile (max-width: 640px) */
@media (max-width: 640px) {
  /* Header and Navigation */
  header {
    padding: 1rem;
  }

  nav {
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem;
  }

  .relative {
    width: 100%;
  }

  .relative input {
    width: 100%;
    padding: 0.5rem 2.5rem;
    font-size: 0.875rem;
  }

  .relative i {
    left: 0.75rem;
  }

  .space-x-6 {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    margin-top: 0.5rem;
  }

  .space-x-6 > * {
    margin: 0 !important;
  }

  .text-lg {
    font-size: 1rem;
  }

  .h-14.w-14 {
    height: 2.5rem;
    width: 2.5rem;
  }

  /* Main Content */
  main {
    padding: 1rem;
  }

  .text-sm {
    font-size: 0.875rem;
  }

  /* Chat Interface */
  .chat-container {
    bottom: 10px;
    right: 10px;
  }

  .chat-button {
    padding: 8px;
  }

  .chat-window {
    width: 90vw;
    height: 70vh;
    border-radius: 8px;
  }

  .chat-header {
    padding: 8px;
  }

  .chat-header h3 {
    font-size: 1rem;
  }

  .chat-body {
    padding: 8px;
  }

  .chat-message {
    max-width: 90%;
    padding: 6px 10px;
    font-size: 0.875rem;
  }

  .chat-footer {
    padding: 8px;
    gap: 6px;
  }

  .chat-input {
    padding: 6px;
    font-size: 0.875rem;
  }

  .chat-send {
    padding: 6px 12px;
    font-size: 0.875rem;
  }

  /* Footer */
  footer {
    padding: 1rem;
  }

  footer p {
    font-size: 0.875rem;
  }
}

/* Tablet (min-width: 641px and max-width: 1024px) */
@media (min-width: 641px) and (max-width: 1024px) {
  /* Header and Navigation */
  header {
    padding: 1.5rem;
  }

  nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 0.75rem;
  }

  .relative {
    width: 50%;
  }

  .relative input {
    width: 100%;
    padding: 0.75rem 3rem;
    font-size: 1rem;
  }

  .space-x-6 {
    gap: 1rem;
  }

  .text-lg {
    font-size: 1.125rem;
  }

  .h-14.w-14 {
    height: 3rem;
    width: 3rem;
  }

  /* Main Content */
  main {
    padding: 1.5rem;
  }

  /* Chat Interface */
  .chat-container {
    bottom: 15px;
    right: 15px;
  }

  .chat-window {
    width: 300px;
    height: 400px;
  }

  .chat-header h3 {
    font-size: 1.125rem;
  }

  .chat-message {
    max-width: 85%;
  }

  /* Footer */
  footer {
    padding: 1.5rem;
  }
}
</style>

<template>
  <div class="min-h-screen bg-cover bg-center bg-[#ede8e8]">
    <div class="min-h-screen flex flex-col">
      <header class="bg-[#b3b6bb] bg-opacity-70 p-2">
        <nav class="container mx-auto px-6 flex items-center justify-between">
          <NuxtLink to="/" class="text-xl font-bold text-white ed hover:scale-105">
            <img src="/images/q.png" class="h-14 w-14 rounded-full" alt="" />
          </NuxtLink>
          <div class="relative">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search by title or company..."
              class="pl-10 pr-3 py-1 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-white w-72"
              @input="updateSearchTerm"
            />
            <i
              class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            ></i>
          </div>
          <div class="space-x-6 flex es text-black items-center">
            <NuxtLink to="/" class="text-lg transition-all hover:scale-105">
              Home
            </NuxtLink>
            <NuxtLink
              v-if="userStore.user?.role === 'user'"
              to="/job"
              class="text-lg transition-all hover:scale-105"
            >
              Job
            </NuxtLink>
            <NuxtLink
              v-if="userStore.user?.role === 'user'"
              to="/my-applications"
              class="text-lg transition-all hover:scale-105"
            >
              Application
            </NuxtLink>
            <NuxtLink
              v-if="user && user.role === 'employer'"
              to="/employer/post"
              class="text-lg transition-all hover:scale-105"
            >
              Post
            </NuxtLink>
            <NuxtLink
              v-if="user && user.role === 'employer'"
              to="/employer/applications"
              class="text-lg transition-all hover:scale-105"
            >
              Applications
            </NuxtLink>
            <NuxtLink
              v-if="user && user.role === 'employer'"
              to="/employer/chats"
              class="text-lg transition-all hover:scale-105"
            >
              chat
            </NuxtLink>
            <NuxtLink
              v-if="userStore.user?.role === 'user'"
              to="/chats"
              class="text-lg transition-all hover:scale-105"
            >
              chat
            </NuxtLink>
            <NuxtLink
              v-if="userStore.user?.role === 'user'"
              to="/cv"
              class="text-lg transition-all hover:scale-105"
            >
              My CV
            </NuxtLink>
            <NuxtLink
              v-if="user && user.role === 'employer'"
              to="/employer/company"
              class="text-lg transition-all hover:scale-105"
            >
              Company
            </NuxtLink>
            <NuxtLink to="/profile" class="text-lg transition-all hover:scale-105">
              Profile
            </NuxtLink>
            <button
              v-if="user"
              @click="logout"
              class="bg-[#b78c36] text-black font-semibold px-3 py-1 rounded-lg hover:bg-[#a88c38] hover:text-white transition-all hover:scale-105"
              :disabled="loading"
            >
              {{ loading ? "Logging out..." : "Logout" }}
            </button>
          </div>
        </nav>
      </header>

      <main class="flex-grow container mx-auto px-6 py-2">
        <p
          v-if="logoutMessage"
          class="mb-4 text-center text-sm"
          :class="{
            'text-green-500': logoutSuccess,
            'text-red-500': !logoutSuccess,
          }"
        >
          {{ logoutMessage }}
        </p>
        <slot />
      </main>

      <!-- Chat Interface for Authenticated Users -->
      <!-- <div v-if="user" class="chat-container">
        <div v-if="!isChatOpen" class="chat-button" @click="isChatOpen = true">
          <i class="fas fa-robot"></i>
        </div>
        <div v-else class="chat-window">
          <div class="chat-header">
            <h3 class="text-lg font-semibold">AI Assistant</h3>
            <button @click="isChatOpen = false" class="text-white">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="chat-body" ref="chatBody">
            <div
              v-for="(message, index) in chatMessages"
              :key="index"
              :class="['chat-message', message.sender]"
            >
              {{ message.text }}
            </div>
            <div v-if="chatLoading" class="chat-message ai">Typing...</div>
          </div>
          <div class="chat-footer">
            <input
              v-model="chatInput"
              @keyup.enter="sendMessage"
              type="text"
              placeholder="Ask me anything..."
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
      </div> -->
    </div>
    <footer class="bg-gray-800 text-white py-4">
      <div class="container mx-auto px-6 text-center">
        <p>© 2025 Job Management. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useUserStore } from "~/stores/user";
import { useSearchStore } from "~/stores/search";

const userStore = useUserStore();
const searchStore = useSearchStore();
const config = useRuntimeConfig();
const router = useRouter();

const user = computed(() => userStore.user);
const logoutMessage = ref("");
const logoutSuccess = ref(false);
const loading = ref(false);

// Chat-related state
const isChatOpen = ref(false);
const chatMessages = ref([
  {
    sender: "ai",
    text: "Hello! I'm your AI assistant. How can I help you today?",
  },
]);
const chatInput = ref("");
const chatLoading = ref(false);
const chatBody = ref(null);

// Two-way binding for search term
const searchTerm = computed({
  get: () => searchStore.searchTerm,
  set: (value) => searchStore.setSearchTerm(value),
});

const updateSearchTerm = () => {
  // No additional logic needed here; the computed setter updates the store
};

async function logout() {
  loading.value = true;
  try {
    const response = await $fetch(`${config.public.apiBase}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    userStore.clearUser();
    logoutMessage.value = response.message;
    logoutSuccess.value = true;
    setTimeout(() => {
      logoutMessage.value = "";
      router.push("/login");
    }, 1000);
  } catch (error) {
    logoutMessage.value = error.data?.message || "Logout failed";
    logoutSuccess.value = false;
  } finally {
    loading.value = false;
  }
}

async function sendMessage() {
  if (!chatInput.value.trim() || chatLoading.value) return;

  // Add user's message to the chat
  chatMessages.value.push({ sender: "user", text: chatInput.value });
  const userMessage = chatInput.value;
  chatInput.value = "";
  chatLoading.value = true;

  // Scroll to the bottom of the chat
  setTimeout(() => {
    if (chatBody.value) {
      chatBody.value.scrollTop = chatBody.value.scrollHeight;
    }
  }, 0);

  try {
    const response = await $fetch(`${config.public.apiBase}/ai/chat`, {
      method: "POST",
      credentials: "include",
      body: {
        query: userMessage,
      },
    });

    if (response.success) {
      chatMessages.value.push({ sender: "ai", text: response.answer }); // Changed from response.reply to response.answer
    } else {
      chatMessages.value.push({
        sender: "ai",
        text: "Sorry, I couldn't process your request. Please try again.",
      });
    }
  } catch (error) {
    console.log(error);
    chatMessages.value.push({
      sender: "ai",
      text: "An error occurred. Please try again later.",
    });
  } finally {
    chatLoading.value = false;

    // Scroll to the bottom of the chat after the AI response
    setTimeout(() => {
      if (chatBody.value) {
        chatBody.value.scrollTop = chatBody.value.scrollHeight;
      }
    }, 0);
  }
}
</script>

<style>
li {
  list-style: disc;
}
</style>
