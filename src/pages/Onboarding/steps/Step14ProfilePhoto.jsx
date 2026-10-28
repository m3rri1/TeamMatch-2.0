import { Screen } from "../../../components/common/Screen";
import { fileToDataUrl } from "../../../utils/image";

export default function Step14ProfilePhoto({ profile, update, finishProfile }) {
  return (
    <Screen
      kicker="14 · PROFILE PHOTO"
      title="Add two photos."
      subtitle="A clear close-up and a half-body photo help teammates recognize you. You can skip this step for now."
    >
      <div className="photo-upload-grid">
        <div className="photo-upload-card">
          <div className="photo-upload-top">
            <div>
              <span className="photo-number">01</span>
              <h3>Close-up photo</h3>
              <p>Face clearly visible</p>
            </div>

            {profile.photos?.some((photo) => photo.type === "closeup") && (
              <span className="photo-done">✓</span>
            )}
          </div>

          <label className="photo-slot">
            {profile.photos?.find((photo) => photo.type === "closeup") ? (
              <>
                <img
                  src={
                    profile.photos.find((photo) => photo.type === "closeup").url
                  }
                  alt="Close-up preview"
                />
                <span className="photo-change-label">Change photo</span>
              </>
            ) : (
              <>
                <div className="photo-slot-icon">+</div>
                <strong>Add close-up</strong>
                <span>Clear face photo</span>
              </>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                try {
                  const dataUrl = await fileToDataUrl(file);
                  const newPhoto = {
                    name: file.name,
                    url: dataUrl,
                    type: "closeup",
                  };

                  const remaining = profile.photos.filter(
                    (photo) => photo.type !== "closeup"
                  );

                  update("photos", [...remaining, newPhoto]);
                } catch (error) {
                  console.error("Could not load close-up photo.", error);
                }

                e.target.value = "";
              }}
            />
          </label>
        </div>

        <div className="photo-upload-card">
          <div className="photo-upload-top">
            <div>
              <span className="photo-number">02</span>
              <h3>Half-body photo</h3>
              <p>Upper body clearly visible</p>
            </div>

            {profile.photos?.some((photo) => photo.type === "halfbody") && (
              <span className="photo-done">✓</span>
            )}
          </div>

          <label className="photo-slot">
            {profile.photos?.find((photo) => photo.type === "halfbody") ? (
              <>
                <img
                  src={
                    profile.photos.find((photo) => photo.type === "halfbody")
                      .url
                  }
                  alt="Half-body preview"
                />
                <span className="photo-change-label">Change photo</span>
              </>
            ) : (
              <>
                <div className="photo-slot-icon">+</div>
                <strong>Add half-body</strong>
                <span>Upper body visible</span>
              </>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                try {
                  const dataUrl = await fileToDataUrl(file);
                  const newPhoto = {
                    name: file.name,
                    url: dataUrl,
                    type: "halfbody",
                  };

                  const remaining = profile.photos.filter(
                    (photo) => photo.type !== "halfbody"
                  );

                  update("photos", [...remaining, newPhoto]);
                } catch (error) {
                  console.error("Could not load half-body photo.", error);
                }

                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      <div className="photo-tip">
        <strong>Tip:</strong> Use recent photos with good lighting.
      </div>

      <button
        type="button"
        className="skip-btn photo-skip"
        onClick={finishProfile}
      >
        Skip photo and finish →
      </button>
    </Screen>
  );
}
