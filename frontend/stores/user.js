import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
    state: () => ({
        user: null,
        isLoading: false,
        company: null,
        cv: null,
    }),
    actions: {
        setUser(userData) {
            this.user = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                role: userData.role,
                profileImage: userData.profile_image,
            };
        },
        async fetchUser() {
            this.isLoading = true;
            try {
                const config = useRuntimeConfig();
                const response = await $fetch(`${config.public.apiBase}/auth/profile`, {
                    method: "GET",
                    credentials: "include",
                    headers: { Accept: "application/json" },
                });
                if (response.success && response.user) {
                    this.setUser(response.user);
                    if (this.user.role === "employer" || this.user.role === "user") {
                        await this.fetchCompany();
                    }
                    await this.fetchCV();
                    return true;
                } else {
                    this.user = null;
                    this.company = null;
                    this.cv = null;
                    return false;
                }
            } catch (error) {
                this.user = null;
                this.company = null;
                this.cv = null;
                console.error("Fetch user failed:", error);
                return false;
            } finally {
                this.isLoading = false;
            }
        },
        async fetchCompany() {
            try {
                const config = useRuntimeConfig();
                const response = await $fetch(`${config.public.apiBase}/companies`, {
                    method: "GET",
                    credentials: "include",
                    headers: { Accept: "application/json" },
                });
                if (response.success && response.company) {
                    this.company = response.company;
                } else {
                    this.company = null;
                }
            } catch (error) {
                this.company = null;
                console.error("Fetch company failed:", error.message);
            }
        },
        async fetchCV() {
            try {
                const config = useRuntimeConfig();
                const response = await $fetch(`${config.public.apiBase}/cv/my-cv`, {
                    method: "GET",
                    credentials: "include",
                    headers: { Accept: "application/json" },
                });
                if (response.success && response.cv) {
                    this.cv = response.cv;
                    return true;
                } else {
                    this.cv = null;
                    return false;
                }
            } catch (error) {
                this.cv = null;
                console.error("Fetch CV failed:", error.message);
                return false;
            }
        },
        async createCV(formData) {
            try {
                const config = useRuntimeConfig();
                console.log("Sending CV create request with data:", formData);
                const response = await $fetch(`${config.public.apiBase}/cv/create`, {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                });
                console.log("Create CV response:", response);
                if (response.success) {
                    await this.fetchCV();
                    return response.pdfPath;
                }
                return false;
            } catch (error) {
                console.error("Create CV failed:", error);
                throw error;
            }
        },
        async updateCV(formData) {
            try {
                const config = useRuntimeConfig();
                const response = await $fetch(`${config.public.apiBase}/cv/update`, {
                    method: "PUT",
                    credentials: "include",
                    body: formData,
                });
                if (response.success) {
                    await this.fetchCV();
                    return response.pdfPath;
                }
                return false;
            } catch (error) {
                console.error("Update CV failed:", error);
                throw error;
            }
        },
        async deleteCV() {
            try {
                const config = useRuntimeConfig();
                const response = await $fetch(`${config.public.apiBase}/cv/delete`, {
                    method: "DELETE",
                    credentials: "include",
                    headers: { Accept: "application/json" },
                });
                if (response.success) {
                    this.cv = null;
                    return true;
                }
                return false;
            } catch (error) {
                console.error("Delete CV failed:", error);
                return false;
            }
        },
        clearUser() {
            this.user = null;
            this.company = null;
            this.cv = null;
        },
        isEmployer() {
            return this.user?.role === "employer";
        },
    },
    getters: {
        isAuthenticated: (state) => !!state.user,
        hasCV: (state) => !!state.cv,
    },
});