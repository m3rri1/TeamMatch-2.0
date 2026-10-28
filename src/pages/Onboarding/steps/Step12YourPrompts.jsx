import { Screen } from "../../../components/common/Screen";

export default function Step12YourPrompts({ profile, update }) {
  return (
    <Screen
      kicker="12 · YOUR PROMPTS"
      title="Show people what you're about."
      subtitle={`Choose at least 2 prompts for your ${profile.focusType || "selected"} profile and answer them in your own words.`}
    >
      <div className="prompt-builder">
        {(() => {
          const promptBank = {
            "Passionate Interest": [
              "The thing I could talk about for hours is…",
              "I’m currently obsessed with learning…",
              "A cause or topic I genuinely care about…",
              "Something I’d love to teach someone is…",
              "The skill I want to get really good at is…",
              "My ideal side quest would be…",
            ],
            "Startup Interest": [
              "The startup idea I can’t stop thinking about is…",
              "I’m looking for a teammate who can…",
              "The problem I’d love to build a solution for is…",
              "My biggest strength as a founder/teammate is…",
              "The product I wish existed is…",
              "If I had 30 days to build something, I’d build…",
            ],
            "Investment Interest": [
              "The kind of startup I’d love to invest in is…",
              "An industry I’m watching closely is…",
              "What makes a startup interesting to me is…",
              "The founder quality I value most is…",
              "A problem I believe is worth backing is…",
              "If I had to bet on one emerging space, it would be…",
            ],
          };

          const prompts =
            promptBank[profile.focusType] || promptBank["Passionate Interest"];

          return [0, 1].map((index) => {
            const current = profile.prompts?.[index] || {
              question: "",
              answer: "",
            };

            return (
              <div className="prompt-card" key={index}>
                <div className="prompt-card-header">
                  <span>Prompt {index + 1}</span>
                  {current.question && (
                    <span className="prompt-selected">✓ Selected</span>
                  )}
                </div>

                <label>
                  <span className="prompt-label">Choose a question</span>
                  <select
                    value={current.question}
                    onChange={(e) => {
                      const nextPrompts = [...(profile.prompts || [])];
                      nextPrompts[index] = {
                        question: e.target.value,
                        answer: current.answer,
                      };
                      update("prompts", nextPrompts);
                    }}
                  >
                    <option value="">Select a prompt…</option>
                    {prompts.map((question) => (
                      <option
                        key={question}
                        value={question}
                        disabled={prompts.some(
                          (item, promptIndex) =>
                            promptIndex !== index &&
                            profile.prompts?.[promptIndex]?.question === item
                        )}
                      >
                        {question}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="prompt-label">Your answer</span>
                  <textarea
                    rows="4"
                    maxLength="300"
                    placeholder="Write something that feels like you…"
                    value={current.answer}
                    onChange={(e) => {
                      const nextPrompts = [...(profile.prompts || [])];
                      nextPrompts[index] = {
                        question: current.question,
                        answer: e.target.value,
                      };
                      update("prompts", nextPrompts);
                    }}
                  />
                  <div className="field-footer">
                    <span>Minimum 10 characters</span>
                    <strong>{current.answer.length}/300</strong>
                  </div>
                </label>
              </div>
            );
          });
        })()}

        <div className="prompt-requirement">
          <strong>2 prompts required</strong>
          <span>Pick two different questions and answer both.</span>
        </div>
      </div>
    </Screen>
  );
}
