<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Your Chat Dashboard</h1>

    <div v-if="loading" class="text-center text-gray-500">Loading chats...</div>
    <div v-else-if="error" class="text-red-500 text-center">{{ error }}</div>
    <div v-else class="flex gap-4">
      <!-- Chat List -->
      <div class="bg-white/75 shadow-lg rounded-lg p-6 w-1/3">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Conversations</h2>
        <div v-if="chats.length === 0" class="text-gray-500">
          No conversations available.
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="chat in chats"
            :key="chat.work_id"
            @click="selectChat(chat)"
            :class="[
              'p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition',
              selectedChat?.work_id === chat.work_id ? 'bg-blue-100' : '',
            ]"
          >
            <h3 class="font-semibold text-gray-900">{{ chat.work_title }}</h3>
            <p class="text-gray-600 text-sm">Employer: {{ chat.employer_name }}</p>
            <p class="text-gray-500 text-sm truncate">{{ chat.last_message }}</p>
            <p class="text-xs text-gray-400">
              {{ formatDate(chat.last_message_time) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Chat Window -->
      <div class="bg-white/75 shadow-lg rounded-lg p-6 flex-1">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">
          {{ selectedChat ? selectedChat.work_title : "Select a conversation" }}
        </h2>
        <div v-if="!selectedChat" class="text-gray-500 text-center">
          Select a conversation to start chatting.
        </div>
        <div v-else>
          <div class="chat-body" ref="chatBody">
            <div
              v-for="message in messages"
              :key="message.id"
              :class="[
                'chat-message',
                message.sender_id === userStore.user.id ? 'user' : 'other',
              ]"
            >
              <div class="flex justify-between items-start">
                <div>
                  <strong>{{ message.sender_name }}:</strong> {{ message.message }}
                  <p class="text-xs text-gray-400 mt-1">
                    {{ formatMessageDate(message.created_at) }}
                  </p>
                </div>
                <button
                  v-if="message.sender_id === userStore.user.id"
                  @click="deleteMessage(message.id)"
                  class="text-red-500 hover:text-red-700"
                  title="Delete message"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div v-if="chatLoading" class="chat-message other">Typing...</div>
          </div>
          <div class="chat-footer">
            <input
              v-model="chatInput"
              @keyup.enter="sendMessage"
              type="text"
              placeholder="Type a message..."
              class="chat-input"
              :disabled="chatLoading || !selectedChat"
            />
            <button
              @click="sendMessage"
              class="chat-send"
              :disabled="chatLoading || !chatInput.trim() || !selectedChat"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useNuxtApp, useRuntimeConfig } from "#app";
import { useUserStore } from "~/stores/user";

const { $socket } = useNuxtApp();
const userStore = useUserStore();
const config = useRuntimeConfig();

const chats = ref([]);
const selectedChat = ref(null);
const messages = ref([]);
const chatInput = ref("");
const chatLoading = ref(false);
const chatBody = ref(null);
const loading = ref(true);
const error = ref(null);
const fontAwesomeLoaded = ref(false);
const debugMode = ref(true);
let socket = null;

definePageMeta({
  layout: "default",
});

// Computed property for API base URL
const staticBaseUrl = computed(() =>
  config.public.apiBase.includes("/api")
    ? config.public.apiBase.replace("/api", "")
    : config.public.apiBase
);

// Date formatting functions
const formatDate = (datetime) => {
  return new Date(datetime).toLocaleString();
};

