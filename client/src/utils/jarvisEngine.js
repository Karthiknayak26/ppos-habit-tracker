/**
 * Jarvis Engine - Natural Language Processing
 * Converts raw transcripts into structured Intents.
 */

const NAVIGATE_INTENTS = [
  { keywords: ['dashboard', 'home'], path: '/' },
  { keywords: ['weekly planner', 'tasks', 'schedule'], path: '/planner' },
  { keywords: ['weekly plans', 'intentions', 'plan'], path: '/plans' },
  { keywords: ['habits', 'habit tracker'], path: '/habits' },
  { keywords: ['analytics', 'insights', 'stats', 'report'], path: '/analytics' },
  { keywords: ['notes', 'notebook', 'meeting'], path: '/notes' },
  { keywords: ['finance', 'budget', 'expenses'], path: '/finance' },
  { keywords: ['achievements', 'badges'], path: '/achievements' },
  { keywords: ['settings', 'profile'], path: '/settings' },
];

export const processJarvisCommand = (transcript) => {
  const lowerText = transcript.toLowerCase().trim();

  // 1. Navigation Intents
  if (lowerText.includes('open ') || lowerText.includes('go to ') || lowerText.includes('show ')) {
    for (const nav of NAVIGATE_INTENTS) {
      if (nav.keywords.some(keyword => lowerText.includes(keyword))) {
        return {
          type: 'NAVIGATE',
          path: nav.path,
          response: `Opening ${nav.keywords[0]}...`
        };
      }
    }
  }

  // 2. Task Management Intents
  // Example: "add task tomorrow called DSA practice"
  // Example: "create a task for gym"
  if (lowerText.includes('add a task') || lowerText.includes('create a task') || lowerText.includes('add task')) {
    
    // Extract title (extremely basic heuristic: take everything after "called" or "for")
    let title = "New Task";
    if (lowerText.includes("called ")) {
      title = lowerText.split("called ")[1].trim();
    } else if (lowerText.includes("for ")) {
      title = lowerText.split("for ")[1].trim();
    }

    // Attempt to extract Day (0-6)
    let day = new Date().getDay() - 1; // Default to today
    if (day === -1) day = 6;
    
    if (lowerText.includes('tomorrow')) {
      day = (day + 1) % 7;
    } else if (lowerText.includes('monday')) day = 0;
    else if (lowerText.includes('tuesday')) day = 1;
    else if (lowerText.includes('wednesday')) day = 2;
    else if (lowerText.includes('thursday')) day = 3;
    else if (lowerText.includes('friday')) day = 4;
    else if (lowerText.includes('saturday')) day = 5;
    else if (lowerText.includes('sunday')) day = 6;

    // Capitalize Title
    title = title.charAt(0).toUpperCase() + title.slice(1);
    // Cleanup title if it contains day words
    const cleanTitle = title.replace(/(tomorrow|today|on monday|on tuesday|on wednesday|on thursday|on friday|on saturday|on sunday)/gi, '').trim();

    return {
      type: 'CREATE_TASK',
      payload: {
        name: cleanTitle || "New Task",
        day: day
      },
      response: `Task created: ${cleanTitle || "New Task"}.`
    };
  }

  // 3. Complete Task/Habit Intents
  // "mark gym complete" or "mark water habit complete" or "run has complete"
  if (
    lowerText.includes('complete') && 
    (lowerText.includes('mark') || lowerText.includes('is') || lowerText.includes('has'))
  ) {
    let target = lowerText
      .replace(/\bmark\b/gi, '')
      .replace(/\bis\b/gi, '')
      .replace(/\bhas\b/gi, '')
      .replace(/\bcomplete\b/gi, '')
      .replace(/\bas\b/gi, '')
      .replace(/\bhabit\b/gi, '')
      .replace(/\btask\b/gi, '')
      .trim();
    
    return {
      type: 'COMPLETE_ITEM',
      targetName: target,
      response: `Marking ${target || "item"} complete.`
    };
  }

  // 4. Delete Intents
  if (lowerText.includes('delete') || lowerText.includes('remove')) {
    let target = lowerText.replace('delete', '').replace('remove', '').replace('the', '').replace('task', '').replace('habit', '').replace('note', '').trim();
    return {
      type: 'DELETE_ITEM',
      targetName: target,
      response: `Deleting ${target}.`
    };
  }

  // 5. Create Habit Intents
  if (lowerText.includes('create a habit') || lowerText.includes('add a habit') || lowerText.includes('add habit')) {
    let title = lowerText.replace('create a habit', '').replace('add a habit', '').replace('add habit', '').replace('for', '').replace('to', '').trim();
    title = title.charAt(0).toUpperCase() + title.slice(1);
    return {
      type: 'CREATE_HABIT',
      payload: { name: title },
      response: `I have created a new habit for ${title}.`
    };
  }

  // 6. Finance Intents
  if (lowerText.includes('add expense') || lowerText.includes('add income')) {
    const isExpense = lowerText.includes('expense');
    const amountMatch = lowerText.match(/\d+/);
    let amount = amountMatch ? parseInt(amountMatch[0]) : 0;
    
    let description = "Transaction";
    if (lowerText.includes('for')) {
      description = lowerText.split('for')[1].trim();
    } else if (lowerText.includes('from')) {
      description = lowerText.split('from')[1].trim();
    }

    description = description.charAt(0).toUpperCase() + description.slice(1);

    return {
      type: 'ADD_TRANSACTION',
      payload: {
        type: isExpense ? 'expense' : 'income',
        amount: amount,
        description: description,
        category: 'Other'
      },
      response: `I have logged an ${isExpense ? 'expense' : 'income'} of ${amount} for ${description}.`
    };
  }

  // 7. Notes Intents
  if (lowerText.includes('create a note') || lowerText.includes('add a note')) {
    let title = lowerText.replace('create a note', '').replace('add a note', '').replace('to', '').replace('about', '').trim();
    title = title.charAt(0).toUpperCase() + title.slice(1);
    return {
      type: 'CREATE_NOTE',
      payload: {
        title: title || "New Note",
        content: "Created by Jarvis."
      },
      response: `I've opened a new note for ${title}.`
    };
  }

  // 8. Agentic "Plan My Week"
  if (lowerText.includes('plan my week')) {
    return {
      type: 'PLAN_WEEK',
      response: "I have automatically planned your week with standard productivity tasks."
    };
  }

  // 9. Fallback / AI Interaction
  if (lowerText.includes('how am i doing') || lowerText.includes('productivity score')) {
    return {
      type: 'READ_ANALYTICS',
      response: `Let me check your stats...`
    };
  }
  
  if (lowerText.includes('hello') || lowerText.includes('hi jarvis')) {
    return {
      type: 'GREETING',
      response: 'Hello. I am Jarvis, your productivity operating system. How can I help you today?'
    };
  }

  // 5. Unknown
  return {
    type: 'UNKNOWN',
    response: "I didn't quite catch that. Could you repeat?"
  };
};
