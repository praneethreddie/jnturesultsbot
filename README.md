# JNTUH Results Telegram Bot

A Telegram bot that fetches JNTUH student academic results when provided with a roll number.

## Features

- ✅ Fetch complete academic results by roll number
- ✅ Display student details (Name, College Code, Father's Name)
- ✅ Show semester-wise CGPA and credits
- ✅ Display overall CGPA
- ✅ Error handling for invalid roll numbers and server issues
- ✅ Simple and user-friendly interface

## Prerequisites

- Node.js (v14 or higher)
- A Telegram account
- Telegram Bot Token (from BotFather)

## Setup Instructions

### 1. Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` command
3. Follow the instructions:
   - Choose a name for your bot (e.g., "JNTUH Results Bot")
   - Choose a username (must end in 'bot', e.g., "jntuh_results_bot")
4. BotFather will give you a **Bot Token**. Save this token!

### 2. Install Dependencies

```bash
cd telegram-results-bot
npm install
```

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file and add your bot token:
   ```
   TELEGRAM_BOT_TOKEN=your_actual_bot_token_here
   API_BASE_URL=https://jntuhresults.vercel.app/api
   ```

### 4. Run the Bot

```bash
npm start
```

You should see: `🤖 JNTUH Results Bot is running...`

## Usage

1. Open Telegram and search for your bot's username
2. Start a chat with the bot
3. Send `/start` to see welcome message
4. Send your 10-digit roll number (e.g., `22A51A0501`)
5. Wait for the bot to fetch and display your results!

## Available Commands

- `/start` - Display welcome message
- `/help` - Show help and usage instructions

## Supported Roll Number Formats

- B.Tech: `22A51A0501`, `18A51A0501`
- B.Pharmacy: `22R51A0501`
- MBA: `22E51A0501`
- M.Tech: `22D51A0501`
- M.Pharmacy: `22S51A0501`

## Example Interaction

```
You: /start
Bot: 👋 Welcome to JNTUH Results Bot!
     Send your roll number to get started...

You: 22A51A0501
Bot: ⏳ Fetching your results...

Bot: 📋 Student Details
     ━━━━━━━━━━━━
     👤 Name: JOHN DOE
     🎓 Roll No: 22A51A0501
     🏫 College: ABC123
     
     📊 Semester Results
     ━━━━━━━━━━━━
     📌 Semester 1-1
        CGPA: 9.5
        Credits: 22
     
     🏆 Overall CGPA: 9.5
```

## Troubleshooting

### Bot not responding
- Check if the bot is running (`npm start`)
- Verify your bot token in `.env` file is correct
- Ensure internet connection is stable

### "Invalid roll number" error
- Roll number must be exactly 10 characters
- Use uppercase letters (bot converts automatically)

### Results not found
- Verify the roll number is correct
- Check if results are published on JNTUH website
- Try again after some time

## Deployment Options

### Local (Your Computer)
- Keep the bot running on your machine
- Simple but requires your computer to stay on

### Cloud Hosting (Always Online)
- **Free Options:**
  - Render.com
  - Railway.app
  - Fly.io
  - Heroku (with free dyno hours)

### Deployment to Render (Recommended)

1. Create account on [Render.com](https://render.com)
2. Create new "Web Service"
3. Connect your GitHub repository
4. Set build command: `cd telegram-results-bot && npm install`
5. Set start command: `cd telegram-results-bot && npm start`
6. Add environment variable: `TELEGRAM_BOT_TOKEN`
7. Deploy!

## API Reference

The bot uses the JNTUH Results API:
```
GET https://jntuhresults.vercel.app/api/academicresult?htno={rollnumber}
```

## Contributing

Feel free to submit issues and pull requests!

## License

MIT

## Credits

- Results API: https://jntuhresults.vercel.app
- Developer: Praneeth reddy 
- Credits(https://github.com/ThilakReddyy) - for providing JNTU backend for searching results

---

Made with ❤️ for JNTUH students
# jnturesultsbot
