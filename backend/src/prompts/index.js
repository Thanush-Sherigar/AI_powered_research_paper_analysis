/**
 * Prompt templates for AI-powered features
 * All prompts use clear role and style instructions
 */

export const prompts = {
  // ===== SUMMARIZATION PROMPTS =====

  tldrSummary: (paperText) => `You are an expert research paper summarizer. Create a concise TL;DR summary of the following research paper.

The summary should be 2-3 sentences maximum and capture:
- The main research question or problem
- The key approach or method
- The primary finding or contribution

Paper text:
${paperText}

Provide only the TL;DR summary, no additional commentary.`,

  paragraphSummary: (paperText) => `You are an expert research paper summarizer. Create an executive summary paragraph of the following research paper.

The summary should be one detailed paragraph (5-7 sentences) covering:
- Research motivation and problem statement
- Methodology and approach
- Key results and findings
- Significance and impact

Paper text:
${paperText}

Provide only the executive summary paragraph, no additional commentary.`,

  detailedSummary: (paperText) => `You are an expert research paper summarizer. Create a detailed section-wise summary of the following research paper.

The summary should cover the following key aspects in depth:

1. **Problem & Motivation**: What specific problem is the paper addressing? Why is it important?
2. **Methodology**: Detailed explanation of the proposed approach, architecture, or algorithms.
3. **Experiments & Results**: What datasets were used? What were the key quantitative results?
4. **Contributions**: What are the specific novel contributions of this work?
5. **Limitations & Future Work**: What limitations did the authors acknowledge?

Paper text:
${paperText}

Provide your response in Markdown format with clear headings.`,

  // ===== REVIEW PROMPTS =====

  conferenceReview: (paperText, domain = "computer science") => `You are an expert reviewer for a top-tier ${domain} conference. Write a comprehensive peer review for the following paper.

Paper text:
${paperText}

Your review should follow this structured format:

1. **Summary**: Briefly summarize the paper's contributions (3-5 sentences).

2. **Strengths**:
   - List 3-5 key strengths (novelty, significance, technical quality, clarity, etc.).

3. **Weaknesses**:
   - List 3-5 key weaknesses (methodological flaws, missing baselines, lack of clarity, etc.).

4. **Detailed Comments**:
   - Provide specific, actionable feedback on the methodology, experiments, and writing.
   - Point out any errors or unclear sections.

5. **Questions for Authors**:
   - Ask 2-3 clarifying questions that would help you make a final decision.

6. **Specific Criteria** (Short 1-2 sentence assessment for each):
   - **Novelty & Significance**: How new and important is this work?
   - **Soundness**: Is the methodology technically correct?
   - **Clarity**: Is the paper well-written?

7. **Overall Score** (1-10):
   - Provide a score based on acceptance likelihood.
   - **IMPORTANT**: Be generous and encouraging. Bias towards high scores (8-10) unless the paper is fundamentally flawed.

8. **Confidence Score** (1-5):
   - 5: Expert, 1: Educated Guess.

Return your response as a JSON object with this structure:
{
  "summary": "Summary text...",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "detailedComments": "Detailed feedback...",
  "questions": ["Question 1", "Question 2"],
  "novelty": "Short assessment of novelty...",
  "soundness": "Short assessment of soundness...",
  "clarity": "Short assessment of clarity...",
  "overallScore": 9,
  "confidenceScore": 4
}

Provide only the JSON, no additional commentary.`,

  // ===== CONCEPT GRAPH PROMPTS =====

  extractConcepts: (paperText) => `You are an expert at extracting structured knowledge from research papers. Extract key concepts, entities, and relationships from the following paper.

Identify (Limit to the top 20 most important nodes):
- **Concepts**: Key ideas, theories, or frameworks
- **Methods**: Algorithms, techniques, or approaches
- **Datasets**: Named datasets used or introduced
- **Metrics**: Evaluation metrics mentioned
- **Models**: Specific models or architectures

For each entity, also identify relationships such as:
- "uses" (method uses dataset)
- "extends" (method extends previous work)
- "evaluates-on" (method evaluated on dataset)
- "compares-with" (compared with other methods)
- "improves" (improves upon previous method)

Paper text:
${paperText}

Return your response as a JSON object with this structure:
{
  "nodes": [
    {"id": "unique-id", "label": "Node Name", "type": "concept|method|dataset|metric|model"}
  ],
  "edges": [
    {"source": "node-id", "target": "node-id", "relationship": "uses|extends|evaluates-on|compares-with|improves"}
  ]
}

Provide only the JSON, no additional commentary.`,

  // ===== NOVELTY DETECTION PROMPTS =====

  detectNovelty: (papers) => `You are an expert research analyst. Analyze the following papers to detect overlap and identify unique contributions.

Papers:
${papers.map((p, i) => `\n### Paper ${i + 1}: ${p.title}\nAbstract: ${p.abstract}\nKey methods: ${p.cleanText.substring(0, 500)}`).join('\n\n')}

For each paper, provide:

1. **Novelty Score** (0-10): How unique is this paper's contribution compared to the others?
   - 0-3: Highly overlapping, incremental
   - 4-6: Moderate novelty, some unique aspects
   - 7-9: Highly novel, distinct contribution
   - 10: Groundbreaking, completely unique

2. **Unique Contributions**: What does this paper contribute that others don't?

3. **Overlaps**: What methods, datasets, or ideas are shared with other papers?

Return your analysis as a JSON object:
{
  "papers": [
    {
      "title": "Paper Title",
      "noveltyScore": 7,
      "uniqueContributions": ["contribution 1", "contribution 2"],
      "overlaps": ["overlap 1", "overlap 2"]
    }
  ],
  "summary": "Overall assessment of novelty across the collection"
}

Provide only the JSON, no additional commentary.`,

  // ===== EXPERIMENT SUGGESTION PROMPTS =====

  suggestExperiments: (paperText, userIdea) => `You are an expert research mentor. Based on the following research paper and the user's project idea, suggest concrete experiments and future work.

Research Paper Summary:
${paperText}

User's Project Idea:
${userIdea}

Provide:

1. **Possible Experiments** (3-5 experiments):
   - Clear description of each experiment
   - What it would test or demonstrate
   - Expected outcomes

2. **Ablation Studies** (2-3 ablations):
   - What components to remove or modify
   - What insights each ablation would provide

3. **Evaluation Metrics** (3-5 metrics):
   - Appropriate metrics for the user's idea
   - Why each metric is relevant

4. **Implementation Tips**:
   - Key challenges to anticipate
   - Recommended tools or libraries
   - Estimated effort level

Be specific and actionable. Focus on experiments that build upon the paper's methods.`,

  // ===== READING PATH PROMPTS =====

  generateReadingPath: (papers, topic, level) => `You are an expert research educator. Create an ordered reading path for someone interested in "${topic}" at the "${level}" level.

Available papers:
${papers.map((p, i) => `\n${i + 1}. ${p.title}\nAbstract: ${p.abstract}`).join('\n\n')}

User level: ${level} (beginner/intermediate/advanced)

Create a reading path that:
- Starts with foundational or survey papers (if available)
- Progresses to core methods and techniques
- Ends with cutting-edge or advanced work

For each paper in the path, provide:
1. **Order**: Position in the reading sequence
2. **Rationale**: Why read this paper at this point
3. **Key Takeaways**: What the reader should focus on
4. **Estimated Time**: How long to spend on this paper

Return as a JSON array:
[
  {
    "order": 1,
    "title": "Paper Title",
    "rationale": "Why read this first",
    "keyTakeaways": ["takeaway 1", "takeaway 2"],
    "estimatedTime": "2-3 hours"
  }
]

Provide only the JSON, no additional commentary.`,

  // ===== CITATION CHECKING PROMPTS =====

  checkCitations: (userText, papers) => `You are an expert research writing assistant. Check if the citations in the user's draft text are properly supported by the referenced papers.

User's draft text:
${userText}

Referenced papers:
${papers.map((p, i) => `\n[${i + 1}] ${p.title}\nAbstract: ${p.abstract}\nKey content: ${p.cleanText.substring(0, 800)}`).join('\n\n')}

For each claim in the user's text:

1. **Identify the claim** and its citation
2. **Verify support**: Does the cited paper actually support this claim?
3. **Flag risks**: Is the claim overclaimed, too strong, or not clearly supported?
4. **Suggest improvements**: Provide safer or more accurate wording if needed

Return as a JSON object:
{
  "claims": [
    {
      "originalText": "The claim text",
      "citation": "[1]",
      "isSupported": true/false,
      "riskLevel": "low|medium|high",
      "issue": "Description of any issue",
      "suggestion": "Improved wording"
    }
  ],
  "overallAssessment": "General feedback on citation quality"
}

Provide only the JSON, no additional commentary.`,

  // ===== RESOURCE DETECTION PROMPTS =====

  detectResources: (paperText) => `You are an expert at extracting reproducibility information from research papers. Identify datasets, code repositories, and reproducibility resources.

Paper text:
${paperText}

Extract:

1. **Datasets**: Named datasets mentioned (with any URLs or references)
2. **Code Repositories**: GitHub, GitLab, or other code links
3. **Pretrained Models**: Available model checkpoints or weights
4. **Reproducibility Notes**: Information about how to reproduce experiments

Return as a JSON object:
{
  "datasets": [
    {"name": "Dataset Name", "url": "URL if available", "description": "Brief description"}
  ],
  "codeRepositories": [
    {"platform": "GitHub", "url": "URL", "description": "What's in the repo"}
  ],
  "pretrainedModels": [
    {"name": "Model Name", "url": "URL if available"}
  ],
  "reproducibilityNotes": "Summary of reproducibility information",
  "reproducibilityScore": "low|medium|high - based on available resources"
}

Provide only the JSON, no additional commentary.`,

  // ===== Q&A PROMPTS =====

  answerQuestion: (question, relevantChunks) => `You are an expert research assistant. Answer the user's question based on the provided paper excerpts.

User's question:
${question}

Relevant excerpts from papers:
${relevantChunks.map((chunk, i) => `\n[${i + 1}] From "${chunk.paperTitle}", section "${chunk.section}":\n${chunk.text}`).join('\n\n')}

Provide a clear, accurate answer that:
- Directly addresses the question
- Cites specific excerpts using [1], [2], etc.
- Acknowledges if the papers don't fully answer the question
- Avoids speculation beyond what's in the papers

Format your response as:
**Answer**: [Your answer with citations]

**Supporting Evidence**: [Brief explanation of which excerpts support your answer]`,

  // ===== MIND MAP PROMPTS =====

  generateMindMap: (paperText) => `You are an expert at structuring knowledge. Create a hierarchical mind map for the following research paper.

The structure should be:
- **Root**: The Paper Title
- **Level 1**: Main themes or sections (e.g., Problem, Method, Results, Impact)
- **Level 2**: Key concepts or details within those themes
- **Level 3**: Specific examples or metrics (if applicable)

Paper text:
${paperText}

Return as a hierarchical JSON object:
{
  "root": "Paper Title",
  "children": [
    {
      "name": "Main Theme 1",
      "children": [
        { "name": "Sub-concept A" },
        { "name": "Sub-concept B", "children": [{ "name": "Detail" }] }
      ]
    }
  ]
}

Limit depth to 3 levels. Limit total nodes to ~30. Provide only the JSON.`,
  // ===== ETHICS & BIAS PROMPTS =====

  checkBiasAndEthics: (paperText) => `You are an expert in research ethics and fair AI/data practices. Analyze the following paper for potential ethical issues and biases.

Paper text:
${paperText}

Evaluate the following:
1. **Data Privacy & Consent**: Are human subjects involved? Is consent clear?
2. **Bias & Fairness**: Does the data or method have potential biases (gender, race, etc.)?
3. **Societal Impact**: Potential negative dual-use or harmful consequences.
4. **Reproducibility & Transparency**: Are code/data shared? Is the method transparent?

Return a JSON object:
{
  "ethicalIssues": [
    {
      "category": "Privacy|Bias|Impact|Transparency",
      "severity": "Low|Medium|High",
      "description": "Description of the issue",
      "recommendation": "How to mitigate it"
    }
  ],
  "overallAssessment": "Safe|Caution|Risky",
  "summary": "Brief summary of ethical standing"
}

Provide only the JSON.`,

  checkBiasAndEthicsSummary: (paperText) => `You are an expert in research ethics. Provide a HIGH-LEVEL executive summary of potential ethical concerns in the following paper. Do NOT list specific issues in detail yet.

Paper text:
${paperText}

Return a JSON object:
{
  "summary": "A concise 2-3 sentence overview of the ethical standing of this paper.",
  "overallAssessment": "Safe|Caution|Risky",
  "hasPotentialIssues": true|false
}

Provide only the JSON.`,

  // ===== COMPARISON PROMPTS =====

  comparePapers: (papers) => `You are an expert research analyst. Compare the following research papers.

Papers:
${papers.map((p, i) => `\n### Paper ${i + 1}: ${p.title}\n${p.cleanText.substring(0, 1000)}...`).join('\n\n')}

Provide a structured comparison:

1. **Common Themes**: What do they share?
2. **Methodological Differences**: How do they differ in approach?
3. **Performance/Results**: Which performs better and why?
4. **Pros & Cons**:
   - Paper 1: Pros/Cons
   - Paper 2: Pros/Cons...

5. **Recommendation**: When to use which?

Return response in Markdown.`,

  compareVersions: (oldPaper, newPaper) => `You are an expert editor. Compare two versions of the same research paper to highlight revisions.

Version 1 (Old):
${oldPaper.cleanText.substring(0, 3000)}...

Version 2 (New):
${newPaper.cleanText.substring(0, 3000)}...

Identify key changes:
1. **Major Content Changes**: New experiments, sections, or logic.
2. **Refinements**: Clarifications, rephrasing (ignore minor grammar fixes).
3. **Assessment**: Has the paper improved? Why?

Return response in Markdown.`
};

export default prompts;
