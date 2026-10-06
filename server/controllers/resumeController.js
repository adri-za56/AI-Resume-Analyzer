const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const analyzeResume = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body || {};

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        message: "Resume text and job description are required.",
      });
    }

    const prompt = `
You are an expert technical recruiter.

Analyze the following resume against the job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON in this exact structure:

{
  "matchScore": 0,
  "matchingSkills": [],
  "missingSkills": [],
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}

Rules:
- matchScore must be a number from 0 to 100.
- Keep each list concise.
- Do not invent skills that are not present in the resume.
- Compare the resume against the job requirements carefully.
- Return ONLY JSON.
`;

    let response;

    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });
    } catch (error) {
      console.error("Gemini error:", error);

      if (error.status === 429) {
        return res.status(429).json({
          message:
            "Gemini free-tier limit reached. Please wait about one minute and try again.",
        });
      }

      if (error.status === 503) {
        return res.status(503).json({
          message:
            "Gemini is temporarily busy. Please wait a little and try again.",
        });
      }

      return res.status(500).json({
        message: "AI analysis failed.",
      });
    }

    const text = response.text;

    let analysis;

    try {
      analysis = JSON.parse(text);
    } catch (error) {
      console.error("Invalid Gemini JSON:", text);

      return res.status(500).json({
        message: "Gemini returned an invalid response.",
      });
    }

    res.json({
      message: "Resume analyzed successfully!",
      analysis,
    });
  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      message: "Something went wrong on the server.",
    });
  }
};

module.exports = {
  analyzeResume,
};