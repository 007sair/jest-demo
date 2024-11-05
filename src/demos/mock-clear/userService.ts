export interface UserProfile {
  id: number;
  name: string;
}

export interface Activity {
  points: number;
}

export interface UserService {
  fetchUserProfile(userId: number): Promise<UserProfile>;
  calculateUserScore(activities: Activity[]): number;
  notifyUser(message: string): void;
}

export const userService: UserService = {
  fetchUserProfile: async userId => {
    // 实际实现会调用API
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  },

  calculateUserScore: activities => {
    return activities.reduce((score, activity) => {
      return score + activity.points;
    }, 0);
  },

  notifyUser: message => {
    console.log(`Notification sent: ${message}`);
  },
};