const formatMessageDate = (datetime) => {
  return new Date(datetime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Check Font Awesome
const checkFontAwesome = () => {
  const faScript = document.querySelector('script[src*="font-awesome"]');
  fontAwesomeLoaded.value = !!faScript && typeof window.FontAwesome !== "undefined";
  console.log("Font Awesome loaded:", fontAwesomeLoaded.value);
};

// Fetch all chats for the user
const fetchChats = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/chat/user`, {
      method: "GET",
      credentials: "include",
    });
    if (response.success) {
      chats.value = response.chats;
    } else {
      error.value = response.message || "Failed to load chats";
    }
  } catch (err) {
    error.value =
      err.data?.message || err.message || "An error occurred while fetching chats";
  } finally {
    loading.value = false;
  }
};

// Fetch chat history for a specific work ID
const fetchChatHistory = async (workId) => {
  try {
    const response = await $fetch(`${config.public.apiBase}/chat/history/${workId}`, {
      method: "GET",
      credentials: "include",
    });
    if (response.success) {
      messages.value = response.messages;
    } else {
      console.error("Failed to fetch chat history:", response.message);
    }
  } catch (error) {
    console.error("Error fetching chat history:", error);
  }
};

// Delete a message
const deleteMessage = async (messageId) => {
  if (!confirm("Are you sure you want to delete this message?")) return;

  try {
    const response = await $fetch(`${config.public.apiBase}/chat/message/${messageId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.success) {
      messages.value = messages.value.filter((msg) => msg.id !== messageId);
      alert("Message deleted successfully");
    } else {
      alert(`Failed to delete message: ${response.message || "Unknown error"}`);
    }
  } catch (error) {
    alert(`Error deleting message: ${error.message || "Unknown error"}`);
  }
};

// Select a chat and initialize Socket.IO
const selectChat = async (chat) => {
  selectedChat.value = chat;
  messages.value = [];
  await fetchChatHistory(chat.work_id);

  if (socket) {
    socket.off("connect");
    socket.off("receiveMessage");
    socket.off("messageDeleted");
    socket.off("connect_error");
    socket.off("error");
    socket.disconnect();
  }

  socket = $socket;
  socket.connect();

  socket.on("connect", () => {
    console.log("Connected to Socket.IO server, socket ID:", socket.id);
    socket.emit("joinChat", { workId: chat.work_id, userId: userStore.user.id });
  });

  socket.on("receiveMessage", (message) => {
    console.log("Received message:", message);
    if (!messages.value.some((msg) => msg.id === message.id)) {
      messages.value.push(message);
    } else {
      console.log("Duplicate message ignored:", message.id);
    }
    setTimeout(() => {
      if (chatBody.value) {
        chatBody.value.scrollTop = chatBody.value.scrollHeight;
      }
    }, 0);
  });

  socket.on("messageDeleted", ({ workId, messageId }) => {
    if (workId === selectedChat.value?.work_id) {
      messages.value = messages.value.filter((msg) => msg.id !== messageId);
      console.log(`Message ${messageId} deleted for workId ${workId}`);
    }
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
    alert("Failed to connect to chat server");
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
    alert(`Chat error: ${error.message || "Unknown error"}`);
  });
};

// Send chat message
const sendMessage = async () => {
  if (!chatInput.value.trim() || chatLoading.value || !selectedChat.value) return;

  chatLoading.value = true;
  const message = chatInput.value;
  chatInput.value = "";

  try {
    if (!socket.connected) {
      console.error("Socket not connected");
      throw new Error("Chat server not connected");
    }

    socket.emit("sendMessage", {
      workId: selectedChat.value.work_id,
      senderId: userStore.user.id,
      message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    alert(`Failed to send message: ${error.message || "Unknown error"}`);
  } finally {
    chatLoading.value = false;
  }
};

// Lifecycle hooks
onMounted(async () => {
  checkFontAwesome();
  if (userStore.user?.role !== "user") {
    error.value = "Only users can access this page";
    return;
  }
  await fetchChats();
});

onUnmounted(() => {
  if (socket) {
    socket.off("connect");
    socket.off("receiveMessage");
    socket.off("messageDeleted");
    socket.off("connect_error");
    socket.off("error");
    socket.disconnect();
    socket = null;
  }
});
</script>

<style scoped>
.chat-body {
  height: 400px;
  overflow-y: auto;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
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

.chat-message.other {
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
