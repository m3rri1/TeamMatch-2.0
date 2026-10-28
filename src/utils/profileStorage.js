import {
  ACTIVE_PROFILE_ID_KEY,
  PROFILES_STORAGE_KEY,
  PROFILE_CREATED_KEY,
  PROFILE_STORAGE_KEY,
} from "../constants/storageKeys";
import { emptyProfile } from "../data/emptyProfile";

export function createProfileId() {
  return `profile_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeProfile(parsed = {}) {
  return {
    ...emptyProfile,
    ...parsed,
    id: parsed.id || createProfileId(),
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    subskills: Array.isArray(parsed.subskills) ? parsed.subskills : [],
    interests: Array.isArray(parsed.interests) ? parsed.interests : [],
    prompts: Array.isArray(parsed.prompts) ? parsed.prompts : [],
    photos: Array.isArray(parsed.photos) ? parsed.photos : [],
  };
}

export function loadSavedProfiles() {
  try {
    const storedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);

    if (storedProfiles) {
      const parsedProfiles = JSON.parse(storedProfiles);

      if (Array.isArray(parsedProfiles)) {
        return parsedProfiles.map(normalizeProfile);
      }
    }

    const legacyProfile = localStorage.getItem(PROFILE_STORAGE_KEY);

    if (legacyProfile) {
      const migratedProfile = normalizeProfile(JSON.parse(legacyProfile));

      localStorage.setItem(
        PROFILES_STORAGE_KEY,
        JSON.stringify([migratedProfile])
      );
      localStorage.setItem(ACTIVE_PROFILE_ID_KEY, migratedProfile.id);
      localStorage.setItem(PROFILE_CREATED_KEY, "true");

      return [migratedProfile];
    }

    return [];
  } catch (error) {
    console.error("Could not load TeamMatch profiles.", error);
    return [];
  }
}

export function getActiveProfileId(profiles) {
  try {
    const savedId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);

    if (savedId && profiles.some((profile) => profile.id === savedId)) {
      return savedId;
    }
  } catch (error) {
    console.warn("Could not read active TeamMatch profile.", error);
  }

  return profiles[0]?.id || null;
}

export function saveProfiles(profiles) {
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));

    if (profiles.length > 0) {
      localStorage.setItem(PROFILE_CREATED_KEY, "true");
    } else {
      localStorage.removeItem(PROFILE_CREATED_KEY);
    }

    return true;
  } catch (error) {
    console.error("Could not save TeamMatch profiles.", error);
    return false;
  }
}

export function saveProfile(profileToSave) {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileToSave));
    localStorage.setItem(ACTIVE_PROFILE_ID_KEY, profileToSave.id);
    localStorage.setItem(PROFILE_CREATED_KEY, "true");
    return true;
  } catch (error) {
    console.error("Could not save TeamMatch profile.", error);
    return false;
  }
}
