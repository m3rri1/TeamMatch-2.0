
import "./styles/App.css";
import { useEffect, useMemo, useState } from "react";
import {
  ACTIVE_PROFILE_ID_KEY,
  PROFILE_STORAGE_KEY,
} from "./constants/storageKeys";
import { emptyProfile } from "./data/emptyProfile";
import AuthPage from "./pages/Auth/AuthPage";
import Chat from "./pages/Chat/Chat";
import Discover from "./pages/Discover/Discover";
import Feedback from "./pages/Feedback/Feedback";
import HomePage from "./pages/Home/HomePage";
import OnboardingPage from "./pages/Onboarding/OnboardingPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import Requests from "./pages/Requests/Requests";
import {
  apiRequest,
  getAuthToken,
  saveProfileToBackend,
} from "./services/api";
import { calculateAge } from "./utils/age";
import {
  createProfileId,
  getActiveProfileId,
  loadSavedProfiles,
  normalizeProfile,
  saveProfile,
  saveProfiles,
} from "./utils/profileStorage";

const CURRENT_PAGE_KEY = "teammatch_current_page";

const VALID_PAGES = [
  "home",
  "profile",
  "discover",
  "requests",
  "chat",
  "feedback",
];

function getInitialPage() {
  try {
    const savedPage = localStorage.getItem(CURRENT_PAGE_KEY);
    const hasLocalProfile = loadSavedProfiles().length > 0;
    const hasToken = Boolean(
      localStorage.getItem("teammatch_token")
    );

    // No saved profile or login: start the normal first-time flow.
    if (!hasLocalProfile && !hasToken) {
      return "home";
    }

    // Never unexpectedly restart profile creation after refresh.
    if (
      !savedPage ||
      savedPage === "home" ||
      savedPage === "onboarding" ||
      savedPage === "auth"
    ) {
      return "profile";
    }

    return VALID_PAGES.includes(savedPage)
      ? savedPage
      : "profile";
  } catch {
    return "home";
  }
}

