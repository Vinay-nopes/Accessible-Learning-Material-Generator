import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured on the server. Please add GEMINI_API_KEY to your env variables.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const { text, feature, engine, language } = await request.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please enter educational content.' },
        { status: 400 }
      );
    }

    if (!feature || !['simplify', 'summary', 'important_points', 'quiz'].includes(feature)) {
      return NextResponse.json(
        { error: 'Invalid feature selected.' },
        { status: 400 }
      );
    }

    // Intercept local model requests
    if (feature === 'simplify' && engine === 'finetuned') {
      try {
        const pyResponse = await fetch('http://127.0.0.1:5001/simplify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });

        const pyData = await pyResponse.json();

        if (!pyResponse.ok) {
          return NextResponse.json(
            { error: pyData.error || 'Text simplification failed. Please try again.' },
            { status: pyResponse.status }
          );
        }

        return NextResponse.json({ result: pyData.result });
      } catch (pyErr) {
        console.error('Failed to communicate with local Hugging Face model:', pyErr);
        return NextResponse.json(
          { error: 'Unable to load the Fine-Tuned Model.' },
          { status: 500 }
        );
      }
    }

    let prompt = '';
    let responseConfig: Record<string, unknown> = {};

    switch (feature) {
      case 'simplify':
        prompt = `You are an educational assistant for students with dyslexia. Rewrite the content using simple English, short sentences, bullet points, and easy-to-understand language. Keep the original educational value intact, but make it very easy to read and digest.

Content to simplify:
${text}`;
        break;

      case 'summary':
        prompt = `Generate a concise student-friendly summary in bullet points (between 5 to 10 points) of the following content. Use clear language and highlight key terms where appropriate.

Content to summarize:
${text}`;
        break;

      case 'important_points':
        prompt = `Extract the most important concepts, key definitions, and revision points from the following content. Present them as a structured list with visual emphasis (e.g. bold terms).

Content to analyze:
${text}`;
        break;

      case 'quiz':
        prompt = `Generate 5 multiple-choice questions (MCQs) with 4 options each based on the content below. Provide the correct answer as a 0-based index.

Content:
${text}`;
        
        // Use Structured Outputs to enforce JSON format
        responseConfig = {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'ARRAY',
            description: 'List of exactly 5 multiple-choice questions based on the text',
            items: {
              type: 'OBJECT',
              properties: {
                question: { type: 'STRING', description: 'The question text' },
                options: {
                  type: 'ARRAY',
                  items: { type: 'STRING' },
                  description: 'Exactly 4 options for the multiple choice question',
                },
                correctAnswer: {
                  type: 'INTEGER',
                  description: '0-based index of the correct option (0 to 3)',
                },
              },
              required: ['question', 'options', 'correctAnswer'],
            },
          },
        };
        break;
    }

    const languageNames: Record<string, string> = {
      hi: 'Hindi',
      kn: 'Kannada',
    };

    const targetLang = language && language !== 'en' ? languageNames[language] : null;
    if (targetLang) {
      prompt += `\n\nIMPORTANT: You must write the final response, including all explanations, notes, and quiz elements (questions, options, answers), entirely in ${targetLang}.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: responseConfig,
    });

    const resultText = response.text;

    if (!resultText) {
      throw new Error('No content returned from Gemini API.');
    }

    if (feature === 'quiz') {
      try {
        const parsedQuiz = JSON.parse(resultText);
        return NextResponse.json({ result: parsedQuiz });
      } catch (parseError) {
        console.error('Failed to parse quiz JSON from Gemini:', resultText, parseError);
        return NextResponse.json(
          { error: 'Unable to generate response in JSON format. Please try again.' },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ result: resultText });

  } catch (error: unknown) {
    console.error('Gemini API Route Error:', error);
    const message = error instanceof Error ? error.message : 'Unable to generate response. Please try again.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
