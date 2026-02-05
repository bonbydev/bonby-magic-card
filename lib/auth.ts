// Types for collections
export interface AnonymousPlaySummary {
  playedAt: string;
  flippedCard: number;
  username: string;
}

export interface CardCollection {
  _id: string;
  name: string;
  cards: number[];
  createdAt: string;
  // Number of unique anonymous players (by IP) who played this collection
  playCount?: number;
  // Recent anonymous play history (most recent first)
  recentPlays?: AnonymousPlaySummary[];
}

// Get current logged-in user from session cookie
export const getCurrentUser = async (): Promise<string | null> => {
  try {
    const response = await fetch("/api/auth/me");
    const data = await response.json();
    return data.user?.username || null;
  } catch {
    return null;
  }
};

// Register new user
export const registerUser = async (
  username: string,
  passcode: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate username
    const cleanUsername = username.trim().toLowerCase().replace(/\s/g, "");
    if (!cleanUsername || cleanUsername.length < 3) {
      return {
        success: false,
        error: "Username must be at least 3 characters",
      };
    }

    // Validate passcode (6 digits)
    if (!/^\d{6}$/.test(passcode)) {
      return { success: false, error: "Passcode must be exactly 6 digits" };
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: cleanUsername, passcode }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Registration failed" };
  }
};

// Login user
export const loginUser = async (
  username: string,
  passcode: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const cleanUsername = username.trim().toLowerCase().replace(/\s/g, "");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: cleanUsername, passcode }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Login failed" };
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// Get user collections
export const getUserCollections = async (): Promise<CardCollection[]> => {
  try {
    const response = await fetch("/api/collections");
    if (!response.ok) return [];

    const data = await response.json();
    return data.collections || [];
  } catch {
    return [];
  }
};

// Create new collection
export const createCollection = async (
  name: string,
  cards: number[],
): Promise<{
  success: boolean;
  error?: string;
  collection?: CardCollection;
}> => {
  try {
    if (cards.length !== 5) {
      return { success: false, error: "Collection must have exactly 5 cards" };
    }

    const response = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, cards }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error };
    }

    return { success: true, collection: data.collection };
  } catch (error) {
    return { success: false, error: "Failed to create collection" };
  }
};

// Delete collection
export const deleteCollection = async (
  collectionId: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`/api/collections/${collectionId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete collection" };
  }
};