function App() {
  const [pageState, setPageState] = useState(getInitialPage);
  const [incomingRequestCount, setIncomingRequestCount] = useState(0);

  // Remember the current section across refreshes.
  const setPage = (nextPage) => {
    setPageState(nextPage);
  
  

    try {
      localStorage.setItem(CURRENT_PAGE_KEY, nextPage);
    } catch (error) {
      console.warn("Could not save current page.", error);
    }
  };

  const [step, setStep] = useState(1);
  const [openSkillCategory, setOpenSkillCategory] = useState(null);
  const [showOtherSkills, setShowOtherSkills] = useState(false);
  const [openInterestGroup, setOpenInterestGroup] = useState(null);

  const [initialProfiles] = useState(() => loadSavedProfiles());
  const [profiles, setProfiles] = useState(initialProfiles);

  const [activeProfileId, setActiveProfileId] = useState(() =>
    getActiveProfileId(initialProfiles)
  );

  const [profile, setProfile] = useState(() => {
    const activeId = getActiveProfileId(initialProfiles);

    return (
      initialProfiles.find(
        (savedProfile) => savedProfile.id === activeId
      ) || normalizeProfile(emptyProfile)
    );
  });

  const [profileSaved, setProfileSaved] = useState(
    initialProfiles.length > 0
  );
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [backendSaving, setBackendSaving] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);

  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authReturnPage, setAuthReturnPage] = useState("profile");

  // Keep the incoming connection-request badge up to date.
  useEffect(() => {
    let cancelled = false;

    async function refreshRequestCount() {
      if (!getAuthToken()) {
        if (!cancelled) setIncomingRequestCount(0);
        return;
      }

      try {
        const [profileData, connectionData] = await Promise.all([
          apiRequest("/api/profiles/me"),
          apiRequest("/api/connections"),
        ]);

        const myProfile = profileData?.profile || profileData || {};
        const myUserId = myProfile.userId || myProfile.user?.id;
        const connections = Array.isArray(connectionData)
          ? connectionData
          : [];

        const count = myUserId
          ? connections.filter(
              (connection) =>
                connection.status === "pending" &&
                String(connection.recipient) === String(myUserId)
            ).length
          : 0;

        if (!cancelled) setIncomingRequestCount(count);
      } catch (error) {
        // Keep the last known count if the network temporarily fails.
        console.warn("Could not refresh request count:", error.message);
      }
    }

    refreshRequestCount();
    const intervalId = setInterval(refreshRequestCount, 10000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [pageState]);

  // Restore the signed-in user's profile from the backend.
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    apiRequest("/api/profiles/me")
      .then((data) => {
        const serverProfile = data?.profile || data;

        if (
          !serverProfile ||
          (!serverProfile._id && !serverProfile.id)
        ) {
          return;
        }

        const mergedProfile = normalizeProfile({
          ...profile,
          ...serverProfile,
          id: profile.id || serverProfile._id || serverProfile.id,
        });

        setProfile(mergedProfile);
        setProfileSaved(true);
        setBackendConnected(true);
        setProfiles([mergedProfile]);
        setActiveProfileId(mergedProfile.id);

        saveProfiles([mergedProfile]);
        saveProfile(mergedProfile);

        // If this is a newly authenticated session, open the profile.
        setPageState((currentPage) => {
          if (
            currentPage === "home" ||
            currentPage === "onboarding" ||
            currentPage === "auth"
          ) {
            try {
              localStorage.setItem(CURRENT_PAGE_KEY, "profile");
            } catch {
              // Page restoration can still continue in memory.
            }

            return "profile";
          }

          return currentPage;
        });
      })
      .catch((error) => {
        console.warn(
          "Could not load signed-in profile from backend.",
          error.message
        );
      });
    // Restore once when the app starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!profileSaved || !activeProfileId || isCreatingProfile) {
      return;
    }

    setProfiles((currentProfiles) => {
      const nextProfiles = currentProfiles.map((savedProfile) =>
        savedProfile.id === activeProfileId
          ? profile
          : savedProfile
      );

      saveProfiles(nextProfiles);
      return nextProfiles;
    });

    saveProfile(profile);
  }, [profile, profileSaved, activeProfileId, isCreatingProfile]);

  const isEditing = profileSaved && !isCreatingProfile;
  const calculatedAge = calculateAge(profile.birthday);

  const featuredPassion =
    profile.interests.find((item) => item !== "Other") ||
    profile.otherInterest ||
    "";

  const update = (key, value) => {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleArray = (key, value) => {
    setProfile((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  };

  const createNewProfile = () => {
    const newProfile = normalizeProfile({
      ...emptyProfile,
      id: createProfileId(),
    });

    setProfile(newProfile);
    setActiveProfileId(newProfile.id);
    setIsCreatingProfile(true);
    setPage("onboarding");
    setStep(1);
    setOpenSkillCategory(null);
    setShowOtherSkills(false);
    setOpenInterestGroup(null);

    try {
      localStorage.setItem(
        ACTIVE_PROFILE_ID_KEY,
        newProfile.id
      );
    } catch (error) {
      console.warn(
        "Could not set active TeamMatch profile.",
        error
      );
    }
  };

  const openSavedProfile = (profileId) => {
    const savedProfile = profiles.find(
      (item) => item.id === profileId
    );

    if (!savedProfile) return;

    const selectedProfile = normalizeProfile(savedProfile);

    setProfile(selectedProfile);
    setActiveProfileId(selectedProfile.id);
    setProfileSaved(true);
    setIsCreatingProfile(false);
    setPage("profile");

    try {
      localStorage.setItem(
        ACTIVE_PROFILE_ID_KEY,
        selectedProfile.id
      );
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(selectedProfile)
      );
    } catch (error) {
      console.warn("Could not switch TeamMatch profile.", error);
    }
  };

  const requireAuth = (targetPage = "profile") => {
    if (getAuthToken()) {
      setPage(targetPage);
      return;
    }

    setAuthReturnPage(targetPage);
    setAuthMode("login");
    setAuthError("");
    setAuthPassword("");
    setAuthEmail(profile.email || "");
    setPage("auth");
  };

  const startProfile = () => {
    if (!getAuthToken()) {
      requireAuth("profile");
      return;
    }

    if (profileSaved && activeProfileId) {
      setIsCreatingProfile(false);
      setPage("profile");
      return;
    }

    createNewProfile();
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    const email = authEmail.trim().toLowerCase();
    const password = authPassword;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      const endpoint =
        authMode === "register"
          ? "/api/auth/register"
          : "/api/auth/login";

      const data = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!data?.token) {
        throw new Error(
          "Authentication succeeded but no token was returned."
        );
      }

      localStorage.setItem("teammatch_token", data.token);
      setBackendConnected(true);
      setAuthEmail(email);

      let serverProfile = null;

      try {
        const profileData = await apiRequest("/api/profiles/me");
        serverProfile = profileData?.profile || profileData;
      } catch (profileError) {
        if (authMode === "login") {
          console.warn(
            "Could not load existing profile:",
            profileError.message
          );
        }
      }

      if (serverProfile && (serverProfile._id || serverProfile.id)) {
        const mergedProfile = normalizeProfile({
          ...profile,
          ...serverProfile,
          id: profile.id || serverProfile._id || serverProfile.id,
          email,
        });

        setProfile(mergedProfile);
        setProfileSaved(true);
        setIsCreatingProfile(false);
        setActiveProfileId(mergedProfile.id);

        setProfiles((currentProfiles) => {
          const nextProfiles = currentProfiles.some(
            (item) => item.id === mergedProfile.id
          )
            ? currentProfiles.map((item) =>
                item.id === mergedProfile.id
                  ? mergedProfile
                  : item
              )
            : [...currentProfiles, mergedProfile];

          saveProfiles(nextProfiles);
          return nextProfiles;
        });

        saveProfile(mergedProfile);
        setPage(
          authReturnPage === "discover" ? "discover" : "profile"
        );
      } else {
        const localMatch = profiles.find(
          (item) => item.email?.trim().toLowerCase() === email
        );

        if (localMatch) {
          const selectedProfile = normalizeProfile({
            ...localMatch,
            email,
          });

          setProfile(selectedProfile);
          setActiveProfileId(selectedProfile.id);
          setProfileSaved(true);
          setIsCreatingProfile(false);

          try {
            const savedProfile = await apiRequest("/api/profiles", {
              method: "POST",
              body: JSON.stringify(selectedProfile),
            });

            const finalProfile = normalizeProfile({
              ...selectedProfile,
              ...savedProfile,
              id: selectedProfile.id,
              email,
            });

            setProfile(finalProfile);
            saveProfile(finalProfile);
            setBackendConnected(true);
          } catch (migrationError) {
            console.warn(
              "Could not migrate the local profile to MongoDB.",
              migrationError.message
            );
          }

          setPage(
            authReturnPage === "discover" ? "discover" : "profile"
          );
        } else {
          const newProfile = normalizeProfile({
            ...emptyProfile,
            email,
            id: createProfileId(),
          });

          setProfile(newProfile);
          setActiveProfileId(newProfile.id);
          setProfileSaved(false);
          setIsCreatingProfile(true);
          setStep(1);
          setPage("onboarding");
        }
      }

      setAuthPassword("");
    } catch (error) {
      setAuthError(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("teammatch_token");
    localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    localStorage.removeItem(CURRENT_PAGE_KEY);

    setBackendConnected(false);
    setAuthPassword("");
    setAuthError("");
    setAuthEmail("");
    setAuthMode("login");
    setProfile(normalizeProfile(emptyProfile));
    setActiveProfileId(null);
    setProfileSaved(false);
    setIsCreatingProfile(false);
    setPage("home");
  };

  const stepComplete = useMemo(() => {
    switch (step) {
      case 1:
        return profile.firstName.trim() !== "";
      case 2:
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email);
      case 3:
        return Boolean(profile.birthday);
      case 4:
        return Boolean(profile.gender);
      case 5:
        return Boolean(profile.location);
      case 6:
        return Boolean(profile.education);
      case 7:
        return (
          profile.professionalRole.trim() !== "" &&
          Boolean(profile.industry)
        );
      case 8:
        return (
          profile.skills.length > 0 &&
          (profile.subskills.length > 0 ||
            profile.otherSkill.trim() !== "")
        );
      case 9:
        return (
          profile.interests.length > 0 ||
          profile.otherInterest.trim() !== ""
        );
      case 10:
        return profile.about.trim().length >= 20;
      case 11:
        return (
          Boolean(profile.focusType) &&
          profile.focusDescription.trim().length >= 15
        );
      case 12:
        return (
          Array.isArray(profile.prompts) &&
          profile.prompts.length >= 2 &&
          profile.prompts[0]?.question &&
          profile.prompts[0]?.answer?.trim().length >= 10 &&
          profile.prompts[1]?.question &&
          profile.prompts[1]?.answer?.trim().length >= 10 &&
          profile.prompts[0]?.question !==
            profile.prompts[1]?.question
        );
      case 13:
      case 14:
        return true;
      default:
        return true;
    }
  }, [step, profile]);

  const next = () => {
    if (!stepComplete) return;
    setStep((current) => Math.min(current + 1, 14));
  };

  const skipConnectionPreference = () => {
    update("partnershipGender", "");
    setStep(14);
  };

  const back = () => {
    // The onboarding wizard keeps its normal previous-step behavior.
    if (page === "onboarding") {
      if (step === 1) {
        setPage(isEditing ? "profile" : "home");
      } else {
        setStep((current) => current - 1);
      }
      return;
    }

    // Do not send users from app sections back to profile creation.
    if (page === "profile") {
      setPage("home");
      return;
    }

    if (["discover", "requests", "chat", "feedback"].includes(page)) {
      setPage("profile");
    }
  };

  const finishProfile = async () => {
    const token = getAuthToken();

    if (!token) {
      requireAuth("profile");
      return;
    }

    const profileToSave = normalizeProfile({
      ...profile,
      id: profile.id || createProfileId(),
      email: authEmail || profile.email,
    });

    const nextProfiles = [profileToSave];
    const locallySaved = saveProfiles(nextProfiles);

    if (locallySaved) {
      setProfiles(nextProfiles);
      setProfile(profileToSave);
      setActiveProfileId(profileToSave.id);
      setProfileSaved(true);
      saveProfile(profileToSave);
    }

    setBackendSaving(true);

    try {
      const savedProfile = await saveProfileToBackend(profileToSave);

      const finalProfile = normalizeProfile({
        ...profileToSave,
        ...savedProfile,
        id: profileToSave.id,
      });

      const finalProfiles = nextProfiles.map((item) =>
        item.id === finalProfile.id ? finalProfile : item
      );

      setProfile(finalProfile);
      setProfiles(finalProfiles);
      setActiveProfileId(finalProfile.id);
      setProfileSaved(true);
      setBackendConnected(true);

      saveProfiles(finalProfiles);
      saveProfile(finalProfile);

      console.log("Profile saved to MongoDB ✅");
    } catch (error) {
      setBackendConnected(false);
      console.error(
        "Backend save failed. Local profile was kept.",
        error.message
      );
    } finally {
      setBackendSaving(false);
      setIsCreatingProfile(false);
      setPage("profile");
    }
  };

  const removePhoto = (index) => {
    setProfile((current) => ({
      ...current,
      photos: current.photos.filter((_, i) => i !== index),
    }));
  };

  if (pageState === "auth") {
    return (
      <AuthPage
        setPage={setPage}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authError={authError}
        setAuthError={setAuthError}
        authLoading={authLoading}
        handleAuthSubmit={handleAuthSubmit}
      />
    );
  }

  if (pageState === "home") {
    return (
      <HomePage
        setPage={setPage}
        profileSaved={profileSaved}
        requireAuth={requireAuth}
        startProfile={startProfile}
        logout={logout}
      />
    );
  }

  if (pageState === "profile") {
    return (
      <ProfilePage
        page={pageState}
        setPage={setPage}
        setStep={setStep}
        profile={profile}
        setIsCreatingProfile={setIsCreatingProfile}
        calculatedAge={calculatedAge}
        featuredPassion={featuredPassion}
        requireAuth={requireAuth}
        logout={logout}
        back={back}
        requestCount={incomingRequestCount}
      />
    );
  }

  if (pageState === "onboarding") {
    return (
      <OnboardingPage
        isEditing={isEditing}
        setPage={setPage}
        step={step}
        openSkillCategory={openSkillCategory}
        setOpenSkillCategory={setOpenSkillCategory}
        showOtherSkills={showOtherSkills}
        setShowOtherSkills={setShowOtherSkills}
        profile={profile}
        backendSaving={backendSaving}
        calculatedAge={calculatedAge}
        update={update}
        toggleArray={toggleArray}
        stepComplete={stepComplete}
        next={next}
        skipConnectionPreference={skipConnectionPreference}
        back={back}
        finishProfile={finishProfile}
      />
    );
  }

  if (pageState === "discover") {
    return (
      <Discover
        setPage={setPage}
        onBack={back}
        profile={profile}
        onLogout={logout}
        requestCount={incomingRequestCount}
      />
    );
  }

  if (pageState === "requests") {
    return (
      <Requests
        setPage={setPage}
        onBack={back}
        profile={profile}
        page={pageState}
        requestCount={incomingRequestCount}
      />
    );
  }

if (pageState === "chat") {
  return (
    <Chat
      setPage={setPage}
      onBack={() => setPage("discover")}
      profile={profile}
      requestCount={incomingRequestCount}
    />
  );
}

if (pageState === "feedback") {
  return <Feedback setPage={setPage} onBack={() => setPage("chat")} />;
}

  return null;
}

export default App;
