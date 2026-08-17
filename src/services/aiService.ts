import { ExamAnalysis, PredictedQuestion } from "../types";

export async function analyzeCourseMaterials(
  courseName: string,
  materialsText: string
): Promise<{ analysis: Omit<ExamAnalysis, 'courseId' | 'updatedAt'>, questions: Omit<PredictedQuestion, 'id' | 'courseId' | 'createdAt'>[] }> {
  
  const response = await fetch("/api/analyze-materials", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ courseName, materialsText })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Server error: ${response.statusText}`);
  }

  return response.json();
}

