// Simple fetch wrapper or mock client base
export const apiClient = {
    get: async (url: string) => {
        // In a real app, this would use fetch or axios
        console.log(`Fetching ${url}`);
        return {};
    }
}
