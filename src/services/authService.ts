import { UserProfile, CallHistoryItem } from '../types';
import { INITIAL_DEMO_USER, INITIAL_CALL_HISTORY } from '../data/demoUsers';

const USER_STORAGE_KEY = 'amaterasu_current_user';
const USERS_LIST_STORAGE_KEY = 'amaterasu_registered_users';
const CALL_HISTORY_STORAGE_KEY = 'amaterasu_call_history';

class AuthService {
  private currentUser: UserProfile | null = null;
  private hasServerSession = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      } else {
        // Initialize with default demo user so judges/faculty can jump straight in if they wish
        this.currentUser = INITIAL_DEMO_USER;
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_USER));
      }

      // Ensure registered users list has demo user
      const usersList = this.getAllRegisteredUsers();
      if (!usersList.some(u => u.userId === INITIAL_DEMO_USER.userId)) {
        usersList.push(INITIAL_DEMO_USER);
        localStorage.setItem(USERS_LIST_STORAGE_KEY, JSON.stringify(usersList));
      }

      // Initialize call history if empty
      if (!localStorage.getItem(CALL_HISTORY_STORAGE_KEY)) {
        localStorage.setItem(CALL_HISTORY_STORAGE_KEY, JSON.stringify(INITIAL_CALL_HISTORY));
      }
    } catch {
      this.currentUser = INITIAL_DEMO_USER;
    }
  }

  public getAllRegisteredUsers(): UserProfile[] {
    try {
      const raw = localStorage.getItem(USERS_LIST_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [INITIAL_DEMO_USER];
    } catch {
      return [INITIAL_DEMO_USER];
    }
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public async restoreServerSession(): Promise<UserProfile | null> {
    try {
      const response = await fetch('/api/auth/session', { credentials: 'include' });
      if (response.ok) {
        const payload = await response.json();
        this.hasServerSession = true;
        this.setCurrentUser(payload.user);
        return payload.user;
      }

      if (this.currentUser?.userId === INITIAL_DEMO_USER.userId) {
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: INITIAL_DEMO_USER.userId, password: INITIAL_DEMO_USER.password })
        });
        if (loginResponse.ok) {
          const payload = await loginResponse.json();
          this.hasServerSession = true;
          this.setCurrentUser(payload.user);
          return payload.user;
        }
      }
    } catch {
      this.hasServerSession = false;
    }
    this.hasServerSession = false;
    return null;
  }

  public async register(userData: Omit<UserProfile, 'id' | 'credits' | 'anonymousId' | 'favouriteCallers' | 'createdAt'>): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const payload = await response.json();
      if (!response.ok) return { success: false, error: payload.error || 'Failed to create account.' };

      this.hasServerSession = true;
      this.setCurrentUser(payload.user);
      return { success: true, user: payload.user };
    } catch {
      return { success: false, error: 'Account service is unavailable. Start the Amaterasu server and try again.' };
    }
  }

  public async login(userId: string, password?: string): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password })
      });
      const payload = await response.json();
      if (!response.ok && response.status === 401) {
        const legacyUser = this.getAllRegisteredUsers().find((user) => user.userId.toLowerCase() === userId.toLowerCase());
        if (legacyUser?.password && legacyUser.password === password) {
          const migrationResponse = await fetch('/api/auth/migrate', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile: legacyUser, password })
          });
          const migrationPayload = await migrationResponse.json();
          if (migrationResponse.ok) {
            this.hasServerSession = true;
            this.setCurrentUser(migrationPayload.user);
            return { success: true, user: migrationPayload.user };
          }
          return { success: false, error: migrationPayload.error || 'Could not securely migrate this account.' };
        }
      }
      if (!response.ok) return { success: false, error: payload.error || 'Authentication failed.' };

      this.hasServerSession = true;
      this.setCurrentUser(payload.user);
      return { success: true, user: payload.user };
    } catch {
      return { success: false, error: 'Account service is unavailable. Start the Amaterasu server and try again.' };
    }
  }

  public logout() {
    void fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => undefined);
    this.hasServerSession = false;
    this.currentUser = null;
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  public setCurrentUser(user: UserProfile) {
    this.currentUser = user;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    if (this.hasServerSession) {
      void fetch('/api/auth/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credits: user.credits,
          favouriteCallers: user.favouriteCallers,
          lastSvi: user.lastSvi,
          lastRegion: user.lastRegion,
          lastConcern: user.lastConcern,
          lastAssessmentDate: user.lastAssessmentDate
        })
      }).catch(() => undefined);
    }

    // Update in users list too
    const users = this.getAllRegisteredUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_LIST_STORAGE_KEY, JSON.stringify(users));
  }

  public addCredits(amount: number): number {
    if (!this.currentUser) return 0;
    const updatedCredits = this.currentUser.credits + amount;
    this.currentUser.credits = updatedCredits;
    this.setCurrentUser({ ...this.currentUser, credits: updatedCredits });
    return updatedCredits;
  }

  public toggleFavouriteCaller(anonymousId: string): boolean {
    if (!this.currentUser) return false;
    const currentFavourites = new Set(this.currentUser.favouriteCallers || []);
    let isFavourited = false;

    if (currentFavourites.has(anonymousId)) {
      currentFavourites.delete(anonymousId);
      isFavourited = false;
    } else {
      currentFavourites.add(anonymousId);
      isFavourited = true;
    }

    const updatedFavourites = Array.from(currentFavourites);
    this.setCurrentUser({ ...this.currentUser, favouriteCallers: updatedFavourites });

    // Also sync call history favourites
    this.syncCallHistoryFavourite(anonymousId, isFavourited);
    return isFavourited;
  }

  public getCallHistory(): CallHistoryItem[] {
    try {
      const raw = localStorage.getItem(CALL_HISTORY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : INITIAL_CALL_HISTORY;
    } catch {
      return INITIAL_CALL_HISTORY;
    }
  }

  public addCallHistoryItem(item: Omit<CallHistoryItem, 'id'>): CallHistoryItem {
    const list = this.getCallHistory();
    const isFav = this.currentUser?.favouriteCallers.includes(item.anonymousUserId) || false;
    const newItem: CallHistoryItem = {
      ...item,
      id: 'hist_' + Date.now(),
      isFavourite: isFav
    };
    list.unshift(newItem);
    localStorage.setItem(CALL_HISTORY_STORAGE_KEY, JSON.stringify(list));
    return newItem;
  }

  private syncCallHistoryFavourite(anonymousUserId: string, isFav: boolean) {
    const list = this.getCallHistory().map(item => {
      if (item.anonymousUserId === anonymousUserId) {
        return { ...item, isFavourite: isFav };
      }
      return item;
    });
    localStorage.setItem(CALL_HISTORY_STORAGE_KEY, JSON.stringify(list));
  }
}

export const authService = new AuthService();
