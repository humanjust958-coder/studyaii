import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

export interface StudyGoal {
  id: string;
  title: string;
  deadline?: string;
  completed: boolean;
  type: 'short' | 'long';
}

export interface UserProfile {
  name: string;
  age: number;
  school: string;
  avatar: string;
  class: string;
  board: string;
  subjects: string[];
  medium: string;
  examType: string;
  examDate: string;
  weakSubjects: string[];
  strongSubject: string;
  dailyHours: number;
  studyTime: string;
  breakPref: string;
  sleepHours: number;
  coaching: boolean;
  apiKey: string;
  xp?: number;
  level?: number;
  streak?: number;
  lastActiveDate?: string;
  badges?: string[];
  challengesDate?: string;
  challenges?: { id: string, name: string, completed: boolean, xp: number }[];
  goals?: StudyGoal[];
}

interface UserContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  isOnboarded: boolean;
  completeOnboarding: (data: UserProfile) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  addXP: (amount: number) => void;
  completeChallenge: (id: string) => void;
}

const defaultContext: UserContextType = {
  profile: null,
  setProfile: () => {},
  updateProfile: () => {},
  isOnboarded: false,
  completeOnboarding: () => {},
  theme: 'dark',
  toggleTheme: () => {},
  addXP: () => {},
  completeChallenge: () => {}
};

export const UserContext = createContext<UserContextType>(defaultContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [loading, setLoading] = useState(true);

  const addXP = (amount: number) => {
    if (!profile) return;
    const currentXp = profile.xp || 0;
    const newXp = currentXp + amount;
    const oldLevel = profile.level || 1;
    const newLevel = Math.floor(newXp / 100) + 1;
    
    if (newLevel > oldLevel) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#a855f7', '#10b981', '#f59e0b']
      });
    }

    updateProfile({
      xp: newXp,
      level: newLevel
    });
  };

  const completeChallenge = (id: string) => {
    if (!profile || !profile.challenges) return;
    
    let earnedXp = 0;
    const updatedChallenges = profile.challenges.map(c => {
      if (c.id === id && !c.completed) {
        earnedXp = c.xp;
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#EC4899', '#A855F7']
        });
        return { ...c, completed: true };
      }
      return c;
    });

    if (earnedXp > 0) {
      const currentXp = profile.xp || 0;
      const newXp = currentXp + earnedXp;
      const oldLevel = profile.level || 1;
      const newLevel = Math.floor(newXp / 100) + 1;

      if (newLevel > oldLevel) {
        setTimeout(() => confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#a855f7', '#10b981', '#f59e0b']
        }), 500);
      }

      // Check badges
      const newBadges = [...(profile.badges || [])];
      let updatedBadges = false;
      const allCompleted = updatedChallenges.every(c => c.completed);
      if (allCompleted && !newBadges.includes('Task Master')) {
         newBadges.push('Task Master');
         updatedBadges = true;
      }
      if (newLevel >= 5 && !newBadges.includes('Scholar')) {
         newBadges.push('Scholar');
         updatedBadges = true;
      }
      if (id === 'quiz' && !newBadges.includes('Quiz Master')) {
         newBadges.push('Quiz Master');
         updatedBadges = true;
      }
      if (id === 'map' && !newBadges.includes('Concept Architect')) {
         newBadges.push('Concept Architect');
         updatedBadges = true;
      }
      if (id === 'flashcards' && !newBadges.includes('Flashcard Fanatic')) {
         newBadges.push('Flashcard Fanatic');
         updatedBadges = true;
      }
      if (id === 'evaluate' && !newBadges.includes('Strict Grader')) {
         newBadges.push('Strict Grader');
         updatedBadges = true;
      }
      if ((profile.streak || 0) >= 3 && !newBadges.includes('Streak Master')) {
         newBadges.push('Streak Master');
         updatedBadges = true;
      }
      if ((profile.streak || 0) >= 7 && !newBadges.includes('Week Warrior')) {
         newBadges.push('Week Warrior');
         updatedBadges = true;
      }
      if ((profile.streak || 0) >= 30 && !newBadges.includes('Month Master')) {
         newBadges.push('Month Master');
         updatedBadges = true;
      }

      if (updatedBadges) {
        setTimeout(() => confetti({
          particleCount: 200,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#F59E0B', '#FCD34D']
        }), 1000);
      }

      updateProfile({
        challenges: updatedChallenges,
        xp: newXp,
        level: newLevel,
        ...(updatedBadges && { badges: newBadges })
      });
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('studyGenieProfile_live');
    const savedTheme = localStorage.getItem('studyGenieTheme') as 'dark' | 'light';
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Handle Streak Logic
        const today = new Date().toLocaleDateString();
        const lastActive = parsed.lastActiveDate;
        let streak = parsed.streak || 0;

        if (lastActive !== today) {
          if (lastActive) {
            const lastDate = new Date(lastActive);
            const todayDate = new Date();
            const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if (diffDays === 1) {
              streak += 1;
            } else if (diffDays > 1) {
              streak = 1; // Reset streak
            }
          } else {
            streak = 1;
          }
          parsed.lastActiveDate = today;
          parsed.streak = streak;
        }

        // Daily Challenges Logic
        if (parsed.challengesDate !== today) {
          parsed.challengesDate = today;
          parsed.challenges = [
             { id: 'quiz', name: 'Complete 1 Quiz', completed: false, xp: 20 },
             { id: 'flashcards', name: 'Review 5 Flashcards', completed: false, xp: 20 },
             { id: 'pomodoro', name: 'Complete a Pomodoro session', completed: false, xp: 30 },
             { id: 'evaluate', name: 'Submit 1 Answer for Evaluation', completed: false, xp: 25 },
             { id: 'map', name: 'Generate 1 Concept Map', completed: false, xp: 15 },
          ];
        }

        if(!parsed.badges) parsed.badges = ['Newcomer'];

        if (lastActive !== today || !parsed.challenges) {
          localStorage.setItem('studyGenieProfile_live', JSON.stringify(parsed));
        }

        setProfile(parsed);
        setIsOnboarded(true);
      } catch(e) { }
    }
    
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'light') {
        document.documentElement.classList.add('light');
      }
    }
    setLoading(false);
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (profile) {
      const updated = { ...profile, ...updates };
      setProfile(updated);
      localStorage.setItem('studyGenieProfile_live', JSON.stringify(updated));
    }
  };

  const completeOnboarding = (data: UserProfile) => {
    setProfile(data);
    setIsOnboarded(true);
    localStorage.setItem('studyGenieProfile_live', JSON.stringify(data));
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('studyGenieTheme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  if (loading) return null;

  return (
    <UserContext.Provider value={{ profile, setProfile, updateProfile, isOnboarded, completeOnboarding, theme, toggleTheme, addXP, completeChallenge }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
