import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [message, setMessage] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a resume first.");
      return;
    }

    if (!jobDescription.trim()) {
      setMessage("Please enter the job description.");
      return;
    }

    setLoading(true);
    setMessage("");
    setAnalysis(null);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    try {
      const response = await fetch(
        "http://localhost:5000/api/resume/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Analysis failed.");
        return;
      }

      setMessage(data.message);
      setAnalysis(data.analysis);
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1>AI Resume Analyzer</h1>

      <p>
        Upload your resume and compare it with a job description using AI.
      </p>

      <hr />

      <h3>1. Upload Resume</h3>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      {file && <p>Selected: {file.name}</p>}

      <h3>2. Job Description</h3>

      <textarea
        placeholder="Paste the job description here..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        rows={12}
        style={{
          width: "100%",
          padding: "12px",
          boxSizing: "border-box",
          fontSize: "15px",
        }}
      />

      <br />
      <br />

      <button
        onClick={handleUpload}
        disabled={loading}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {message && (
        <p style={{ marginTop: "20px" }}>
          <strong>{message}</strong>
        </p>
      )}

      {analysis && (
        <div style={{ marginTop: "30px" }}>
          <h2>Analysis Result</h2>

          <h3>Match Score</h3>

          <div
            style={{
              fontSize: "40px",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            {analysis.matchScore}%
          </div>

          <h3>Matching Skills</h3>
          <ul>
            {analysis.matchingSkills?.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          <h3>Missing Skills</h3>
          <ul>
            {analysis.missingSkills?.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          <h3>Strengths</h3>
          <ul>
            {analysis.strengths?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3>Weaknesses</h3>
          <ul>
            {analysis.weaknesses?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3>Suggestions</h3>
          <ul>
            {analysis.suggestions?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;