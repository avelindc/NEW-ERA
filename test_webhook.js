const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function mockWebhook() {
  const req = {
    message: {
      message_id: 1234,
      chat: { id: 8722534833 }, // Bot's chat ID for testing? I need the user's chat ID, but we can't send message without correct chat ID. Let's just test DB logic.
      photo: [
        { file_id: "AgACAgUAAxkBAAPXZt...", file_size: 1000 }
      ],
      caption: "/setbg"
    }
  };
  
  const update = req;
  const message = update.message;
  if (message.photo && message.caption) {
    const caption = message.caption.trim().toLowerCase();
    console.log("Caption is:", caption);
    if (caption === "/setbg") {
        console.log("Caption matched!");
    }
  }
}
mockWebhook();