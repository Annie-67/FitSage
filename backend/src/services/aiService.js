import axios from 'axios';

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'openai';
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.anthropicKey = process.env.ANTHROPIC_API_KEY;
    this.geminiKey = process.env.GEMINI_API_KEY;

    console.log('AI Service initialized:');
    console.log('- Provider:', this.provider);
    console.log('- OpenAI Key:', this.openaiKey ? 'Set (length: ' + this.openaiKey.length + ')' : 'Not set');
    console.log('- Anthropic Key:', this.anthropicKey ? 'Set (length: ' + this.anthropicKey.length + ')' : 'Not set');
    console.log('- Gemini Key:', this.geminiKey ? 'Set (length: ' + this.geminiKey.length + ')' : 'Not set');
  }

  async generateWorkoutPlan(userProfile) {
    const prompt = this.buildWorkoutPrompt(userProfile);

    try {
      let response;
      if (this.provider === 'openai') {
        response = await this.callOpenAI(prompt);
      } else if (this.provider === 'anthropic') {
        response = await this.callAnthropic(prompt);
      } else if (this.provider === 'gemini') {
        response = await this.callGemini(prompt);
      } else {
        throw new Error('Invalid AI provider');
      }

      return this.parseWorkoutPlan(response);
    } catch (error) {
      console.error('AI Service Error:', error.message);
      console.error('Full error:', error.response?.data || error);
      throw new Error(`Failed to generate workout plan: ${error.message}`);
    }
  }

  async generateNutritionPlan(userProfile) {
    const prompt = this.buildNutritionPrompt(userProfile);

    try {
      let response;
      if (this.provider === 'openai') {
        response = await this.callOpenAI(prompt);
      } else if (this.provider === 'anthropic') {
        response = await this.callAnthropic(prompt);
      } else if (this.provider === 'gemini') {
        response = await this.callGeminiNutrition(prompt, userProfile.duration || 1);
      } else {
        throw new Error('Invalid AI provider');
      }

      return this.parseNutritionPlan(response);
    } catch (error) {
      console.error('AI Service Error:', error.message);
      console.error('Full error:', error.response?.data || error);
      throw new Error(`Failed to generate nutrition plan: ${error.message}`);
    }
  }

  async chatWithTrainer(message, conversationHistory = []) {
    const systemPrompt = `You are FitSage, an AI fitness and wellness coach. You provide personalized fitness advice, workout tips, nutrition guidance, and motivation. Be encouraging, knowledgeable, and supportive. Keep responses concise and actionable.`;

    try {
      let response;
      if (this.provider === 'openai') {
        response = await this.callOpenAIChat(systemPrompt, message, conversationHistory);
      } else if (this.provider === 'anthropic') {
        response = await this.callAnthropicChat(systemPrompt, message, conversationHistory);
      } else if (this.provider === 'gemini') {
        response = await this.callGeminiChat(systemPrompt, message, conversationHistory);
      } else {
        throw new Error('Invalid AI provider');
      }

      return response;
    } catch (error) {
      console.error('AI Chat Error:', error.message);
      console.error('Full error:', error.response?.data || error);
      throw new Error(`Failed to get response from AI trainer: ${error.message}`);
    }
  }

  buildWorkoutPrompt(userProfile) {
    const {
      age,
      gender,
      fitnessLevel,
      workoutType,
      reason,
      duration,
      availableHoursPerDay
    } = userProfile;

    // Map workout types to equipment and style
    const workoutTypeMap = {
      'gym-weights': 'gym with weights',
      'gym-bodyweight': 'gym bodyweight only',
      'home': 'home minimal equipment',
      'yoga': 'yoga',
      'pilates': 'pilates'
    };

    const workoutStyle = workoutTypeMap[workoutType] || 'general fitness';
    const hoursPerDay = availableHoursPerDay || 1;
    const minutesPerDay = Math.floor(hoursPerDay * 60);

    return `Create a ${duration || 4}-week workout plan:
- Age: ${age}, Gender: ${gender}, Level: ${fitnessLevel}
- Goal: ${reason || 'fitness'}
- Type: ${workoutStyle}
- Time: ${hoursPerDay} hr/day (${minutesPerDay} min/day)

RULES:
1. Number exercises (1. Name, 2. Name, etc)
2. Include: reps, sets, duration(mins), restTime
3. difficulty must be: "easy", "moderate", or "hard"
4. Each workout day should be around ${minutesPerDay} minutes total
5. 4-5 workout days, 4-5 exercises/day
6. Keep instructions short (1 sentence)

Return ONLY this JSON (no extra text):
{
  "title": "${duration || 4}-Week ${reason || 'Fitness'} Plan",
  "description": "Brief plan description",
  "duration": ${duration || 4},
  "weeklySchedule": [
    {
      "dayOfWeek": "Monday",
      "focus": "Upper Body",
      "exercises": [
        {
          "name": "1. Push-ups",
          "sets": 3,
          "reps": "10-12",
          "duration": 5,
          "restTime": 60,
          "instructions": "Lower chest to ground.",
          "muscleGroups": ["chest", "triceps"],
          "equipment": ["bodyweight"]
        }
      ],
      "totalDuration": ${minutesPerDay},
      "difficulty": "moderate"
    }
  ]
}`;
  }

  buildNutritionPrompt(userProfile) {
    const {
      age,
      gender,
      height,
      weight,
      goals,
      activityLevel,
      dietaryPreferences,
      dietType,
      cuisines,
      allergies,
      mealsPerDay,
      duration,
      activeWorkoutPlan
    } = userProfile;

    // Use defaults if values are missing to prevent NaN
    const userAge = age || 30;
    const userGender = gender || 'male';
    const userWeight = weight || 70;
    const userHeight = height || 170;

    // Calculate BMR and daily caloric needs
    const bmr = userGender === 'male'
      ? 10 * userWeight + 6.25 * userHeight - 5 * userAge + 5
      : 10 * userWeight + 6.25 * userHeight - 5 * userAge - 161;

    // Adjust for activity level and workout plan
    let activityMultiplier = 1.55; // moderately active default
    if (activeWorkoutPlan) {
      const workoutDays = activeWorkoutPlan.weeklySchedule?.filter(day => day.exercises?.length > 0).length || 0;
      if (workoutDays >= 5) activityMultiplier = 1.725; // very active
      else if (workoutDays >= 3) activityMultiplier = 1.55; // moderately active
      else if (workoutDays >= 1) activityMultiplier = 1.375; // lightly active
    }

    const dailyCalories = Math.round(bmr * activityMultiplier);

    // Build workout context
    let workoutContext = '';
    if (activeWorkoutPlan) {
      const workoutDays = activeWorkoutPlan.weeklySchedule?.filter(day => day.exercises?.length > 0).length || 0;
      workoutContext = `
ACTIVE WORKOUT PLAN:
- Plan: ${activeWorkoutPlan.title}
- Frequency: ${workoutDays} days/week
- Level: ${activeWorkoutPlan.fitnessLevel}
- Goal: ${activeWorkoutPlan.weeklySchedule?.[0]?.focus || 'fitness'}
Consider pre/post workout nutrition timing!`;
    }

    // Format cuisines and allergies
    const cuisineList = cuisines?.length > 0 ? cuisines.join(', ') : 'any cuisine';
    const allergyInfo = allergies ? `\nALLERGIES TO AVOID: ${allergies}` : '';

    const targetProtein = Math.round(userWeight * 2.2);
    const targetCarbs = Math.round(dailyCalories * 0.4 / 4);
    const targetFat = Math.round(dailyCalories * 0.3 / 9);
    const caloriesPerMeal = Math.round(dailyCalories / mealsPerDay);

    const perMealProtein = Math.round(targetProtein / mealsPerDay);
    const perMealCarbs = Math.round(targetCarbs / mealsPerDay);
    const perMealFat = Math.round(targetFat / mealsPerDay);

    return `Create 7-day ${dietType} meal plan. ${mealsPerDay} meals/day totaling ${dailyCalories} cal. Cuisines: ${cuisineList}${allergies ? `. AVOID: ${allergies}` : ''}.

CRITICAL - Each meal MUST have nutrition nested with INTEGER numbers:
nutrition: { calories: INT, protein: INT, carbs: INT, fat: INT, fiber: INT }

Example: {"name":"Chicken Rice","type":"lunch","nutrition":{"calories":520,"protein":42,"carbs":58,"fat":16,"fiber":9}}

Return ONLY JSON:
{"title":"${duration}wk ${dietType}","description":"${dietType} ${cuisineList}","duration":${duration || 1},"dailyTargets":{"calories":${dailyCalories},"protein":${targetProtein},"carbs":${targetCarbs},"fat":${targetFat},"fiber":30,"water":3},"weeklyPlan":[{"dayOfWeek":"Monday","totalCalories":${dailyCalories},"totalProtein":${targetProtein},"totalCarbs":${targetCarbs},"totalFat":${targetFat},"totalFiber":30,"meals":[{"name":"Omelette with Toast","type":"breakfast","nutrition":{"calories":${caloriesPerMeal},"protein":${perMealProtein},"carbs":${perMealCarbs},"fat":${perMealFat},"fiber":8}},{"name":"Grilled Chicken Salad","type":"lunch","nutrition":{"calories":${caloriesPerMeal},"protein":${perMealProtein},"carbs":${perMealCarbs},"fat":${perMealFat},"fiber":10}}]},{"dayOfWeek":"Tuesday","totalCalories":${dailyCalories},"totalProtein":${targetProtein},"totalCarbs":${targetCarbs},"totalFat":${targetFat},"totalFiber":30,"meals":[]},{"dayOfWeek":"Wednesday","totalCalories":${dailyCalories},"totalProtein":${targetProtein},"totalCarbs":${targetCarbs},"totalFat":${targetFat},"totalFiber":30,"meals":[]},{"dayOfWeek":"Thursday","totalCalories":${dailyCalories},"totalProtein":${targetProtein},"totalCarbs":${targetCarbs},"totalFat":${targetFat},"totalFiber":30,"meals":[]},{"dayOfWeek":"Friday","totalCalories":${dailyCalories},"totalProtein":${targetProtein},"totalCarbs":${targetCarbs},"totalFat":${targetFat},"totalFiber":30,"meals":[]},{"dayOfWeek":"Saturday","totalCalories":${dailyCalories},"totalProtein":${targetProtein},"totalCarbs":${targetCarbs},"totalFat":${targetFat},"totalFiber":30,"meals":[]},{"dayOfWeek":"Sunday","totalCalories":${dailyCalories},"totalProtein":${targetProtein},"totalCarbs":${targetCarbs},"totalFat":${targetFat},"totalFiber":30,"meals":[]}]}

Complete Tuesday-Sunday with ${mealsPerDay} meals each. Use nutrition:{} structure!`;
  }

  async callOpenAI(prompt) {
    if (!this.openaiKey) {
      throw new Error('OpenAI API key is not set');
    }

    console.log('Calling OpenAI API...');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini', // Using gpt-4o-mini for better availability and lower cost
        messages: [
          {
            role: 'system',
            content: 'You are a professional fitness and nutrition expert. Provide detailed, structured plans in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('OpenAI API response received');
    return response.data.choices[0].message.content;
  }

  async callAnthropic(prompt) {
    if (!this.anthropicKey) {
      throw new Error('Anthropic API key is not set');
    }

    console.log('Calling Anthropic API...');

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `You are a professional fitness and nutrition expert. ${prompt}\n\nProvide your response as a valid JSON object only, with no additional text.`
          }
        ]
      },
      {
        headers: {
          'x-api-key': this.anthropicKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Anthropic API response received');
    return response.data.content[0].text;
  }

  async callOpenAIChat(systemPrompt, userMessage, history) {
    if (!this.openaiKey) {
      throw new Error('OpenAI API key is not set');
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage }
    ];

    console.log('Calling OpenAI API for chat...');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini', // Using gpt-4o-mini for better availability
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('OpenAI chat response received');
    return response.data.choices[0].message.content;
  }

  async callAnthropicChat(systemPrompt, userMessage, history) {
    if (!this.anthropicKey) {
      throw new Error('Anthropic API key is not set');
    }

    const messages = [
      ...history,
      { role: 'user', content: userMessage }
    ];

    console.log('Calling Anthropic API for chat...');

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages
      },
      {
        headers: {
          'x-api-key': this.anthropicKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Anthropic chat response received');
    return response.data.content[0].text;
  }

  async callGemini(prompt) {
    if (!this.geminiKey) {
      throw new Error('Gemini API key is not set');
    }

    console.log('Calling Gemini API...');

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${this.geminiKey}`,
      {
        contents: [{
          parts: [{
            text: `You are a fitness expert. ${prompt}\n\nReturn ONLY valid JSON, no markdown code blocks.`
          }]
        }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 8192
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Gemini API response received');

    // Handle different response structures
    if (response.data.candidates && response.data.candidates[0]) {
      const text = response.data.candidates[0].content.parts[0].text;

      // Check if response was truncated
      if (response.data.candidates[0].finishReason === 'MAX_TOKENS') {
        console.warn('Warning: Gemini response was truncated due to MAX_TOKENS');
        throw new Error('AI response was too long. Please try with a shorter duration or fewer workout days.');
      }

      return text;
    } else if (response.data.content) {
      return response.data.content;
    } else if (response.data.text) {
      return response.data.text;
    } else {
      console.error('Unexpected Gemini response structure:', response.data);
      throw new Error('Unexpected response format from Gemini API');
    }
  }

  async callGeminiChat(systemPrompt, userMessage, history) {
    if (!this.geminiKey) {
      throw new Error('Gemini API key is not set');
    }

    console.log('Calling Gemini API for chat...');

    // Build conversation history for Gemini
    const contents = [];

    // Add history
    history.forEach(msg => {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    });

    // Add current message with system prompt
    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}` }]
    });

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${this.geminiKey}`,
      {
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Gemini chat response received');

    // Handle different response structures
    if (response.data.candidates && response.data.candidates[0]) {
      return response.data.candidates[0].content.parts[0].text;
    } else if (response.data.content) {
      return response.data.content;
    } else if (response.data.text) {
      return response.data.text;
    } else {
      console.error('Unexpected Gemini response structure:', response.data);
      throw new Error('Unexpected response format from Gemini API');
    }
  }

  async callGeminiNutrition(prompt, duration) {
    if (!this.geminiKey) {
      throw new Error('Gemini API key is not set');
    }

    console.log('Calling Gemini API for nutrition plan...');

    // Token limit for 7-day weekly meal plan (regardless of duration)
    // No ingredients, just meal names and nutrition - much smaller response
    const maxOutputTokens = 8192;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${this.geminiKey}`,
      {
        contents: [{
          parts: [{
            text: `You are a nutrition expert. ${prompt}\n\nReturn ONLY valid JSON, no markdown code blocks.`
          }]
        }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: maxOutputTokens
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Gemini nutrition API response received');
    console.log('Token limit used:', maxOutputTokens);

    // Handle different response structures
    if (response.data.candidates && response.data.candidates[0]) {
      const text = response.data.candidates[0].content.parts[0].text;

      // Check if response was truncated
      if (response.data.candidates[0].finishReason === 'MAX_TOKENS') {
        console.warn('Warning: Gemini nutrition response was truncated due to MAX_TOKENS');
        throw new Error('Nutrition plan response was too long. Try reducing the duration or number of meals per day.');
      }

      // Debug: Log the raw response
      console.log('\n=== RAW GEMINI NUTRITION RESPONSE ===');
      console.log('Length:', text.length);
      console.log('First 1000 chars:', text.substring(0, 1000));
      console.log('Last 500 chars:', text.substring(Math.max(0, text.length - 500)));
      console.log('=== END RAW RESPONSE ===\n');

      return text;
    } else if (response.data.content) {
      return response.data.content;
    } else if (response.data.text) {
      return response.data.text;
    } else {
      console.error('Unexpected Gemini response structure:', response.data);
      throw new Error('Unexpected response format from Gemini API');
    }
  }

  parseWorkoutPlan(response) {
    try {
      // If response is already an object, return it
      if (typeof response === 'object' && response !== null) {
        return response;
      }

      // Extract JSON from markdown code blocks if present
      let jsonString = response.trim();

      // Remove markdown code blocks more aggressively
      jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*$/g, '').replace(/```/g, '');

      // Clean up the string
      jsonString = jsonString.trim();

      // Try to parse
      const parsed = JSON.parse(jsonString);
      return parsed;
    } catch (error) {
      console.error('Failed to parse workout plan:', error);
      console.error('Response type:', typeof response);
      console.error('Response length:', typeof response === 'string' ? response.length : 'N/A');
      if (typeof response === 'string') {
        console.error('First 500 chars:', response.substring(0, 500));
        console.error('Last 500 chars:', response.substring(Math.max(0, response.length - 500)));
      }
      throw new Error('Invalid workout plan format received from AI');
    }
  }

  parseNutritionPlan(response) {
    try {
      // If response is already an object, return it
      if (typeof response === 'object' && response !== null) {
        return response;
      }

      // Extract JSON from markdown code blocks if present
      let jsonString = response.trim();

      // Remove markdown code blocks more aggressively
      jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*$/g, '').replace(/```/g, '');

      // Clean up the string
      jsonString = jsonString.trim();

      // Try to parse
      const parsed = JSON.parse(jsonString);

      // Debug: Check first meal in Monday
      console.log('\n=== PARSED NUTRITION PLAN DEBUG ===');
      if (parsed.weeklyPlan && parsed.weeklyPlan[0] && parsed.weeklyPlan[0].meals && parsed.weeklyPlan[0].meals[0]) {
        const firstMeal = parsed.weeklyPlan[0].meals[0];
        console.log('First meal (Monday breakfast):');
        console.log('  Name:', firstMeal.name);
        console.log('  Has nutrition object?', !!firstMeal.nutrition);
        if (firstMeal.nutrition) {
          console.log('  Nutrition.Calories:', firstMeal.nutrition.calories, typeof firstMeal.nutrition.calories);
          console.log('  Nutrition.Protein:', firstMeal.nutrition.protein, typeof firstMeal.nutrition.protein);
          console.log('  Nutrition.Carbs:', firstMeal.nutrition.carbs, typeof firstMeal.nutrition.carbs);
          console.log('  Nutrition.Fat:', firstMeal.nutrition.fat, typeof firstMeal.nutrition.fat);
          console.log('  Nutrition.Fiber:', firstMeal.nutrition.fiber, typeof firstMeal.nutrition.fiber);
        } else {
          console.log('  Direct Calories:', firstMeal.calories, typeof firstMeal.calories);
          console.log('  Direct Protein:', firstMeal.protein, typeof firstMeal.protein);
        }
      }
      console.log('=== END PARSED DEBUG ===\n');

      return parsed;
    } catch (error) {
      console.error('Failed to parse nutrition plan:', error);
      console.error('Response type:', typeof response);
      console.error('Response length:', typeof response === 'string' ? response.length : 'N/A');
      if (typeof response === 'string') {
        console.error('First 500 chars:', response.substring(0, 500));
        console.error('Last 500 chars:', response.substring(Math.max(0, response.length - 500)));
      }
      throw new Error('Invalid nutrition plan format received from AI');
    }
  }
}

// Export the class, not an instance
// This will be instantiated after environment variables are loaded
export default AIService;
