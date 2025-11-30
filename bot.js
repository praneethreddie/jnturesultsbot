require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');

// Bot token from BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN is missing in .env file!');
  process.exit(1);
}

const API_BASE_URL = 'https://jntuhresults.dhethi.com/api';

// Create bot instance
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 JNTUH Results Bot is running...');

// /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
👋 *Welcome to JNTUH Results Bot!*

I can help you fetch your academic results quickly.

*How to use:*
📝 Simply send me your roll number (e.g., 22A51A0501)

*Commands:*
/start - Show this welcome message
/help - Get help and usage instructions

Let's get started! Send your roll number now. 🎓
  `;

  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
📚 *JNTUH Results Bot - Help*

*How to get your results:*
1. Send your 10-digit roll number
2. Wait a few seconds while I fetch your results
3. View your complete academic performance!

*Examples of valid roll numbers:*
• 22A51A0501 (B.Tech R22)
• 18A51A0501 (B.Tech R18)
• 22R51A0501 (B.Pharmacy)
• 22E51A0501 (MBA)

*Available Commands:*
/start - Welcome message
/help - This help message

*Need more help?*
Visit: https://jntuhresults.vercel.app

Happy learning! 🎓✨
  `;

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Format result data for display
function formatResult(data) {
  const details = data.Details || data.details;
  const results = data.Results || data.results;

  if (!details || !results) {
    return '❌ No results found for this roll number.';
  }

  let message = `
📋 *Student Details*
━━━━━━━━━━━━━━━━━━━━━
👤 Name: ${details.NAME || details.Name || details.name}
🎓 Roll No: ${details.rollNumber || details.Roll_No || details.rollNo || details.htno}
🏫 College: ${details.collegeCode || details.COLLEGE_CODE}
👨‍👦 Father: ${details.fatherName || details.FATHER_NAME}
`;

  let semesterData = [];

  if (results.semesters && Array.isArray(results.semesters)) {
    semesterData = results.semesters.map(s => ({
      sem: s.semester,
      sgpa: s.semesterSGPA
    }));
  } else {
    // Fallback for other structures (if any)
    const sgpaMap = results.semesterSGPA || results.SGPA || results.sgpa || {};
    let semKeys = Object.keys(sgpaMap);
    if (semKeys.length === 0) {
      semKeys = Object.keys(results).filter(key =>
        !['Total', 'total', 'CGPA', 'cgpa', 'credits', 'grades', 'backlogs', 'Details', 'details', 'semesterSGPA', 'semesters'].includes(key)
      );
    }
    semKeys = [...new Set(semKeys)].filter(k => k).sort();
    semesterData = semKeys.map(sem => {
      let sgpa = sgpaMap[sem];
      if (!sgpa && results[sem]) {
        const semData = results[sem];
        sgpa = semData.SGPA || semData.sgpa || semData.Cgpa || semData.CGPA;
        if (Array.isArray(semData) && semData.length > 0) {
          sgpa = semData[0].sgpa || semData[0].SGPA;
        }
      }
      return { sem, sgpa };
    });
  }

  if (semesterData.length === 0) {
    message += '⚠️ No semester results available yet.\n';
  } else {
    message += '📊 *Semester Results*\n━━━━━━━━━━━━━━━━━━━━━\n\n';
    semesterData.forEach(item => {
      message += `📌 *Semester ${item.sem}*\n`;
      message += `   SGPA: ${item.sgpa || 'N/A'}\n\n`;
    });
  }

  const totalCGPA = results.Total || results.total || results.CGPA || results.cgpa;
  if (totalCGPA && typeof totalCGPA !== 'object') {
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🏆 *Overall CGPA: ${totalCGPA}*\n`;
  }

  if (results.credits) {
    message += `📚 Total Credits: ${results.credits}\n`;
  }
  if (results.backlogs !== undefined) {
    message += `⚠️ Backlogs: ${results.backlogs}\n`;
  }

  message += `\n✅ Results fetched successfully!`;

  return message;
}

// Generate Backlog Report
function getBacklogReport(data) {
  const details = data.Details || data.details;
  const results = data.Results || data.results;
  const rollNumber = details.rollNumber || details.Roll_No;

  let report = `📜 *Backlog Report for ${rollNumber}*\n━━━━━━━━━━━━━━━━━━━━━\n\n`;

  let backlogCount = 0;
  let hasBacklogs = false;

  if (results.semesters && Array.isArray(results.semesters)) {
    results.semesters.forEach(sem => {
      const failedSubjects = sem.subjects.filter(sub =>
        ['F', 'Ab', 'AB', 'ABSENT', 'FAIL'].includes(sub.grades) || sub.grades === 'F'
      );

      if (failedSubjects.length > 0) {
        hasBacklogs = true;
        report += `📌 *Semester ${sem.semester}*\n`;
        failedSubjects.forEach(sub => {
          backlogCount++;
          report += `   ❌ ${sub.subjectName} (${sub.subjectCode})\n`;
        });
        report += '\n';
      }
    });
  }

  if (!hasBacklogs) {
    return `🎉 *Congratulations!* \n\nNo backlogs found for Roll No: ${rollNumber}.\nYou are all clear! 🌟`;
  }

  report += `━━━━━━━━━━━━━━━━━━━━━\n`;
  report += `⚠️ Total Backlogs: ${backlogCount}`;

  return report;
}

// Handle callback queries (button clicks)
bot.on('callback_query', async (callbackQuery) => {
  const message = callbackQuery.message;
  const data = callbackQuery.data;
  const chatId = message.chat.id;

  if (data.startsWith('backlog_')) {
    const rollNumber = data.split('_')[1];

    // Fetch data again (or cache it - but fetching is safer for stateless)
    try {
      const response = await axios.get(`${API_BASE_URL}/getAcademicResult?rollNumber=${rollNumber}`);
      const resultData = response.data;
      const backlogReport = getBacklogReport(resultData);

      await bot.sendMessage(chatId, backlogReport, { parse_mode: 'Markdown' });
    } catch (error) {
      await bot.sendMessage(chatId, '❌ Failed to fetch backlog report. Please try again.');
    }
  }

  // Answer callback to stop loading animation
  bot.answerCallbackQuery(callbackQuery.id);
});

// Handle roll number messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text.startsWith('/')) return;

  const rollNumber = text.trim().toUpperCase();

  if (rollNumber.length !== 10) {
    bot.sendMessage(chatId, '❌ Invalid roll number format! Please enter a 10-digit roll number.');
    return;
  }

  const fetchingMsg = await bot.sendMessage(chatId, '⏳ Fetching your results...', { parse_mode: 'Markdown' });

  try {
    const response = await axios.get(`${API_BASE_URL}/getAcademicResult?rollNumber=${rollNumber}`, { timeout: 30000 });
    await bot.deleteMessage(chatId, fetchingMsg.message_id);

    const data = response.data;

    // Write full response to file for debugging
    try {
      fs.writeFileSync('api_response.json', JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Error saving API response:', err);
    }

    if (data && (data.details || data.Details)) {
      const formattedResult = formatResult(data);

      // Inline keyboard with Backlog Report button
      const opts = {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📜 Backlog Report', callback_data: `backlog_${rollNumber}` },
              { text: '🌐 View on Web', url: 'https://jntuhresults.vercel.app/academicresult' }
            ]
          ]
        }
      };

      await bot.sendMessage(chatId, formattedResult, opts);
    } else {
      await bot.sendMessage(chatId, '❌ No results found.');
    }
  } catch (error) {
    try { await bot.deleteMessage(chatId, fetchingMsg.message_id); } catch (e) { }
    await bot.sendMessage(chatId, '❌ Failed to fetch results. Please try again later.');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down bot...');
  bot.stopPolling();
  process.exit(0);
});
