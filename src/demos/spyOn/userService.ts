export const userService = {
  fetchUser: async (id: number) => {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  },
};
